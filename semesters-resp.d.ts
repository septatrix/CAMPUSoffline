export type SemestersResponse = {
    readonly semesters: Semester[];
}

export type Semester = {
    readonly id:                      number;
    readonly key:                     string;
    readonly academicYearId:          number;
    readonly semesterType:            SemesterType;
    readonly semesterDesignation:     SemesterDesignation;
    readonly startOfAcademicSemester: OfAcademicSemester;
    readonly endOfAcademicSemester:   OfAcademicSemester;
    readonly shortName:               SemesterDesignation;
    readonly isSelected?:             boolean;
}

export type OfAcademicSemester = {
    readonly coType: "date";
    readonly value:  Date;
}

export type SemesterDesignation = {
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

export type SemesterType = "W" | "S";
