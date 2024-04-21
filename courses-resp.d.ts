export type CoursesResponse = {
    readonly totalCount: number;
    readonly link:       Link[];
    readonly resource:   Resource[];
}

export type Link = {
    readonly rel:  Rel;
    readonly href: string;
    readonly name: LinkName;
    readonly key?: string;
}

export type LinkName = "CoCourseGroupRegistrationDto" | "CpCourseCategoryGroupDto" | "CpCourseTypeLibDto" | "LanguageLibDto" | "AptWeekDayDto" | "IdentityLibDto" | "CpCourseDto" | "CpCourseRegistrationDto";

export type Rel = "related" | "detail";

export type Resource = {
    readonly link:    Link[];
    readonly content: Content;
}

export type Content = {
    readonly type:        "model-slc.tm.cp.student.CpCourseDto";
    readonly cpCourseDto: CpCourseDto;
}

export type CpCourseDto = {
    readonly id:                            number;
    readonly courseNumber:                  CourseNumber;
    readonly semesterDto:                   SemesterDto;
    readonly courseTitle:                   CourseTitle;
    readonly ectsCredits?:                  number;
    readonly identityCodeId:                number;
    readonly courseTypeDto:                 CourseTypeDto;
    readonly lectureships:                  Lectureship[];
    readonly displayMoreLectureships:       boolean;
    readonly registrationAvailable:         boolean;
    readonly registrationInfo:              RegistrationInfo;
    readonly registrationInfoStatus:        RegistrationInfoStatus;
    readonly registeredConfigType:          RegisteredConfigType;
    readonly displayCourseRegistrationInfo: boolean;
    readonly courseNormKey:                 "LVEAB";
    readonly courseNormConfigs:             CourseNormConfig[];
    readonly lvCreditsEnabled:              boolean;
    readonly eLearningActive:               boolean;
}

export type CourseNormConfig = {
    readonly key:       "SST";
    readonly shortName: CourseTitle;
    readonly name:      CourseTitle;
    readonly value:     string;
}

export type CourseTitle = {
    readonly coType:       "model-core.lib.model.langdata";
    readonly value:        string;
    readonly translations: Translations;
}

export type Translations = {
    readonly translation: Translation[];
}

export type Translation = {
    readonly lang:   Lang;
    readonly value?: string;
}

export type Lang = "de" | "en" | "fr" | "it";

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

export type Lectureship = {
    readonly id:               number;
    readonly courseId:         number;
    readonly identityLibDto:   IdentityLIBDto;
    readonly teachingFunction: TeachingFunction;
    readonly sort?:            number;
}

export type IdentityLIBDto = {
    readonly id:               number;
    readonly personId:         number;
    readonly obfuscated:       string;
    readonly firstName:        string;
    readonly lastName:         string;
    readonly gender:           Gender;
    readonly genderNrForTitle: number;
    readonly businessCardLink: Link;
}

export type Gender = "FEMALE" | "MALE";

export type TeachingFunction = {
    readonly id:   number;
    readonly key:  "V";
    readonly name: "Vortragende*r";
}

export type RegisteredConfigType = "REGPROC" | "TBA";

export type RegistrationInfo = "Anmeldung abgelaufen" | "Zu dieser LV existiert kein Anmeldeverfahren" | "LV-Anmeldung möglich" | "Zu dieser LV ist keine Anmeldung möglich";

export type RegistrationInfoStatus = "NONE" | "INFO" | "RUNNING";

export type SemesterDto = {
    readonly id:                      number;
    readonly key:                     "24S";
    readonly academicYearId:          number;
    readonly semesterType:            "S";
    readonly semesterDesignation:     CourseTitle;
    readonly startOfAcademicSemester: OfAcademicSemester;
    readonly endOfAcademicSemester:   OfAcademicSemester;
    readonly shortName:               CourseTitle;
}

export type OfAcademicSemester = {
    readonly coType: "date";
    readonly value:  Date;
}
