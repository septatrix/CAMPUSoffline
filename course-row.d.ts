import type { AppointmentSummary } from "./appointments";

/** One course of a curriculum leaf, flattened for the course table. */
export type CourseRow = {
  readonly key: string;
  readonly module: string;
  readonly iconName: string;
  readonly courseType: string;
  readonly title: string;
  readonly credits: number | null;
  readonly sws: string | null;
  readonly semesterRecommendation: string | null;
  readonly subjectType: string | null;
  readonly examMethod: string | null;
  readonly appointments: AppointmentSummary[];
  readonly courseId: string;
};
