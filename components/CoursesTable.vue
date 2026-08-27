<template>
  <div class="courses-table">
    <div class="controls">
      <label class="filter">
        <span class="visually-hidden">Filter courses</span>
        <input
          v-model="filter"
          type="search"
          placeholder="Filter courses…"
        />
      </label>

      <details class="column-picker">
        <summary>Columns</summary>
        <ul>
          <li v-for="col in columns" :key="col.key">
            <label>
              <input
                type="checkbox"
                :checked="visible[col.key]"
                @change="toggleColumn(col.key)"
              />
              {{ col.label }}
            </label>
          </li>
        </ul>
      </details>

      <p class="count">{{ rows.length }} / {{ allRows.length }} courses</p>
    </div>

    <table>
      <thead>
        <tr>
          <th
            v-for="col in visibleColumns"
            :key="col.key"
            :aria-sort="ariaSort(col.key)"
          >
            <button
              v-if="col.sortable"
              type="button"
              class="sort-btn"
              @click="toggleSort(col.key)"
            >
              {{ col.label }}
              <span class="sort-indicator" aria-hidden="true">{{
                sortIndicator(col.key)
              }}</span>
            </button>
            <template v-else>{{ col.label }}</template>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td
            v-for="col in visibleColumns"
            :key="col.key"
            :class="{ numeric: col.numeric, nowrap: col.nowrap }"
          >
            <template v-if="col.key === 'id'">
              <a :href="courseUrl(row.id)">{{ row.id }}</a>
            </template>
            <template v-else-if="col.key === 'courseType'">
              <i
                v-if="row.parentIconName"
                :class="`icon_${row.parentIconName}`"
              />
              {{ row.courseType }}
            </template>
            <template v-else>{{ display(row[col.key]) }}</template>
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td :colspan="visibleColumns.length" class="empty">
            No courses match the current filter.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { PathEntry } from "~/studies-tree";

const props = defineProps<{
  children: PathEntry["children"];
}>();

type Row = {
  id: string;
  category: string;
  parentIconName: string;
  courseType: string;
  name: string;
  courseNumber: string;
  credits: number | null;
  semesterRecommendation: string;
  subjectType: string;
  examinationMethod: string;
};

type ColumnKey = Exclude<keyof Row, "parentIconName">;

type Column = {
  key: ColumnKey;
  label: string;
  sortable: boolean;
  numeric?: boolean;
  nowrap?: boolean;
  defaultVisible: boolean;
};

const columns: Column[] = [
  { key: "category", label: "Category", sortable: true, defaultVisible: true },
  { key: "courseType", label: "Type", sortable: true, defaultVisible: true },
  { key: "name", label: "Name", sortable: true, defaultVisible: true },
  {
    key: "courseNumber",
    label: "Course No.",
    sortable: true,
    nowrap: true,
    defaultVisible: true,
  },
  {
    key: "credits",
    label: "Credits",
    sortable: true,
    numeric: true,
    defaultVisible: true,
  },
  {
    key: "semesterRecommendation",
    label: "Rec. Sem.",
    sortable: true,
    defaultVisible: true,
  },
  {
    key: "subjectType",
    label: "Subject Type",
    sortable: true,
    defaultVisible: false,
  },
  {
    key: "examinationMethod",
    label: "Exam",
    sortable: true,
    defaultVisible: false,
  },
  { key: "id", label: "ID", sortable: true, nowrap: true, defaultVisible: true },
];

// --- Flatten the curriculum tree into one row per course leaf ---
function collect(
  children: PathEntry["children"],
  ancestors: string[],
  parentIconName: string
): Row[] {
  const out: Row[] = [];
  for (const [id, child] of Object.entries(children)) {
    if (Object.keys(child.children).length === 0) {
      out.push({
        id,
        category: ancestors.join(" › "),
        parentIconName,
        courseType: child.courseTypeDto ?? "",
        name: child.name,
        courseNumber: child.courseNumber ?? "",
        credits: child.credits ?? null,
        semesterRecommendation: child.semesterRecommendation ?? "",
        subjectType: child.subjectType ?? "",
        examinationMethod: child.examinationMethod ?? "",
      });
    } else {
      out.push(...collect(child.children, [...ancestors, child.name], child.iconName));
    }
  }
  return out;
}

