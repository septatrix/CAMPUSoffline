/**
 * Every RWTHonline endpoint this project talks to.
 * The paths are relative to REST_API and are handed to the ky client in
 * fetch-data.ts;
 * `coursePage` is the human readable page a course is linked to in the table.
 * None of them needs authentication.
 */

/** Base of the RWTHonline REST API. */
export const REST_API = "https://online.rwth-aachen.de/RWTHonline/ee/rest/";

/** All semesters known to RWTHonline. */
export const SEMESTERS = "slc.lib.tm/semesters/student";

/**
 * Paginated course listing, filtered by semester via `$filter=termId-eq=<id>`.
 * Exams are not part of it, those are found through EXAM_OFFERS.
 */
export const COURSES = "slc.tm.cp/student/courses";

/** Details of a single course: title, type, ECTS, examination method, … */
export const course = (courseId: number) =>
  `slc.tm.cp/student/courses/${courseId}`;

/** Everywhere a course sits in the curriculum of a study programme. */
export const curriculumPositions = (courseId: number) =>
  `slc.cm.curriculumposition/positions/${courseId}/course/allCurriculumPositions`;

/** The first five groups of a course, each with its appointments. */
export const firstCourseGroups = (courseId: number) =>
  `slc.tm.cp/student/courseGroups/firstGroups/${courseId}`;

/** The groups beyond the first five, only needed above that many. */
export const remainingCourseGroups = (courseId: number) =>
  `slc.tm.cp/student/courseGroups/remainingGroups/${courseId}`;

/**
 * Paginated exam offers with their dates, rooms and registration periods.
 * A semester filter is accepted but ignored, so the whole set is fetched and
 * grouped by semester afterwards.
 */
export const EXAM_OFFERS = "slc.xm.exd/exExamOffer";

/** The course as shown in RWTHonline itself. */
export const coursePage = (courseId: number | string) =>
  `https://online.rwth-aachen.de/RWTHonline/ee/ui/ca2/app/desktop/#/slc.tm.cp/student/courses/${courseId}`;
