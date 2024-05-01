export type StudiesTree = { [key: string]: StudyInfo };

export type StudyInfo = {
  readonly studyNameInfo: StudyNameInfo;
  readonly currics: PathEntry["children"];
};

export type PathEntry = {
  readonly name: string;
  readonly iconName: string;
  readonly credits?: number | undefined;
  readonly courseTypeDto?: string;
  readonly children: { [key: string]: PathEntry };
};

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
