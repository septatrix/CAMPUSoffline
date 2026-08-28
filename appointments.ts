import type { CourseGroupDto } from "./course-groups-resp";
import type { ExamOffer } from "./exam-offer-resp";

export type AppointmentSummary = {
  /** Abbreviated weekday as delivered by RWTHonline, e.g. "Mo.". */
  weekday: string;
  /** Weekday id (Monday = 1), used for sorting. */
  weekdaySort: number;
  /** Start time as "HH:MM". */
  from: string;
  /** End time as "HH:MM". */
  to: string;
  /** Room including its building code, e.g. "TEMP1 (1515|001)". */
  room: string | null;
  /** How often this slot actually takes place. */
  count: number;
  /** Group name, only set for courses split into multiple groups. */
  group?: string;
};

/**
 * Collapse the individual appointments of a course
 * into the recurring slots one would put into a timetable.
 * Cancelled dates are left out entirely,
 * so the count reflects how often a slot really takes place.
 */
export function summarizeAppointments(
  groups: readonly CourseGroupDto[]
): AppointmentSummary[] {
  const multipleGroups = groups.length > 1;
  const slots = new Map<string, AppointmentSummary>();

  for (const group of groups) {
    for (const appointment of group.appointmentDtos ?? []) {
      if (appointment.appointmentStatusType !== "CONFIRMED") {
        continue;
      }
      const from = appointment.timestampFrom.value.slice(11, 16);
      const to = appointment.timestampTo.value.slice(11, 16);
      const room = appointment.resourceName ?? null;
      const groupName = multipleGroups ? group.name : undefined;
      const key = JSON.stringify([
        groupName,
        appointment.weekday.id,
        from,
        to,
        room,
      ]);

      const slot = slots.get(key);
      if (slot) {
        slot.count++;
      } else {
        slots.set(key, {
          weekday: appointment.weekday.key,
          weekdaySort: appointment.weekday.id,
          from,
          to,
          room,
          count: 1,
          ...(groupName ? { group: groupName } : {}),
        });
      }
    }
  }

  return [...slots.values()].sort(
    (a, b) =>
      (a.group ?? "").localeCompare(b.group ?? "") ||
      a.weekdaySort - b.weekdaySort ||
      a.from.localeCompare(b.from) ||
      (a.room ?? "").localeCompare(b.room ?? "")
  );
}

/**
 * Render a slot the way it is shown in the course table.
 * The occurrences are always spelled out:
 * a slot which only takes place once still shows up with a weekday
 * and would otherwise look like a weekly one.
 */
export function formatAppointment(appointment: AppointmentSummary): string {
  const weekday = appointment.weekday.replace(/\.$/, "");
  return [
    appointment.group,
    `${weekday} ${appointment.from}-${appointment.to}`,
    appointment.room,
    `(×${appointment.count})`,
  ]
    .filter(Boolean)
    .join(" ");
}

export type ExamSummary = {
  /** Day of the exam as "YYYY-MM-DD". */
  date: string;
  /** Start time as "HH:MM", missing for exams without a fixed time. */
  from: string | null;
  /** End time as "HH:MM". */
  to: string | null;
  /** The rooms the exam is written in. */
  rooms: string[];
  /** Free text such as "Zweittermin, zentral geplant". */
  info: string | null;
};

/**
 * The exam dates of a course, earliest first.
 * A course usually has a first and a second date;
 * exams which have not been scheduled yet are left out.
 */
export function summarizeExams(offers: readonly ExamOffer[]): ExamSummary[] {
  return offers
    .filter((offer) => offer.examDate?.value)
    .map((offer) => ({
      date: offer.examDate!.value.slice(0, 10),
      from: offer.examStart?.value.slice(0, 5) ?? null,
      to: offer.examEnd?.value.slice(0, 5) ?? null,
      rooms: (offer.appointments ?? []).map(({ displayName }) => displayName),
      info: offer.examDateInformation?.trim() || null,
    }))
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (a.from ?? "").localeCompare(b.from ?? "")
    );
}

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

/**
 * Render an exam date the way it is shown in the course table.
 * The weekday is spelled out to match the lecture dates next to it,
 * where it is the only thing telling you when a course takes place.
 */
export function formatExam(exam: ExamSummary): string {
  const [year, month, day] = exam.date.split("-");
  const weekday = WEEKDAYS[new Date(`${exam.date}T00:00:00Z`).getUTCDay()];
  return [
    `${weekday} ${day}.${month}.${year}`,
    exam.from && exam.to ? `${exam.from}-${exam.to}` : exam.from,
    exam.rooms.join(", "),
  ]
    .filter(Boolean)
    .join(" ");
}
