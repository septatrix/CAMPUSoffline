import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { Semester } from "~/semesters-resp";

type SemestersCache = {
  fetchedAt: string | null;
  semesters: Semester[];
};

export function readSemestersCache(): SemestersCache {
  const rawData = JSON.parse(
    readFileSync(path.join(homedir(), ".cache/campusoffline/semesters.json"), {
      encoding: "utf-8",
    })
  ) as Semester[] | { fetchedAt?: string; semesters: Semester[] };

  if (Array.isArray(rawData)) {
    return { fetchedAt: null, semesters: rawData };
  }
  return {
    fetchedAt: rawData.fetchedAt ?? null,
    semesters: rawData.semesters,
  };
}
