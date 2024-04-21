import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const term = getRouterParam(event, "term")!;
  const data = JSON.parse(
    await readFile(
      path.join(homedir(), ".cache/campusoffline", term, "studiesTree.json"),
      { encoding: "utf-8" }
    )
  );
  if (!data[id]) {
    throw createError({
      statusCode: 404,
      statusMessage: "Study Not Found",
    });
  }
  return data[id];
});
