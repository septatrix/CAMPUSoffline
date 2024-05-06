import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { Semester } from "~/semesters-resp";

const data = JSON.parse(
  readFileSync(path.join(homedir(), ".cache/campusoffline/semesters.json"), {
    encoding: "utf-8",
  })
) as Semester[];

export default defineEventHandler(async () => {
  return data;
});
