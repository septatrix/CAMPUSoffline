import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import type { StudiesTree } from "~/studies-tree";

const data = JSON.parse(
  readFileSync(path.join(homedir(), ".cache/campusoffline/semesters.json"), {
    encoding: "utf-8",
  })
) as StudiesTree;

export default defineEventHandler(async () => {
  return data;
});
