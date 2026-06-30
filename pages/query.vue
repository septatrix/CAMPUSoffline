<template>
  <h1>Advanced SQL query</h1>
  <p>
    Run arbitrary read-only SQL against the full course dataset. The whole
    database (a single SQLite file) is downloaded once and executed entirely in
    your browser via the official
    <a href="https://sqlite.org/wasm">SQLite WASM</a> build — there is no
    backend. For the guided, click-through view start from the
    <NuxtLink to="/">semester overview</NuxtLink> instead.
  </p>

  <ClientOnly>
    <p v-if="status === 'loading'">
      Loading database… {{ loadedMb }} MB{{ totalMb ? ` / ${totalMb} MB` : "" }}
    </p>
    <p v-else-if="status === 'error'" class="error">
      Could not load the database: {{ initError }}
    </p>

    <template v-else>
      <details class="schema">
        <summary>Schema reference ({{ schema.length }} tables)</summary>
        <table>
          <tbody v-for="t in schema" :key="t.name">
            <tr>
              <th class="tname" :rowspan="t.columns.length || 1">{{ t.name }}</th>
              <td v-if="t.columns.length">{{ t.columns[0].name }}</td>
              <td v-if="t.columns.length" class="ctype">{{ t.columns[0].type }}</td>
            </tr>
            <tr v-for="col in t.columns.slice(1)" :key="col.name">
              <td>{{ col.name }}</td>
              <td class="ctype">{{ col.type }}</td>
            </tr>
          </tbody>
        </table>
      </details>

      <p class="examples">
        Examples:
        <button
          v-for="ex in examples"
          :key="ex.label"
          type="button"
          @click="run(ex.sql)"
        >
          {{ ex.label }}
        </button>
      </p>

      <textarea v-model="sql" spellcheck="false" rows="8"></textarea>
      <p>
        <button type="button" :disabled="running" @click="run()">
          {{ running ? "Running…" : "Run query" }}
        </button>
        <span v-if="meta.fetched_at" class="meta">
          Data fetched at {{ meta.fetched_at }}
        </span>
      </p>

      <p v-if="execError" class="error">{{ execError }}</p>
      <p v-else-if="rows !== null">
        {{ rows.length }} row{{ rows.length === 1 ? "" : "s" }}
        <template v-if="truncated"> (showing first {{ MAX_ROWS }})</template>
      </p>

      <table v-if="columns.length && !execError" class="results">
        <thead>
          <tr>
            <th v-for="c in columns" :key="c">{{ c }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in rows" :key="i">
            <td v-for="c in columns" :key="c">{{ format(row[c]) }}</td>
          </tr>
        </tbody>
      </table>
    </template>

    <template #fallback>
      <p>Loading the in-browser database engine…</p>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
const MAX_ROWS = 1000;

type ColumnInfo = { name: string; type: string };
type TableSchema = { name: string; columns: ColumnInfo[] };

const status = ref<"loading" | "ready" | "error">("loading");
const initError = ref("");
const loadedMb = ref("0.00");
const totalMb = ref("");

const sql = ref(
  "SELECT title, ects_credits, course_type_name\nFROM courses\nORDER BY ects_credits DESC\nLIMIT 20;"
);
const running = ref(false);
const execError = ref("");
const columns = ref<string[]>([]);
const rows = ref<Record<string, unknown>[] | null>(null);
const truncated = ref(false);
const schema = ref<TableSchema[]>([]);
const meta = reactive<{ fetched_at?: string }>({});

const examples = [
  {
    label: "Highest ECTS",
    sql: "SELECT title, ects_credits, course_type_name\nFROM courses\nORDER BY ects_credits DESC\nLIMIT 20;",
  },
  {
    label: "Courses shared between studies",
    sql: "SELECT c.title, COUNT(DISTINCT p.curriculum_version_id) AS studies\nFROM courses c\nJOIN course_placements p ON p.course_id = c.id\nGROUP BY c.id\nHAVING studies > 1\nORDER BY studies DESC, c.title\nLIMIT 50;",
  },
  {
    label: "Placements joined",
    sql: "SELECT s.designation AS semester, cu.displayed_type AS study_type,\n       cu.name AS study, n.name AS position, c.title, p.credits\nFROM course_placements p\nJOIN courses c  ON c.id = p.course_id\nJOIN curricula cu ON cu.curriculum_version_id = p.curriculum_version_id\nJOIN curriculum_nodes n\n     ON n.curriculum_version_id = p.curriculum_version_id\n    AND n.element_id = p.leaf_element_id\nJOIN semesters s ON s.id = c.semester_id\nORDER BY c.title\nLIMIT 100;",
  },
  {
    label: "Title search",
    sql: "SELECT id, semester_id, title, ects_credits\nFROM courses\nWHERE title LIKE '%Algebra%'\nORDER BY title;",
  },
];

let db: any = null;

function format(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Uint8Array) return `<blob ${v.length} bytes>`;
  return String(v);
}

