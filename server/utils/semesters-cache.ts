import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { Semester } from "~/semesters-resp";

export type SemestersCache = {
  fetchedAt: string;
  semesters: Semester[];
};

const semestersCache = JSON.parse(
  readFileSync(path.join(homedir(), ".cache/campusoffline/semesters.json"), {
    encoding: "utf-8",
  })
) as SemestersCache;

export function getSemestersCache(): SemestersCache {
  return semestersCache;
}
