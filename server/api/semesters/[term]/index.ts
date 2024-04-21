import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

export default defineEventHandler(async (event) => {
  const term = getRouterParam(event, "term")!;
  const data = JSON.parse(
    await readFile(
      path.join(homedir(), ".cache/campusoffline", term, "studiesTree.json"),
      { encoding: "utf-8" }
    )
  );
  return Object.values(data).map((s: any) => s.studyNameInfo);
});
