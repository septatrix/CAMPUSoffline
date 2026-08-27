import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import type { CoursesInfo, PathEntry, StudiesTree } from "~/studies-tree";

const LEAF_NODE = "stp_empty";

const studyInfos: Record<string, StudiesTree> = {};
const courseInfos: Record<string, CoursesInfo> = {};

async function readCache<T>(term: string, file: string): Promise<T> {
  return JSON.parse(
    await readFile(path.join(homedir(), ".cache/campusoffline", term, file), {
      encoding: "utf-8",
    })
  ) as T;
}

/**
 * The tree only carries what differs per placement;
 * everything shared by all placements of a course is stored once per semester
 * and merged back in here.
 */
function withCourseInfo(node: PathEntry, courses: CoursesInfo): PathEntry {
  return {
    ...node,
    children: Object.fromEntries(
      Object.entries(node.children).map(([id, child]) => [
        id,
        child.iconName === LEAF_NODE
          ? { ...courses[id], ...child }
          : withCourseInfo(child, courses),
      ])
    ),
  };
}

export default defineEventHandler(async (event) => {
  const term = getRouterParam(event, "term")!;
  if (!(term in studyInfos)) {
    studyInfos[term] = await readCache<StudiesTree>(term, "studiesTree.json");
    courseInfos[term] = await readCache<CoursesInfo>(term, "courses.json");
  }
  const data = studyInfos[term];

  const id = getRouterParam(event, "id")!;
  if (!data[id]) {
    throw createError({
      statusCode: 404,
      statusMessage: "Study Not Found",
    });
  }

  // TODO clean this up
  const [prefix, ...rest] = getRouterParam(event, "path")?.split("/")!;
  const node = rest.reduce(
    (obj, key) => obj["children"][key],
    data[id].currics[prefix]
  );
  return withCourseInfo(node, courseInfos[term]!);
});
