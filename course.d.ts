// automatically generated based on course520895.json
// TODO check soundness and completeness

export type Course = {
  readonly link: any[];
  readonly resource: Resource[];
};

export type Resource = {
  readonly link: Link[];
  readonly content: Content;
};

export type Content = {
  readonly type: ContentType;
  readonly coCurriculumPositionDto: CoCurriculumPositionDto;
};

export type CoCurriculumPositionDto = {
  readonly studyNameInfoDto: StudyNameInfoDto;
  readonly curriculumVersionInfoDto: CurriculumVersionInfoDto;
  readonly curriculumPositionPathDto: CurriculumPositionPathDto;
  readonly creditsDto: CreditsDto;
  readonly semesterRecommendationDto: SemesterRecommendationDto;
  readonly subjectTypeDto: SubjectTypeDto;
  readonly preconditionDto: PreconditionDto;
  readonly validFrom: From;
};

export type CreditsDto = {
  readonly value: number;
};

export type CurriculumPositionPathDto = {
  readonly path: PathEntry[];
  readonly front: PathEntry[];
  readonly back: PathEntry[];
};

export type PathEntry = {
  readonly elementId: number;
  readonly designation?: string;
  readonly name: Text;
  readonly description: Text;
  readonly iconName: string;
  readonly validFrom: From;
  readonly sorting?: number;
  readonly reference: string;
};

export type Text = {
  readonly coType: TextCoType;
  readonly value: string;
  readonly translations: TextTranslations;
};

export type TextCoType = "model-core.lib.model.langdata";

export type TextTranslations = {
  readonly translation: PurpleTranslation[];
};

export type PurpleTranslation = {
  readonly lang: Lang;
  readonly value?: string;
};

export type Lang = "de" | "en" | "fr" | "it";

export type From = {
  readonly coType: "date";
  readonly value: Date;
};

export type CurriculumVersionInfoDto = {
  readonly id: number;
  readonly curriculumInfo: CurriculumInfo;
  readonly curriculumVersionIdentification: string;
  readonly dateRange: DateRange;
  readonly preconditions: Preconditions;
  readonly examCurriculumContextConfiguration: ExamCurriculumContextConfiguration;
  readonly courseCurriculumContextConfiguration: CourseCurriculumContextConfiguration;
  readonly supported: boolean;
};

export type CourseCurriculumContextConfiguration = "ALL_SUBJECT_ALLOWED";

export type CurriculumInfo = {
  readonly id: number;
  readonly displayedName: Text;
  readonly displayedType: Text;
  readonly displayedCode: string;
};

export type DateRange = {
  readonly from: From;
};

export type ExamCurriculumContextConfiguration =
  "ONLY_WITH_CURRICULUM_NODE_ALLOWED";

export type Preconditions = {
  readonly coType: TextCoType;
  readonly translations: PreconditionsTranslations;
};

export type PreconditionsTranslations = {
  readonly translation: FluffyTranslation[];
};

export type FluffyTranslation = {
  readonly lang: Lang;
};

export type PreconditionDto = {
  readonly precondition: boolean;
  readonly text: Text;
};

export type SemesterRecommendationDto = {
  readonly type: SemesterRecommendationDtoType;
  readonly shortNameWinterstarter: Text;
  readonly descriptionWinterstarter: Text;
  readonly sortWinterstarter: number;
  readonly shortNameSummerstarter: Text;
  readonly descriptionSummerstarter: Text;
  readonly sortSummerstarter: number;
  readonly keySummerstarter: KeySummerstarter;
  readonly keyWinterstarter: string;
};

export type KeySummerstarter = "KA";

export type SemesterRecommendationDtoType = "WITH_SUMMER_STARTER";

export type StudyNameInfoDto = {
  readonly curriculumVersionId: number;
  readonly name: Text;
  readonly studyIdentifier: string;
  readonly displayedType: Text;
  readonly curriculumVersionIdentification: string;
  readonly supported: boolean;
};

export type SubjectTypeDto = {
  readonly value: Text;
};

export type ContentType =
  "model-slc.lib.cm.curriculumposition.coCurriculumPositionDto";

export type Link = {
  readonly rel: Rel;
  readonly href: string;
  readonly type: LinkType;
  readonly name: Name;
};

export type Name = "CURRICULUM";

export type Rel = "external";

export type LinkType = "text/html";
