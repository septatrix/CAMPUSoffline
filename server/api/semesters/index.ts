import { readSemestersCache } from "~/server/utils/semesters-cache";

const data = readSemestersCache().semesters;

export default defineEventHandler(async () => {
  return data;
});
