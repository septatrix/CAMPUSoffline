export type ExamOffersResponse = {
    readonly examOffers: ExamOffer[];
    readonly totalCount: number;
}

export type ExamOffer = {
    readonly id:                       number;
    readonly courseId:                 number;
    readonly courseName:               LangData;
    readonly displayCourseNumber?:     string;
    readonly courseSemesterId:         number;
    readonly courseSemesterShortName?: LangData;
    readonly identificationName?:      string;
    /** Missing while the exam has not been scheduled yet. */
    readonly examDate?:                DateValue;
    readonly examStart?:               DateValue;
    readonly examEnd?:                 DateValue;
    /** Free text such as "Zweittermin, zentral geplant". */
    readonly examDateInformation?:     string;
    readonly examType?:                LangData;
    readonly examTypeKey?:             string;
    /** The rooms the exam is written in. */
    readonly appointments?:            ExamAppointment[];
    readonly registrationDateStart?:   DateValue;
    readonly registrationDateEnd?:     DateValue;
    readonly deRegistrationEnd?:       DateValue;
    readonly numberOfParticipants?:    number;
    readonly maxNumberOfParticipants?: number;
    readonly organisationLibName?:     LangData;
    readonly preliminaryRegistration?: boolean;
}

export type ExamAppointment = {
    readonly id:                   number;
    readonly displayName:          string;
    readonly personalAppointment?: boolean;
}

// `coType` is stripped from the cached course files to save space, hence optional
export type LangData = {
    readonly coType?: "model-core.lib.model.langdata";
    readonly value:   string;
}

export type DateValue = {
    readonly coType?: "date" | "datetime" | "time";
    readonly value:   string;
}
