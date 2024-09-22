import fs from "node:fs/promises";
import path from "node:path";
import { homedir } from "node:os";
import ky from "ky";
import pMap from "p-map";
import type { CoursesResponse } from "./courses-resp";
import type { SemestersResponse } from "./semesters-resp";
import type { CourseResponse } from "./course-resp";
import type { CurriculumPositionsResponse } from "./curriculum-pos-resp";

const MAX_PAGE_SIZE = 100;
const CONCURRENCY_LIMIT = 100;
const client = ky.create({
  prefixUrl: "https://online.rwth-aachen.de/RWTHonline/ee/rest/",
});

function range(start: number, stop: number, step = 1) {
  if (stop === undefined) {
    stop = start;
    start = 0;
  }

  const output = [];
  if (step > 0) {
    for (let i = start; i < stop; i += step) {
      output.push(i);
    }
  } else {
    for (let i = start; i > stop; i += step) {
      output.push(i);
    }
  }

  return output;
}

async function main() {
  const semesterData = await client
    .get("slc.lib.tm/semesters/student")
    .json<SemestersResponse>()
    .then((data) => data.semesters);
  console.log("#Semesters:", semesterData.length);

  const recentSemesters = semesterData.filter(
    (s) =>
      new Date().getFullYear() -
        new Date(Date.parse(s.endOfAcademicSemester.value)).getFullYear() <=
      3
  );
  console.log("#Recent Semesters:", recentSemesters.length);

  const semesterIdAndCourseCnt = await pMap(recentSemesters, async ({ id }) => {
    const courseCnt = await client
      .get("slc.tm.cp/student/courses", {
        searchParams: {
          $skip: 0,
          $top: 1,
          $filter: `termId-eq=${id}`,
        },
      })
      .json<CoursesResponse>()
      .then((data) => data.totalCount);
    return { id, courseCnt };
  });
  console.log(
    "#Courses:",
    semesterIdAndCourseCnt.reduce((acc, { courseCnt }) => acc + courseCnt, 0)
  );

  const searchParams = semesterIdAndCourseCnt.flatMap(({ id, courseCnt }) =>
    range(0, courseCnt, MAX_PAGE_SIZE).map(($skip) => ({
      $skip,
      $top: MAX_PAGE_SIZE,
      $filter: `termId-eq=${id}`,
    }))
  );
  console.log("#Requests (to fetch course ids):", searchParams.length);

  const courses = (
    await pMap(
      searchParams,
      async (searchParams) =>
        await client
          .get("slc.tm.cp/student/courses", { searchParams })
          .json<CoursesResponse>()
          .then((data) => data.courses),
      { concurrency: CONCURRENCY_LIMIT }
    )
  ).flat();
  console.log("#Requests (to fetch course data):", courses.length);

  const fetchAndSave = async (courseId: number, storagePath: string) => {
    try {
      const resp = await client
        .get(`slc.tm.cp/student/courses/${courseId}`)
        .json<CourseResponse>();
      console.assert(
        resp.resource.length === 1,
        `Course ${courseId} does not have exactly one resource`
      );
      const courseData = {
        courseDetail: resp.resource[0].content.cpCourseDetailDto,
        curriculumPositions: (
          await client
            .get(
              `slc.cm.curriculumposition/positions/${courseId}/course/allCurriculumPositions`
            )
            .json<CurriculumPositionsResponse>()
        ).resource.map((res) => res.content),
      };

      // drop some keys we currently do not need to reduce file size
      const replacer = (k: string, v: any): any =>
        [
          "translations",
          "coType",
          "cpCourseDescriptionDto",
          "sameCourseDtos",
          "organisationResponsibleDto",
          "courseLanguageDtos",
          "lectureships",
          "reference",
          "validFrom",
        ].includes(k)
          ? undefined
          : v;
      const semesterId =
        courseData.courseDetail.cpCourseDto.semesterDto.id.toString();
      await fs.writeFile(
        path.join(storagePath, semesterId, `course${courseId}.json`),
        JSON.stringify(courseData, replacer)
      );
      return "succ";
    } catch (e) {
      console.error(e);
      return "err";
    }
  };

  const storagePath = path.join(homedir(), ".cache/campusoffline/");
  await pMap(
    recentSemesters,
    async ({ id }) =>
      await fs.mkdir(path.join(storagePath, id.toString()), {
        recursive: true,
      })
  );
  const resps = await pMap(
    courses,
    (course) => fetchAndSave(course.id, storagePath),
    { concurrency: CONCURRENCY_LIMIT }
  );

  await fs.writeFile(
    path.join(storagePath, `semesters.json`),
    JSON.stringify(recentSemesters)
  );

  console.log("#Succ:", resps.filter((resp) => resp === "succ").length);
  console.log("#Err:", resps.filter((resp) => resp === "err").length);
}

console.time("fetching");
await main();
console.timeEnd("fetching");
