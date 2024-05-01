export type SerializedCourse = {
    readonly courseDetail:        CourseDetail;
    readonly curriculumPositions: CurriculumPosition[];
}

export type CourseDetail = {
    readonly cpCourseDto:            CpCourseDto;
    readonly displayExamInformation: boolean;
}

export type CpCourseDto = {
    readonly id:                            number;
    readonly courseNumber:                  CourseNumber;
    readonly semesterDto:                   SemesterDto;
    readonly courseTitle:                   CourseTitle;
    readonly ectsCredits?:                  number;
    readonly identityCodeDto:               IdentityCodeDto;
    readonly identityCodeId:                number;
    readonly courseTypeDto:                 CourseTypeDto;
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

export type CourseNormConfig = {
    readonly key:       string;
    readonly shortName: CourseTitle;
    readonly name:      CourseTitle;
    readonly value:     string;
}

export type CourseTitle = {
    readonly value: string;
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

export type SemesterDto = {
    readonly id:                      number;
    readonly key:                     string;
    readonly academicYearId:          number;
    readonly semesterType:            string;
    readonly semesterDesignation:     CourseTitle;
    readonly startOfAcademicSemester: CourseTitle;
    readonly endOfAcademicSemester:   CourseTitle;
    readonly shortName:               CourseTitle;
}

export type CurriculumPosition = {
    readonly type:                    "model-slc.lib.cm.curriculumposition.coCurriculumPositionDto";
    readonly coCurriculumPositionDto: CoCurriculumPositionDto;
}

export type CoCurriculumPositionDto = {
    readonly studyNameInfoDto:          StudyNameInfoDto;
    readonly curriculumVersionInfoDto:  CurriculumVersionInfoDto;
    readonly curriculumPositionPathDto: CurriculumPositionPathDto;
    readonly creditsDto?:               CreditsDto;
    readonly semesterRecommendationDto: SemesterRecommendationDto;
    readonly subjectTypeDto:            SubjectTypeDto;
    readonly preconditionDto:           PreconditionDto;
    readonly validTo?:                  CourseTitle;
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
    readonly elementId:    number;
    readonly designation?: string;
    readonly name:         CourseTitle;
    readonly description:  CourseTitle;
    readonly iconName:     IconName;
    readonly sorting?:     number;
    readonly validTo?:     CourseTitle;
}

export type IconName = "stp_3" | "stp_2" | "stp_4" | "stp_0" | "stp_5";

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
    readonly displayedName: CourseTitle;
    readonly displayedType: CourseTitle;
    readonly displayedCode: string;
}

export type DateRange = {
    readonly from:          CourseTitle;
    readonly to?:           CourseTitle;
    readonly offeredUntil?: CourseTitle;
}

export type Preconditions = {
}

export type PreconditionDto = {
    readonly precondition: boolean;
    readonly text:         CourseTitle;
}

export type SemesterRecommendationDto = {
    readonly type:                     "WITH_SUMMER_STARTER";
    readonly shortNameWinterstarter:   CourseTitle;
    readonly descriptionWinterstarter: CourseTitle;
    readonly sortWinterstarter:        number;
    readonly shortNameSummerstarter:   CourseTitle;
    readonly descriptionSummerstarter: CourseTitle;
    readonly sortSummerstarter:        number;
    readonly keySummerstarter:         string;
    readonly keyWinterstarter:         KeyWinterstarter;
}

export type KeyWinterstarter = "2." | "1.";

export type StudyNameInfoDto = {
    readonly curriculumVersionId:             number;
    readonly name:                            CourseTitle;
    readonly studyIdentifier:                 string;
    readonly displayedType:                   CourseTitle;
    readonly curriculumVersionIdentification: string;
    readonly supported:                       boolean;
}

export type SubjectTypeDto = {
    readonly value: CourseTitle;
}
