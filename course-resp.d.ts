export type CourseResponse = {
    readonly link:     Link[];
    readonly resource: Resource[];
}

export type Link = {
    readonly rel:     Rel;
    readonly href:    string;
    readonly name:    string;
    readonly key?:    string;
    readonly target?: string;
}

export type Rel = "up" | "related" | "detail";

export type Resource = {
    readonly link:    Link[];
    readonly content: Content;
}

export type Content = {
    readonly type:              string;
    readonly cpCourseDetailDto: CpCourseDetailDto;
}

export type CpCourseDetailDto = {
    readonly cpCourseDto:            CpCourseDto;
    readonly cpCourseDescriptionDto: CpCourseDescriptionDto;
    readonly displayExamInformation: boolean;
    readonly sameCourseDtos:         SameCourseDto[];
}

export type CpCourseDescriptionDto = {
    readonly courseContent:          AssessmentScheme;
    readonly previousKnowledge:      AssessmentScheme;
    readonly courseObjective:        AssessmentScheme;
    readonly additionalInformation:  AdditionalInformation;
    readonly assessmentScheme:       AssessmentScheme;
    readonly examRegistration:       AssessmentScheme;
    readonly courseRegistrationInfo: AssessmentScheme;
    readonly numberOfExams:          AssessmentScheme;
    readonly teachingMethod:         AssessmentScheme;
}

export type AdditionalInformation = {
    readonly recommendedLiterature: AssessmentScheme;
    readonly cpCourseUrlGroupDtos:  CpCourseURLGroupDto[];
    readonly comments:              AssessmentScheme;
}

export type AssessmentScheme = {
    readonly coType:       "model-core.lib.model.langdata";
    readonly translations: AssessmentSchemeTranslations;
}

export type AssessmentSchemeTranslations = {
    readonly translation: PurpleTranslation[];
}

export type PurpleTranslation = {
    readonly lang: Lang;
}

export type Lang = "de" | "en" | "fr" | "it";

export type CpCourseURLGroupDto = {
    readonly id:               number;
    readonly groupName:        CourseTitle;
    readonly courseUrlDtoList: CourseURLDtoList[];
    readonly sorting:          number;
}

export type CourseURLDtoList = {
    readonly id:      number;
    readonly url:     string;
    readonly name:    CourseTitle;
    readonly sorting: number;
}

export type CourseTitle = {
    readonly coType:       "model-core.lib.model.langdata";
    readonly value:        string;
    readonly translations: CourseTitleTranslations;
}

export type CourseTitleTranslations = {
    readonly translation: FluffyTranslation[];
}

export type FluffyTranslation = {
    readonly lang:   Lang;
    readonly value?: string;
}

export type CpCourseDto = {
    readonly id:                            number;
    readonly courseNumber:                  CourseNumber;
    readonly semesterDto:                   SemesterDto;
    readonly courseTitle:                   CourseTitle;
    readonly organisationResponsibleDto:    OrganisationResponsibleDto;
    readonly identityCodeDto:               IdentityCodeDto;
    readonly identityCodeId:                number;
    readonly courseTypeDto:                 CourseTypeDto;
    readonly courseLanguageDtos:            CourseLanguageDto[];
    readonly lectureships:                  Lectureship[];
    readonly displayMoreLectureships:       boolean;
    readonly examinationMethodName:         CourseTitle;
    readonly registrationAvailable:         boolean;
    readonly registrationInfo:              string;
    readonly registrationInfoStatus:        string;
    readonly registeredConfigType:          string;
    readonly displayCourseRegistrationInfo: boolean;
    readonly courseNormConfigs:             CourseNormConfig[];
    readonly lvCreditsEnabled:              boolean;
    readonly eLearningActive:               boolean;
}

export type CourseLanguageDto = {
    readonly courseId:     number;
    readonly languageDto:  LanguageDto;
    readonly mainLanguage: boolean;
}

export type LanguageDto = {
    readonly id:   number;
    readonly key:  string;
    readonly name: CourseTitle;
}

export type CourseNormConfig = {
    readonly key:       string;
    readonly shortName: CourseTitle;
    readonly name:      CourseTitle;
    readonly value:     string;
}

export type CourseNumber = {
    readonly dotIndex:      number;
    readonly databaseValue: string;
    readonly courseNumber:  string;
}

export type CourseTypeDto = {
    readonly id:                  number;
    readonly key:                 string;
    readonly courseTypeName:      CourseTitle;
    readonly courseTypeShortName: CourseTitle;
    readonly sort:                number;
}

export type IdentityCodeDto = {
    readonly id: number;
}

export type Lectureship = {
    readonly id:               number;
    readonly courseId:         number;
    readonly identityLibDto:   IdentityLIBDto;
    readonly teachingFunction: TeachingFunction;
}

export type IdentityLIBDto = {
    readonly id:               number;
    readonly personId:         number;
    readonly obfuscated:       string;
    readonly firstName:        string;
    readonly lastName:         string;
    readonly gender:           string;
    readonly genderNrForTitle: number;
    readonly businessCardLink: Link;
}

export type TeachingFunction = {
    readonly id:   number;
    readonly key:  string;
    readonly name: string;
}

export type OrganisationResponsibleDto = {
    readonly id:                   number;
    readonly identificationName:   string;
    readonly validFrom:            ValidFrom;
    readonly name:                 CourseTitle;
    readonly parentOrganisationId: number;
    readonly hierarchyTypeId:      number;
    readonly orgPageLink:          OrgPageLink;
}

export type OrgPageLink = {
    readonly rel:  Rel;
    readonly href: string;
}

export type ValidFrom = {
    readonly coType: string;
    readonly value:  Date;
}

export type SemesterDto = {
    readonly id:                      number;
    readonly key:                     string;
    readonly academicYearId:          number;
    readonly semesterType:            string;
    readonly semesterDesignation:     CourseTitle;
    readonly startOfAcademicSemester: ValidFrom;
    readonly endOfAcademicSemester:   ValidFrom;
    readonly shortName:               CourseTitle;
}

export type SameCourseDto = {
    readonly id:                            number;
    readonly courseNumber:                  CourseNumber;
    readonly semesterDto:                   SemesterDto;
    readonly courseTitle:                   CourseTitle;
    readonly courseTypeDto:                 CourseTypeDto;
    readonly lectureships:                  Lectureship[];
    readonly displayMoreLectureships:       boolean;
    readonly displayCourseRegistrationInfo: boolean;
    readonly courseNormConfigs:             CourseNormConfig[];
    readonly lvCreditsEnabled:              boolean;
    readonly eLearningActive:               boolean;
}
