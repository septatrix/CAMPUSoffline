import { readFile } from "node:fs/promises";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  return JSON.parse(
    await readFile("data/studiesTree.json", { encoding: "utf-8" })
  )[id];
});
