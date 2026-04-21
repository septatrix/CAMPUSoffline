import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const semesterData = JSON.parse(
  readFileSync(path.join(homedir(), ".cache/campusoffline/semesters.json"), {
    encoding: "utf-8",
  })
) as { fetchedAt?: string };

export default defineEventHandler(async () => {
  return semesterData.fetchedAt ?? null;
});
