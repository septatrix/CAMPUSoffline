import { readSemestersCache } from "~/server/utils/semesters-cache";

const semesterData = readSemestersCache();

export default defineEventHandler(async () => {
  return semesterData.fetchedAt ?? null;
});
