import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { pMapIterable } from "p-map";
import groupBy from "object.groupby";
import type { Course, PathEntry } from "./course";

async function main() {
  const courseFiles = (
    await fs.readdir(path.join(os.homedir(), ".cache/campusoffline/"), {
      withFileTypes: true,
    })
  ).filter((f) => f.isFile());
  console.log("#CourseFiles:", courseFiles.length);

  let progress = 0;

  const studies = [];

  const dropped_keys = ["translations", "coType", "reference", "validFrom"];
  for await (const studyInfos of await pMapIterable(
    courseFiles,
    async (file) => {
      const content = await fs.readFile(
        path.join(file.path, file.name),
        "utf-8"
      );
      process.stdout.write(`\r${++progress}`);
      const course = (
        JSON.parse(content, (k, v) =>
          dropped_keys.includes(k) ? undefined : v
        ) as Course
      ).resource;
      return course.map((c) => c.content.coCurriculumPositionDto);
    },
    { concurrency: 10 }
  )) {
    for (const studyInfo of studyInfos) {
      studies.push({
        studyNameInfo: studyInfo.studyNameInfoDto,
        curriculumPositionPath: studyInfo.curriculumPositionPathDto.path,
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

  type TreeNode = {
    name: string;
    iconName: string;
    children: Record<number, TreeNode>;
  };

  function arrayToTree(data: PathEntry[][]): Record<number, TreeNode> {
    const root: TreeNode = { name: "root", iconName: "", children: {} };
    for (const path of data) {
      let node = root;
      try {
        for (const { elementId, name, iconName } of path) {
          if (!node.children.hasOwnProperty(elementId)) {
            node.children[elementId] = {
              name: name.value,
              iconName,
              children: {},
            };
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
  );
  console.log("#Studies:", Object.keys(studiesTree).length);

  await fs.writeFile(
    path.join("data", "studiesTree.json"),
    JSON.stringify(studiesTree, null, 2)
  );
}

await main();
