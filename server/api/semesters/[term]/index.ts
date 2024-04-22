import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { StudiesTree } from "~/studies-tree";

const studyInfos: Record<string, StudiesTree[string]["studyNameInfo"][]> = {};

export default defineEventHandler(async (event) => {
  const term = getRouterParam(event, "term")!;
  if (!(term in studyInfos)) {
    const data = JSON.parse(
      await readFile(
        path.join(homedir(), ".cache/campusoffline", term, "studiesTree.json"),
        { encoding: "utf-8" }
      )
    ) as StudiesTree;
    studyInfos[term] = Object.values(data).map((s) => s.studyNameInfo);
  }
  return studyInfos[term];
});
