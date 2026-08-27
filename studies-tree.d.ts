import type { AppointmentSummary } from "./appointments";

export type StudiesTree = { [key: string]: StudyInfo };

/** Course attributes shared by all placements of a course within a semester. */
export type CoursesInfo = { [courseId: string]: CourseInfo };

export type CourseInfo = {
  readonly courseType: string;
  readonly sws?: string | undefined;
  readonly examMethod?: string | undefined;
  readonly appointments: AppointmentSummary[];
};

export type StudyInfo = {
  readonly studyNameInfo: StudyNameInfo;
  readonly currics: PathEntry["children"];
};

export type PathEntry = {
  readonly name: string;
  readonly iconName: string;
  readonly credits?: number | undefined;
  readonly subjectType?: string | undefined;
  readonly semesterRecommendation?: string | undefined;
  readonly children: { [key: string]: PathEntry };
};

/** A curriculum leaf with the shared course attributes merged in. */
export type CourseNode = PathEntry & Partial<CourseInfo>;

export type StudyNameInfo = {
  readonly curriculumVersionId: number;
  readonly name: DisplayedType;
  readonly studyIdentifier: string;
  readonly displayedType: DisplayedType;
  readonly curriculumVersionIdentification: string;
  readonly supported: boolean;
};

export type DisplayedType = {
  readonly value: string;
};
