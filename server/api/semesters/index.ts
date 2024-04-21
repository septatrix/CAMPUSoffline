import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

export default defineEventHandler(async () => {
  return JSON.parse(
    await readFile(
      path.join(homedir(), ".cache/campusoffline/semesters.json"),
      { encoding: "utf-8" }
    )
  );
});
