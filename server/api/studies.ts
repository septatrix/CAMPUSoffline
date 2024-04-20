import { readFile } from "node:fs/promises";

export default defineEventHandler(async () => {
  return JSON.parse(await readFile("data/studies.json", { encoding: "utf-8" }));
});
