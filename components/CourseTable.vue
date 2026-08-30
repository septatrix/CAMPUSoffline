<template>
  <details class="columns">
    <summary>
      Columns ({{ visibleColumns.length }}/{{ columns.length }})
    </summary>
    <label v-for="column in columns" :key="column.key">
      <input
        type="checkbox"
        :checked="visible.includes(column.key)"
        @change="toggleColumn(column.key)"
      />
      {{ column.label }}
    </label>
    <button type="button" @click="reset">Reset</button>
  </details>

  <p class="summary">
    {{ sortedRows.length }} of {{ rows.length }} course{{
      rows.length === 1 ? "" : "s"
    }}
  </p>

  <table>
    <thead>
      <tr>
        <th
          v-for="column in visibleColumns"
          :key="column.key"
          :aria-sort="ariaSort(column.key)"
        >
          <button type="button" class="sort" @click="toggleSort(column.key)">
            {{ column.label }}
            <span class="indicator">{{ sortIndicator(column.key) }}</span>
          </button>
        </th>
      </tr>
      <tr class="filters">
        <td v-for="column in visibleColumns" :key="column.key">
          <select
            v-if="column.filter === 'select'"
            :value="filters[column.key] ?? ''"
            @change="
              setFilter(column.key, ($event.target as HTMLSelectElement).value)
            "
          >
            <option value="">(all)</option>
            <option v-for="option in options(column)" :key="option">
              {{ option }}
            </option>
          </select>
          <input
            v-else
            type="search"
            :value="filters[column.key] ?? ''"
            :placeholder="`Filter ${column.label}`"
            @input="
              setFilter(column.key, ($event.target as HTMLInputElement).value)
            "
          />
        </td>
      </tr>
    </thead>

    <!--
      One tbody per run of rows sharing a module keeps the alternating background
      of the module groups and allows the rowspan below.

      The rowspan shenanigans are to fix one of:
      - https://bugzilla.mozilla.org/show_bug.cgi?id=1000435
      - https://bugzilla.mozilla.org/show_bug.cgi?id=217769
      - https://bugzilla.mozilla.org/show_bug.cgi?id=244135
      - https://bugzilla.mozilla.org/show_bug.cgi?id=332740
      - https://bugzilla.mozilla.org/show_bug.cgi?id=332977
    -->
    <tbody v-for="(group, groupIdx) in groupedRows" :key="groupIdx">
      <tr v-for="(row, rowIdx) in group.rows" :key="row.key">
        <template v-for="column in visibleColumns" :key="column.key">
          <template v-if="column.key === 'module'">
            <td v-if="rowIdx === 0" :rowspan="group.rows.length">
              {{ row.module }}
            </td>
          </template>
          <td v-else-if="column.key === 'type'">
            (<i :class="`icon_${row.iconName}`" />)
            {{ row.courseType }}
          </td>
          <td v-else-if="column.key === 'dates'" class="dates">
            <template v-for="(line, idx) in dateLines(row)" :key="idx">
              <br v-if="idx > 0" />{{ line }}
            </template>
          </td>
          <td v-else-if="column.key === 'id'">
            <a
              :href="`https://online.rwth-aachen.de/RWTHonline/ee/ui/ca2/app/desktop/#/slc.tm.cp/student/courses/${row.courseId}`"
            >
              {{ row.courseId }}
            </a>
          </td>
          <td v-else :class="{ numeric: column.numeric }">
            {{ column.text(row) }}
          </td>
        </template>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { formatAppointment, formatExam } from "~/appointments";
import type { CourseRow } from "~/course-row";

/**
 * When a course takes place.
 * Exams have no weekly slots but a date of their own,
 * so they fill the same column with the day they are written on.
 */
function dateLines(row: CourseRow): string[] {
  return row.appointments.length
    ? row.appointments.map(formatAppointment)
    : row.exams.map(formatExam);
}