function run(query?: string) {
  if (!db) return;
  if (query !== undefined) sql.value = query;
  running.value = true;
  execError.value = "";
  try {
    const columnNames: string[] = [];
    const resultRows: Record<string, unknown>[] = db.exec({
      sql: sql.value,
      rowMode: "object",
      returnValue: "resultRows",
      columnNames,
    });
    columns.value = columnNames;
    truncated.value = resultRows.length > MAX_ROWS;
    rows.value = resultRows.slice(0, MAX_ROWS);
  } catch (e: any) {
    execError.value = e?.message ?? String(e);
    rows.value = null;
    columns.value = [];
  } finally {
    running.value = false;
  }
}

function loadSchema() {
  const tables: string[] = db
    .exec({
      sql: "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
      rowMode: "array",
      returnValue: "resultRows",
    })
    .map((r: unknown[]) => r[0] as string);
  schema.value = tables.map((name) => ({
    name,
    columns: db
      .exec({
        sql: `PRAGMA table_info('${name.replace(/'/g, "''")}')`,
        rowMode: "object",
        returnValue: "resultRows",
      })
      .map((c: any) => ({ name: c.name as string, type: (c.type as string) || "" })),
  }));
}

onMounted(async () => {
  try {
    const base = useRuntimeConfig().app.baseURL || "/";
    const dbUrl = `${base.replace(/\/$/, "")}/db/courses.sqlite3`;

    // The "bundler-friendly" default build locates sqlite3.wasm itself via
    // `new URL("sqlite3.wasm", import.meta.url)`, which Vite rewrites to the
    // emitted asset URL — so no explicit locateFile is needed.
    const { default: sqlite3InitModule } = await import("@sqlite.org/sqlite-wasm");
    const sqlite3 = await sqlite3InitModule();

    const resp = await fetch(dbUrl);
    if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching ${dbUrl}`);
    const total = Number(resp.headers.get("content-length")) || 0;
    if (total) totalMb.value = (total / 1e6).toFixed(2);

    const reader = resp.body!.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      loadedMb.value = (received / 1e6).toFixed(2);
    }
    const bytes = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }

    // Load the downloaded file into an in-memory database.
    // https://stackoverflow.com/a/78119681/7583539
    const p = sqlite3.wasm.allocFromTypedArray(bytes);
    db = new sqlite3.oo1.DB();
    const rc = sqlite3.capi.sqlite3_deserialize(
      db.pointer,
      "main",
      p,
      bytes.length,
      bytes.length,
      sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE |
        sqlite3.capi.SQLITE_DESERIALIZE_RESIZEABLE
    );
    db.checkRc(rc);

    loadSchema();
    try {
      for (const [k, v] of db.exec({
        sql: "SELECT key, value FROM meta",
        rowMode: "array",
        returnValue: "resultRows",
      }) as [string, string][]) {
        (meta as Record<string, string>)[k] = v;
      }
    } catch {
      // meta table is optional
    }

    status.value = "ready";
    run();
  } catch (e: any) {
    initError.value = e?.message ?? String(e);
    status.value = "error";
  }
});

onBeforeUnmount(() => {
  try {
    db?.close();
  } catch {
    // ignore
  }
});

useSeoMeta({
  title: "Advanced SQL query — CAMPUSoffline",
  description: "Run arbitrary SQL against the full RWTHonline course dataset.",
});
</script>

<style scoped>
textarea {
  width: 100%;
  font-family: monospace;
  box-sizing: border-box;
}
.examples button,
button {
  margin: 2px 4px 2px 0;
}
.error {
  color: #b00020;
  white-space: pre-wrap;
  font-family: monospace;
}
.meta {
  margin-left: 1em;
  color: #555;
  font-size: 0.9em;
}
.schema {
  margin: 1em 0;
}
.schema table {
  width: auto;
}
.schema .tname {
  text-align: left;
  background-color: #d7e2ef;
}
.schema .ctype {
  color: #555;
  font-style: italic;
}
tbody tr:nth-child(even) {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>
