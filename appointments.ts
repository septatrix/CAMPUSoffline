import type { CourseGroupDto } from "./course-groups-resp";

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