type Column = {
  key: string;
  label: string;
  /** Whether the column is shown before the user configured anything. */
  default: boolean;
  filter: "text" | "select";
  numeric?: boolean;
  /** Textual representation, used for display, filtering and sorting. */
  text: (row: CourseRow) => string;
  /** Overrides `text` for sorting where the displayed order is not useful. */
  sortKey?: (row: CourseRow) => number | string;
};

const STORAGE_KEY = "campusoffline:courseTable";

const props = defineProps<{ rows: CourseRow[] }>();

const columns: Column[] = [
  {
    key: "module",
    label: "Module",
    default: true,
    filter: "text",
    text: (row) => row.module,
  },
  {
    key: "type",
    label: "Course Type",
    default: true,
    filter: "select",
    text: (row) => row.courseType,
  },
  {
    key: "title",
    label: "Name",
    default: true,
    filter: "text",
    text: (row) => row.title,
  },
  {
    key: "credits",
    label: "Credits",
    default: true,
    filter: "text",
    numeric: true,
    text: (row) => row.credits?.toString() ?? "",
    sortKey: (row) => row.credits ?? Number.NEGATIVE_INFINITY,
  },
  {
    key: "sws",
    label: "SWS",
    default: false,
    filter: "text",
    numeric: true,
    text: (row) => row.sws ?? "",
    sortKey: (row) => Number(row.sws) || Number.NEGATIVE_INFINITY,
  },
  {
    key: "semester",
    label: "Rec. Semester",
    default: false,
    filter: "select",
    text: (row) => row.semesterRecommendation ?? "",
  },
  {
    key: "subject",
    label: "Subject Type",
    default: false,
    filter: "select",
    text: (row) => row.subjectType ?? "",
  },
  {
    key: "exam",
    label: "Exam Method",
    default: false,
    filter: "text",
    text: (row) => row.examMethod ?? "",
  },
  {
    key: "dates",
    label: "Dates",
    default: true,
    filter: "text",
    text: (row) => dateLines(row).join("\n"),
    // Weekly slots sort by weekday, exams by their date and both before the
    // courses without any date at all
    sortKey: (row) =>
      row.appointments.length
        ? `A${row.appointments[0].weekdaySort} ${row.appointments[0].from}`
        : row.exams.length
        ? `B${row.exams[0].date} ${row.exams[0].from ?? ""}`
        : "Z",
  },
  {
    key: "id",
    label: "ID",
    default: true,
    filter: "text",
    numeric: true,
    text: (row) => row.courseId,
    sortKey: (row) => Number(row.courseId),
  },
];

const defaultColumns = columns.filter((c) => c.default).map((c) => c.key);
const byKey = new Map(columns.map((column) => [column.key, column]));

const visible = ref<string[]>([...defaultColumns]);
const sortBy = ref<string | null>(null);
const sortDesc = ref(false);
const filters = ref<Record<string, string>>({});

const visibleColumns = computed(() =>
  columns.filter((column) => visible.value.includes(column.key))
);

const filteredRows = computed(() =>
  props.rows.filter((row) =>
    Object.entries(filters.value).every(([key, needle]) => {
      const column = byKey.get(key);
      if (!column || !needle) {
        return true;
      }
      const value = column.text(row);
      return column.filter === "select"
        ? value === needle
        : value.toLowerCase().includes(needle.toLowerCase());
    })
  )
);

const sortedRows = computed(() => {
  const column = sortBy.value ? byKey.get(sortBy.value) : undefined;
  if (!column) {
    return filteredRows.value;
  }
  const key = column.sortKey ?? column.text;
  const direction = sortDesc.value ? -1 : 1;
  return filteredRows.value.toSorted((a, b) => {
    const [valA, valB] = [key(a), key(b)];
    const order =
      typeof valA === "number" && typeof valB === "number"
        ? valA - valB
        : String(valA).localeCompare(String(valB));
    return order * direction;
  });
});

const groupedRows = computed(() => {
  const groups: { module: string; rows: CourseRow[] }[] = [];
  for (const row of sortedRows.value) {
    const last = groups.at(-1);
    if (last && last.module === row.module) {
      last.rows.push(row);
    } else {
      groups.push({ module: row.module, rows: [row] });
    }
  }
  return groups;
});

