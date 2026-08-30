import fs from "node:fs/promises";
import path from "node:path";
import { homedir } from "node:os";
import { DatabaseSync } from "node:sqlite";
import { glob } from "glob";
import type { SerializedCourse } from "./serialized-course";
import type { Semester } from "./semesters-resp";
import { summarizeAppointments, summarizeExams } from "./appointments.ts";

const CACHE_DIR = path.join(homedir(), ".cache/campusoffline");
const OUT_DIR = path.resolve("public/db");
const OUT_FILE = path.join(OUT_DIR, "courses.sqlite3");

type SemestersCache = {
  fetchedAt: string;
  semesters: Semester[];
};

const SCHEMA = `
CREATE TABLE semesters (
  id          INTEGER PRIMARY KEY,
  key         TEXT,
  designation TEXT,
  type        TEXT,
  start_date  TEXT,
  end_date    TEXT
);

CREATE TABLE courses (
  id                     INTEGER PRIMARY KEY,
  semester_id            INTEGER REFERENCES semesters(id),
  course_number          TEXT,
  title                  TEXT,
  ects_credits           REAL,
  course_type_key        TEXT,
  course_type_name       TEXT,
  sws                    TEXT,
  exam_method            TEXT,
  registration_available INTEGER,
  elearning_active       INTEGER
);

CREATE TABLE curricula (
  curriculum_version_id  INTEGER PRIMARY KEY,
  name                   TEXT,
  study_identifier       TEXT,
  displayed_type         TEXT,
  version_identification TEXT,
  supported              INTEGER
);

-- Adjacency list of the curriculum tree. parent_element_id is NULL for roots.
CREATE TABLE curriculum_nodes (
  curriculum_version_id INTEGER REFERENCES curricula(curriculum_version_id),
  element_id            INTEGER,
  name                  TEXT,
  icon_name             TEXT,
  parent_element_id     INTEGER,
  PRIMARY KEY (curriculum_version_id, element_id)
);

-- Fact table: one row per place a course sits inside a study's curriculum.
CREATE TABLE course_placements (
  course_id               INTEGER REFERENCES courses(id),
  curriculum_version_id   INTEGER REFERENCES curricula(curriculum_version_id),
  leaf_element_id         INTEGER,
  credits                 REAL,
  subject_type            TEXT,
  semester_recommendation TEXT
);

CREATE TABLE course_groups (
  id             INTEGER PRIMARY KEY,
  course_id      INTEGER REFERENCES courses(id),
  name           TEXT,
  standard_group INTEGER
);

-- Recurring slots of a course:
-- the individual dates of a term collapsed into one row per weekday/time/room,
-- cancelled dates excluded.
CREATE TABLE course_appointments (
  course_id    INTEGER REFERENCES courses(id),
  group_name   TEXT,
  weekday      TEXT,
  weekday_sort INTEGER,
  starts_at    TEXT,
  ends_at      TEXT,
  room         TEXT,
  occurrences  INTEGER
);

-- Exam dates of a course, one row per date it is written on. Only exams which
-- are already scheduled appear here.
CREATE TABLE exam_offers (
  course_id          INTEGER REFERENCES courses(id),
  exam_date          TEXT,
  starts_at          TEXT,
  ends_at            TEXT,
  rooms              TEXT,
  info               TEXT,
  exam_type          TEXT,
  registration_start TEXT,
  registration_end   TEXT,
  participants       INTEGER,
  max_participants   INTEGER
);

CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT);
`;

const INDEXES = `
CREATE INDEX idx_courses_semester    ON courses(semester_id);
CREATE INDEX idx_courses_title       ON courses(title);
CREATE INDEX idx_placements_course   ON course_placements(course_id);
CREATE INDEX idx_placements_curric   ON course_placements(curriculum_version_id, leaf_element_id);
CREATE INDEX idx_nodes_parent        ON curriculum_nodes(curriculum_version_id, parent_element_id);
CREATE INDEX idx_groups_course       ON course_groups(course_id);
CREATE INDEX idx_appointments_course ON course_appointments(course_id);
CREATE INDEX idx_appointments_slot   ON course_appointments(weekday_sort, starts_at);
CREATE INDEX idx_exams_course        ON exam_offers(course_id);
CREATE INDEX idx_exams_date          ON exam_offers(exam_date, starts_at);
`;

