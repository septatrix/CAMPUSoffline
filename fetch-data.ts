import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import type { ReadableStream } from "node:stream/web";
import ky from "ky";
import pMap from "p-map";

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
    .json<{ semesters: { id: number }[] }>()
    .then((data) => data.semesters.slice(0, 2));
  console.log("#Semesters:", semesterData.length);

  const semesterIdAndCourseCnt = await pMap(semesterData, async ({ id }) => {
    const courseCnt = await client
      .get("slc.tm.cp/student/courses", {
        searchParams: { $skip: 0, $top: 1, $filter: `termId-eq=${id}` },
      })
      .json<{ totalCount: number }>()
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
          .json<{ resource: any[] }>()
          .then((data) => data.resource),
      { concurrency: CONCURRENCY_LIMIT }
    )
  ).flat();
  console.log("#Requests (to fetch course data):", courses.length);

  const fetchAndSave = async (courseId: string, storagePath: string) => {
    try {
      const courseData = (
        await client
          .get(`slc.tm.cp/student/courses/${courseId}`)
          .json<{ resource: { content: any }[] }>()
      ).resource[0].content; // TODO check if #resource always == 1
      // const resp = await client.get(
      //   `slc.cm.curriculumposition/positions/${courseId}/course/allCurriculumPositions`
      // );
      const dropped_keys = [
        "translations",
        "coType",
        "cpCourseDescriptionDto",
        "sameCourseDtos",
        "organisationResponsibleDto",
        "courseLanguageDtos",
        "lectureships",
      ];
      await fs.writeFile(
        path.join(
          storagePath,
          courseData.cpCourseDetailDto.cpCourseDto.semesterDto.id.toString(),
          `course${courseId}.json`
        ),
        JSON.stringify(
          courseData,
          (k, v) => (dropped_keys.includes(k) ? undefined : v),
          2
        )
      );
      return "succ";
    } catch (e) {
      console.error(e);
      return "err";
    }
  };

  const storagePath = path.join(os.homedir(), ".cache/campusoffline/");
  await pMap(
    semesterData,
    async ({ id }) =>
      await fs.mkdir(path.join(storagePath, id.toString()), {
        recursive: true,
      })
  );
  const resps = await pMap(
    courses,
    (course) => fetchAndSave(course.content.cpCourseDto.id, storagePath),
    { concurrency: CONCURRENCY_LIMIT }
  );
  console.log("#Succ:", resps.filter((resp) => resp === "succ").length);
  console.log("#Meh:", resps.filter((resp) => resp === "meh").length);
  console.log("#Err:", resps.filter((resp) => resp === "err").length);
}

console.time("fetching");
await main();
console.timeEnd("fetching");
