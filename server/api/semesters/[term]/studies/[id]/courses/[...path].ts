import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { StudiesTree } from "~/studies-tree";

const studyInfos: Record<string, StudiesTree> = {};

export default defineEventHandler(async (event) => {
  const term = getRouterParam(event, "term")!;
  if (!(term in studyInfos)) {
    studyInfos[term] = JSON.parse(
      await readFile(
        path.join(homedir(), ".cache/campusoffline", term, "studiesTree.json"),
        { encoding: "utf-8" }
      )
    ) as StudiesTree;
  }
  const data = studyInfos[term];

  const id = getRouterParam(event, "id")!;
  if (!data[id]) {
    throw createError({
      statusCode: 404,
      statusMessage: "Study Not Found",
    });
  }

  // TODO clean this up
  const [prefix, ...rest] = getRouterParam(event, "path")?.split("/")!;
  return rest.reduce(
    (obj, key) => obj["children"][key],
    data[id].currics[prefix]
  );
});