async function main() {
  const cache = JSON.parse(
    await fs.readFile(path.join(CACHE_DIR, "semesters.json"), "utf-8")
  ) as SemestersCache;

  await fs.rm(OUT_FILE, { force: true });
  await fs.mkdir(OUT_DIR, { recursive: true });

  const db = new DatabaseSync(OUT_FILE);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec(SCHEMA);

  const insertSemester = db.prepare(
    `INSERT OR REPLACE INTO semesters
       (id, key, designation, type, start_date, end_date)
     VALUES (@id, @key, @designation, @type, @start_date, @end_date)`
  );
  const insertCourse = db.prepare(
    `INSERT OR REPLACE INTO courses
       (id, semester_id, course_number, title, ects_credits, course_type_key,
        course_type_name, sws, exam_method, registration_available,
        elearning_active)
     VALUES (@id, @semester_id, @course_number, @title, @ects_credits,
        @course_type_key, @course_type_name, @sws, @exam_method,
        @registration_available, @elearning_active)`
  );
  const insertCurriculum = db.prepare(
    `INSERT OR IGNORE INTO curricula
       (curriculum_version_id, name, study_identifier, displayed_type,
        version_identification, supported)
     VALUES (@curriculum_version_id, @name, @study_identifier, @displayed_type,
        @version_identification, @supported)`
  );
  const insertNode = db.prepare(
    `INSERT OR IGNORE INTO curriculum_nodes
       (curriculum_version_id, element_id, name, icon_name, parent_element_id)
     VALUES (@curriculum_version_id, @element_id, @name, @icon_name,
        @parent_element_id)`
  );
  const insertGroup = db.prepare(
    `INSERT OR IGNORE INTO course_groups
       (id, course_id, name, standard_group)
     VALUES (@id, @course_id, @name, @standard_group)`
  );
  const insertAppointment = db.prepare(
    `INSERT INTO course_appointments
       (course_id, group_name, weekday, weekday_sort, starts_at, ends_at, room,
        occurrences)
     VALUES (@course_id, @group_name, @weekday, @weekday_sort, @starts_at,
        @ends_at, @room, @occurrences)`
  );
  const insertExam = db.prepare(
    `INSERT INTO exam_offers
       (course_id, exam_date, starts_at, ends_at, rooms, info, exam_type,
        registration_start, registration_end, participants, max_participants)
     VALUES (@course_id, @exam_date, @starts_at, @ends_at, @rooms, @info,
        @exam_type, @registration_start, @registration_end, @participants,
        @max_participants)`
  );
  const insertPlacement = db.prepare(
    `INSERT INTO course_placements
       (course_id, curriculum_version_id, leaf_element_id, credits,
        subject_type, semester_recommendation)
     VALUES (@course_id, @curriculum_version_id, @leaf_element_id, @credits,
        @subject_type, @semester_recommendation)`
  );

  for (const s of cache.semesters) {
    insertSemester.run({
      id: s.id,
      key: s.key,
      designation: s.semesterDesignation?.value ?? null,
      type: s.semesterType,
      start_date: s.startOfAcademicSemester?.value ?? null,
      end_date: s.endOfAcademicSemester?.value ?? null,
    });
  }

  let courseCount = 0;
  let placementCount = 0;
  let appointmentCount = 0;
  let examCount = 0;

  db.exec("BEGIN");
  try {
    for (const { id } of cache.semesters) {
      const dir = path.join(CACHE_DIR, id.toString());
      const courseFiles = (
        await glob("course[0-9]*.json", { withFileTypes: true, cwd: dir })
      ).filter((f) => f.isFile());

      for (const file of courseFiles) {
        const course = JSON.parse(
          await fs.readFile(file.fullpath(), "utf-8")
        ) as SerializedCourse;
        const c = course.courseDetail.cpCourseDto;

        insertCourse.run({
          id: c.id,
          semester_id: c.semesterDto.id,
          course_number: c.courseNumber?.courseNumber ?? null,
          title: c.courseTitle.value,
          ects_credits: c.ectsCredits ?? null,
          course_type_key: c.courseTypeDto?.key ?? null,
          course_type_name: c.courseTypeDto?.courseTypeName?.value ?? null,
          // SST is the course norm config carrying the SWS ("Semesterwochenstunden")
          sws: c.courseNormConfigs?.find((n) => n.key === "SST")?.value ?? null,
          exam_method: c.examinationMethodName?.value ?? null,
          registration_available: c.registrationAvailable ? 1 : 0,
          elearning_active: c.eLearningActive ? 1 : 0,
        });
        courseCount++;

        for (const group of course.courseGroups ?? []) {
          insertGroup.run({
            id: group.id,
            course_id: c.id,
            name: group.name,
            // RWTHonline spells booleans J/N (Ja/Nein)
            standard_group: group.standardgroupFlag === "J" ? 1 : 0,
          });
        }
        for (const slot of summarizeAppointments(course.courseGroups ?? [])) {
          insertAppointment.run({
            course_id: c.id,
            group_name: slot.group ?? null,
            weekday: slot.weekday,
            weekday_sort: slot.weekdaySort,
            starts_at: slot.from,
            ends_at: slot.to,
            room: slot.room,
            occurrences: slot.count,
          });
          appointmentCount++;
        }

        for (const offer of course.examOffers ?? []) {
          // Summarizing a single offer keeps the date handling in one place;
          // it yields nothing for exams which are not scheduled yet
          const [exam] = summarizeExams([offer]);
          if (!exam) {
            continue;
          }
          insertExam.run({
            course_id: c.id,
            exam_date: exam.date,
            starts_at: exam.from,
            ends_at: exam.to,
            rooms: exam.rooms.join(", ") || null,
            info: exam.info,
            exam_type: offer.examType?.value ?? null,
            registration_start: offer.registrationDateStart?.value ?? null,
            registration_end: offer.registrationDateEnd?.value ?? null,
            participants: offer.numberOfParticipants ?? null,
            max_participants: offer.maxNumberOfParticipants ?? null,
          });
          examCount++;
        }

        for (const { coCurriculumPositionDto: pos } of course.curriculumPositions) {
          const study = pos.studyNameInfoDto;
          insertCurriculum.run({
            curriculum_version_id: study.curriculumVersionId,
            name: study.name.value,
            study_identifier: study.studyIdentifier,
            displayed_type: study.displayedType.value,
            version_identification: study.curriculumVersionIdentification,
            supported: study.supported ? 1 : 0,
          });

          const pathEntries = pos.curriculumPositionPathDto.path;
          let parentElementId: number | null = null;
          for (const entry of pathEntries) {
            insertNode.run({
              curriculum_version_id: study.curriculumVersionId,
              element_id: entry.elementId,
              name: entry.name.value,
              icon_name: entry.iconName,
              parent_element_id: parentElementId,
            });
            parentElementId = entry.elementId;
          }

          insertPlacement.run({
            course_id: c.id,
            curriculum_version_id: study.curriculumVersionId,
            leaf_element_id: parentElementId,
            credits: pos.creditsDto?.value ?? c.ectsCredits ?? null,
            subject_type: pos.subjectTypeDto?.value?.value ?? null,
            semester_recommendation:
              pos.semesterRecommendationDto?.keyWinterstarter ?? null,
          });
          placementCount++;
        }
      }
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }

  db.exec(INDEXES);

  const insertMeta = db.prepare(
    "INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)"
  );
  insertMeta.run("fetched_at", cache.fetchedAt);
  insertMeta.run("generated_at", new Date().toISOString());

  db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
  db.exec("PRAGMA journal_mode = DELETE");
  db.exec("VACUUM");
  db.exec("PRAGMA optimize");
  db.close();

  const { size } = await fs.stat(OUT_FILE);
  console.log("#Semesters:", cache.semesters.length);
  console.log("#Courses:", courseCount);
  console.log("#Placements:", placementCount);
  console.log("#Appointments:", appointmentCount);
  console.log("#Exam dates:", examCount);
  console.log("DB written:", OUT_FILE, `(${(size / 1e6).toFixed(2)} MB)`);
}

await main();
