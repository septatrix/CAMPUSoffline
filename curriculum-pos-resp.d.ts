export type CurriculumPositionsResponse = {
    readonly link:     any[];
    readonly resource: Resource[];
}

export type Resource = {
    readonly link:    Link[];
    readonly content: Content;
}

export type Content = {
    readonly type:                    "model-slc.lib.cm.curriculumposition.coCurriculumPositionDto";
    readonly coCurriculumPositionDto: CoCurriculumPositionDto;
}

export type CoCurriculumPositionDto = {
    readonly studyNameInfoDto:          StudyNameInfoDto;
    readonly curriculumVersionInfoDto:  CurriculumVersionInfoDto;
    readonly curriculumPositionPathDto: CurriculumPositionPathDto;
    readonly creditsDto:                CreditsDto;
    readonly semesterRecommendationDto: SemesterRecommendationDto;
    readonly subjectTypeDto:            SubjectTypeDto;
    readonly preconditionDto:           PreconditionDto;
    readonly validFrom:                 From;
}

export type CreditsDto = {
    readonly value: number;
}

export type CurriculumPositionPathDto = {
    readonly path:  Back[];
    readonly front: Back[];
    readonly back:  Back[];
}

export type Back = {
    readonly elementId:     number;
    readonly designation?:  string;
    readonly name:          Text;
    readonly description:   Text;
    readonly iconName:      IconName;
    readonly validFrom?:    From;
    readonly sorting?:      number;
    readonly reference:     string;
}

export type Text = {
    readonly coType:       "model-core.lib.model.langdata";
    readonly value:        string;
    readonly translations: TextTranslations;
}

export type TextTranslations = {
    readonly translation: PurpleTranslation[];
}

export type PurpleTranslation = {
    readonly lang:   Lang;
    readonly value?: string;
}

export type Lang = "de" | "en" | "fr" | "it";

export type IconName = "stp_3" | "stp_2" | "stp_0" | "stp_5";

export type From = {
    readonly coType: "date";
    readonly value:  Date;
}

export type CurriculumVersionInfoDto = {
    readonly id:                                   number;
    readonly curriculumInfo:                       CurriculumInfo;
    readonly curriculumVersionIdentification:      string;
    readonly dateRange:                            DateRange;
    readonly preconditions:                        Preconditions;
    readonly examCurriculumContextConfiguration:   "ONLY_WITH_CURRICULUM_NODE_ALLOWED";
    readonly courseCurriculumContextConfiguration: "ALL_SUBJECT_ALLOWED";
    readonly supported:                            boolean;
}

export type CurriculumInfo = {
    readonly id:            number;
    readonly displayedName: Text;
    readonly displayedType: Text;
    readonly displayedCode: string;
}

export type DateRange = {
    readonly from: From;
}

export type Preconditions = {
    readonly coType:       "model-core.lib.model.langdata";
    readonly translations: PreconditionsTranslations;
}

export type PreconditionsTranslations = {
    readonly translation: FluffyTranslation[];
}

export type FluffyTranslation = {
    readonly lang: Lang;
}

export type PreconditionDto = {
    readonly precondition: boolean;
    readonly text:         Text;
}

export type SemesterRecommendationDto = {
    readonly type:                     string;
    readonly shortNameWinterstarter:   Text;
    readonly descriptionWinterstarter: Text;
    readonly sortWinterstarter:        number;
    readonly shortNameSummerstarter:   Text;
    readonly descriptionSummerstarter: Text;
    readonly sortSummerstarter:        number;
    readonly keySummerstarter:         "KA";
    readonly keyWinterstarter:         string;
}

export type StudyNameInfoDto = {
    readonly curriculumVersionId:             number;
    readonly name:                            Text;
    readonly studyIdentifier:                 string;
    readonly displayedType:                   Text;
    readonly curriculumVersionIdentification: string;
    readonly supported:                       boolean;
}

export type SubjectTypeDto = {
    readonly value: Text;
}

export type Link = {
    readonly rel:  "external";
    readonly href: string;
    readonly type: "text/html";
    readonly name: "CURRICULUM";
}