function options(column: Column) {
  return [...new Set(props.rows.map((row) => column.text(row)))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

function toggleColumn(key: string) {
  visible.value = visible.value.includes(key)
    ? visible.value.filter((k) => k !== key)
    : columns
        .map((c) => c.key)
        .filter((k) => visible.value.includes(k) || k === key);
}

function toggleSort(key: string) {
  if (sortBy.value !== key) {
    sortBy.value = key;
    sortDesc.value = false;
  } else if (!sortDesc.value) {
    sortDesc.value = true;
  } else {
    sortBy.value = null;
    sortDesc.value = false;
  }
}

function setFilter(key: string, value: string) {
  const { [key]: _dropped, ...rest } = filters.value;
  filters.value = value ? { ...rest, [key]: value } : rest;
}

function reset() {
  visible.value = [...defaultColumns];
  sortBy.value = null;
  sortDesc.value = false;
  filters.value = {};
}

function sortIndicator(key: string) {
  return sortBy.value !== key ? "" : sortDesc.value ? "▼" : "▲";
}

function ariaSort(key: string) {
  return sortBy.value !== key
    ? "none"
    : sortDesc.value
    ? "descending"
    : "ascending";
}

// The pages are prerendered,
// so the query string and the stored preferences are only available once we are
// running in the browser.
// Applying them after mount keeps the hydrated markup identical to the generated one.
const route = useRoute();
const router = useRouter();
let ready = false;

onMounted(() => {
  const query = route.query;
  const stored = readStored();

  const cols = param(query.cols) ?? stored?.cols;
  if (cols) {
    const keys = cols.split(",").filter((key) => byKey.has(key));
    if (keys.length) {
      visible.value = columns.map((c) => c.key).filter((k) => keys.includes(k));
    }
  }

  const sort = param(query.sort) ?? stored?.sort;
  if (sort) {
    const [key, direction] = sort.split(":");
    if (byKey.has(key)) {
      sortBy.value = key;
      sortDesc.value = direction === "desc";
    }
  }

  filters.value = Object.fromEntries(
    Object.entries(query)
      .filter(([key]) => key.startsWith("q_") && byKey.has(key.slice(2)))
      .map(([key, value]) => [key.slice(2), param(value)])
      .filter(([, value]) => value)
  ) as Record<string, string>;

  ready = true;
});

watch([visible, sortBy, sortDesc, filters], () => {
  if (!ready) {
    return;
  }
  const sort = sortBy.value
    ? `${sortBy.value}:${sortDesc.value ? "desc" : "asc"}`
    : undefined;
  const cols = visible.value.join(",");

  router.replace({
    query: {
      ...(cols === defaultColumns.join(",") ? {} : { cols }),
      ...(sort ? { sort } : {}),
      ...Object.fromEntries(
        Object.entries(filters.value)
          .filter(([, value]) => value)
          .map(([key, value]) => [`q_${key}`, value])
      ),
    },
  });

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ cols, ...(sort ? { sort } : {}) })
    );
  } catch {
    // storage may be unavailable, the column setup is not worth failing over
  }
});

function param(value: unknown): string | undefined {
  const single = Array.isArray(value) ? value[0] : value;
  return typeof single === "string" && single ? single : undefined;
}

function readStored(): { cols?: string; sort?: string } | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
  } catch {
    return null;
  }
}
</script>

<style scoped>
.columns {
  margin: 1em 0;
}
.columns label {
  display: inline-block;
  margin-right: 1em;
  white-space: nowrap;
}
.summary {
  color: #555;
  font-size: 0.9em;
}
th {
  padding: 0;
}
button.sort {
  width: 100%;
  padding: 5px;
  border: none;
  background: none;
  font: inherit;
  font-weight: bold;
  text-align: left;
  cursor: pointer;
}
.indicator {
  color: #555;
}
.filters td {
  padding: 2px;
}
.filters input,
.filters select {
  width: 100%;
  box-sizing: border-box;
  font: inherit;
}
.numeric {
  text-align: right;
}
.dates {
  white-space: nowrap;
}
</style>