const allRows = computed(() => collect(props.children, [], ""));

// --- Column visibility (persisted client-side) ---
const STORAGE_KEY = "campusoffline:courseColumns";
const visible = reactive<Record<ColumnKey, boolean>>(
  Object.fromEntries(columns.map((c) => [c.key, c.defaultVisible])) as Record<
    ColumnKey,
    boolean
  >
);

onMounted(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const saved = JSON.parse(stored) as Partial<Record<ColumnKey, boolean>>;
      for (const col of columns) {
        if (typeof saved[col.key] === "boolean") {
          visible[col.key] = saved[col.key]!;
        }
      }
    }
  } catch {
    // ignore malformed/unavailable storage
  }
});

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visible));
  } catch {
    // ignore unavailable storage
  }
}

function toggleColumn(key: ColumnKey) {
  visible[key] = !visible[key];
  persist();
}

const visibleColumns = computed(() => columns.filter((c) => visible[c.key]));

// --- Sorting ---
const sortKey = ref<ColumnKey | null>(null);
const sortDir = ref<1 | -1>(1);

function toggleSort(key: ColumnKey) {
  if (sortKey.value !== key) {
    sortKey.value = key;
    sortDir.value = 1;
  } else if (sortDir.value === 1) {
    sortDir.value = -1;
  } else {
    // third click clears the sort
    sortKey.value = null;
    sortDir.value = 1;
  }
}

function sortIndicator(key: ColumnKey) {
  if (sortKey.value !== key) return "↕";
  return sortDir.value === 1 ? "▲" : "▼";
}

function ariaSort(key: ColumnKey) {
  if (sortKey.value !== key) return "none";
  return sortDir.value === 1 ? "ascending" : "descending";
}

function compare(a: Row, b: Row, key: ColumnKey): number {
  const va = a[key];
  const vb = b[key];
  // Push empty/missing values to the end regardless of direction.
  const aEmpty = va === null || va === "";
  const bEmpty = vb === null || vb === "";
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1 * sortDir.value;
  if (bEmpty) return -1 * sortDir.value;
  if (typeof va === "number" && typeof vb === "number") return va - vb;
  return String(va).localeCompare(String(vb), undefined, { numeric: true });
}

// --- Filtering ---
const filter = ref("");

const rows = computed(() => {
  const needle = filter.value.trim().toLowerCase();
  let result = allRows.value;
  if (needle) {
    const cols = visibleColumns.value;
    result = result.filter((row) =>
      cols.some((col) =>
        display(row[col.key]).toLowerCase().includes(needle)
      )
    );
  }
  if (sortKey.value) {
    const key = sortKey.value;
    result = [...result].sort((a, b) => compare(a, b, key) * sortDir.value);
  }
  return result;
});

// --- Rendering helpers ---
function display(value: string | number | null): string {
  return value === null ? "" : String(value);
}

function courseUrl(id: string): string {
  return `https://online.rwth-aachen.de/RWTHonline/ee/ui/ca2/app/desktop/#/slc.tm.cp/student/courses/${id}`;
}
</script>

<style scoped>
.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}
.controls input[type="search"] {
  padding: 4px 6px;
  min-width: 16rem;
}
.column-picker summary {
  cursor: pointer;
}
.column-picker ul {
  list-style: none;
  margin: 0.25rem 0 0;
  padding: 0.5rem;
  border: 1px solid #7a8793;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  gap: 0.25rem 1rem;
  background-color: #ffffff;
}
.count {
  margin: 0;
  margin-left: auto;
  color: #555;
}
.sort-btn {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-weight: bold;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
}
.sort-indicator {
  color: #7a8793;
  font-size: 0.85em;
}
td.numeric {
  text-align: right;
}
td.empty {
  text-align: center;
  font-style: italic;
  color: #555;
}
tbody tr:nth-child(odd) {
  background-color: #f3f7fb;
}
tbody tr:nth-child(even) {
  background-color: #e6edf6;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
