import fs from "node:fs/promises";
import path from "node:path";
import { homedir } from "node:os";
import pMap, { pMapIterable } from "p-map";
import groupBy from "object.groupby";
import { glob } from "glob";
import type { SerializedCourse } from "./serialized-course";
import type { StudiesTree } from "./studies-tree";

type TreeNode = {
  name: string;
  iconName: string;
  children: Record<number, TreeNode>;

  credits?: number;
  courseTypeDto?: string;
};

async function transformDir(dir: string) {
  const courseFiles = (
    await glob("course*.json", {
      withFileTypes: true,
      cwd: dir,
    })
  ).filter((f) => f.isFile());
  console.log("#CourseFiles:", courseFiles.length);

  let progress = 0;

  const studies = [];

  for await (const studyInfos of await pMapIterable(
    courseFiles,
    async (file) => {
      const content = await fs.readFile(file.fullpath(), "utf-8");
      process.stdout.write(`\r${++progress}`);
      return JSON.parse(content) as SerializedCourse;
    },
    { concurrency: 10 }
  )) {
    for (const {
      coCurriculumPositionDto: studyInfo,
    } of studyInfos.curriculumPositions) {
      studies.push({
        studyNameInfo: studyInfo.studyNameInfoDto,
        curriculumPositionPath: [
          ...studyInfo.curriculumPositionPathDto.path,
          {
            elementId: studyInfos.courseDetail.cpCourseDto.id,
            designation: "",
            name: {
              value: studyInfos.courseDetail.cpCourseDto.courseTitle.value,
            },
            description: {
              value: studyInfos.courseDetail.cpCourseDto.courseTitle.value,
            },
            iconName: "stp_empty" as "stp_0", // TODO create icon for this
            credits:
              studyInfo.creditsDto?.value ??
              studyInfos.courseDetail.cpCourseDto.ectsCredits,
            courseTypeDto:
              studyInfos.courseDetail.cpCourseDto.courseTypeDto.courseTypeName
                .value,
          } satisfies (typeof studyInfo.curriculumPositionPathDto.path)[number] & {
            credits: number | undefined;
            courseTypeDto: string;
          },
        ],
      });
    }
  }
  process.stdout.write("\n");

  console.log("#StudyInfos:", Object.keys(studies).length);

  function objectMap<T, U>(
    obj: Record<string, T>,
    fn: (value: T, key: string, index: number) => U
  ): Record<string, U> {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)])
    );
  }

  type PathEntry = (typeof studies)[number]["curriculumPositionPath"][number];
  function arrayToTree(data: PathEntry[][]): Record<number, TreeNode> {
    const root: TreeNode = { name: "root", iconName: "", children: {} };
    for (const path of data) {
      let node = root;
      try {
        for (const entry of path) {
          const { elementId, name, iconName } = entry;
          if (!node.children.hasOwnProperty(elementId)) {
            node.children[elementId] = {
              name: name.value,
              iconName,
              children: {},
            };
            if ("credits" in entry) {
              node.children[elementId].credits = entry.credits;
              node.children[elementId].courseTypeDto = entry.courseTypeDto;
            }
          }
          node = node.children[elementId];
        }
      } catch (e) {
        console.error(path, e);
        process.exit(1);
      }
    }
    return root.children;
  }

  const studiesTree = objectMap(
    groupBy(studies, (s) => s.studyNameInfo.curriculumVersionId),
    (group) => ({
      studyNameInfo: group[0].studyNameInfo,
      currics: arrayToTree(group.map((s) => s.curriculumPositionPath)),
    })
  ) satisfies StudiesTree;
  console.log("#Studies:", Object.keys(studiesTree).length);

  await fs.writeFile(
    path.join(dir, "studiesTree.json"),
    JSON.stringify(studiesTree, null, 2)
  );
}

async function main() {
  const semesters = await fs.readFile(
    path.join(homedir(), ".cache/campusoffline/semesters.json"),
    "utf-8"
  );
  const semesterDirs = (JSON.parse(semesters) as { id: number }[]).map((s) =>
    path.join(homedir(), ".cache/campusoffline/", s.id.toString())
  );
  await pMap(semesterDirs, transformDir);
}

await main();
