export type CourseGroupsResponse = {
    readonly courseGroupDtos: CourseGroupDto[];
    readonly links?:          Link[];
    readonly totalCount?:     number;
}

export type CourseGroupDto = {
    readonly id:                        number;
    readonly name:                      string;
    readonly courseId:                  number;
    readonly appointmentDtos:           AppointmentDto[];
    readonly appointmentSeriesDtos:     AppointmentSeriesDto[];
    readonly standardgroupFlag:         Flag;
    readonly confirmedPlaces?:          number;
    readonly limitedParticipationFlag?: Flag;
    readonly schilfFlag?:               Flag;
}

export type AppointmentDto = {
    readonly id:                       number;
    readonly weekday:                  WeekdayDto;
    readonly timestampFrom:            DateTime;
    readonly timestampTo:              DateTime;
    readonly appointmentEventTypeDto:  AppointmentEventTypeDto;
    readonly resourceId?:              number;
    readonly resourceName?:            string;
    readonly appointmentStatusType:    AppointmentStatusType;
    readonly interGroupFlag?:          Flag;
    readonly appointmentSeriesId?:     number;
}

export type AppointmentSeriesDto = {
    readonly id:              number;
    readonly seriesBeginTime: string;
    readonly seriesEndTime:   string;
    readonly seriesBegin:     DateTime;
    readonly seriesEnd:       DateTime;
    readonly resourceName?:   string;
    readonly weekday:         WeekdayDto[];
}

export type WeekdayDto = {
    readonly id:           number;
    readonly key:          string;
    readonly langDataType: LangData;
}

export type AppointmentEventTypeDto = {
    readonly id:   number;
    readonly name: LangData;
    readonly key:  string;
    readonly sort: number;
}

// `coType` is stripped from the cached course files to save space, hence optional
export type LangData = {
    readonly coType?: "model-core.lib.model.langdata";
    readonly value:   string;
}

export type DateTime = {
    readonly coType?: "datetime";
    readonly value:   string;
}

export type AppointmentStatusType = "CONFIRMED" | "CANCELLED";

export type Flag = "J" | "N";

export type Link = {
    readonly rel:   string;
    readonly href:  string;
    readonly name:  string;
    readonly key?:  string;
}
