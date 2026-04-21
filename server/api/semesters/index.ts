import { getSemestersCache } from "~/server/utils/semesters-cache";

export default defineEventHandler(async () => {
  return getSemestersCache().semesters;
});
