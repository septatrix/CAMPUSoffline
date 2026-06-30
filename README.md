# CAMPUSoffline

**The handy search engine for RWTHonline.** A fast, fully static overview of the
courses offered at RWTH Aachen, generated from [RWTHonline][rwthonline] and served
without any backend.

RWTHonline is the official campus management system, but browsing the course
catalogue through it is slow and cumbersome. CAMPUSoffline periodically scrapes the
public course data, restructures it around the question students actually ask —
_"which modules can I take for my study programme this semester?"_ — and renders it
as a plain, snappy, static website.

🔗 **Live site:** https://septatrix.github.io/CAMPUSoffline/

## Features

- **Browse by semester → study → curriculum → course.** Pick a semester, pick your
  study programme, and walk the curriculum tree down to the individual courses.
- **Advanced SQL query page** (`/query`, ⚠️ _work in progress_). The same data is
  also shipped as a single SQLite file. The page loads the official
  [SQLite WASM][sqlite-wasm] build entirely in your browser and lets you run
  arbitrary read-only SQL — useful for cross-cutting questions the guided view
  cannot answer (courses shared between studies, ECTS filters across all semesters,
  free-text search, …). No backend, no server-side query execution.

## How it works

Everything is generated ahead of time and deployed to GitHub Pages; there is no
runtime server. The build is a three-stage data pipeline followed by a static site
generation step:

| Stage | Script | Output |
| --- | --- | --- |
| Fetch | [`fetch-data.ts`](./fetch-data.ts) | Raw course JSON in `~/.cache/campusoffline/<semesterId>/course<id>.json` |
| Transform | [`transform.ts`](./transform.ts) | Per-semester `studiesTree.json` powering the browse pages |
| Build DB | [`build-db.ts`](./build-db.ts) | `public/db/courses.sqlite3` powering the query page |
| Generate | `nuxt generate` | Static site in `.output/public` |

The browse pages are served by [Nuxt][nuxt] server routes that read the cached JSON
during prerendering, so the deployed site is 100% static.

### The SQLite database

`build-db.ts` reshapes the cached course data into a small relational schema:

- `semesters` — one row per semester
- `courses` — one row per course offering (title, ECTS, course type, …)
- `curricula` — one row per study programme / curriculum version
- `curriculum_nodes` — the curriculum tree as an adjacency list (`parent_element_id`)
- `course_placements` — fact table linking each course to where it sits in a study
- `meta` — `fetched_at` / `generated_at` timestamps

The query page downloads this file once and loads it into an in-memory database via
[`sqlite3_deserialize`][deserialize]. This in-memory path needs no cross-origin
isolation headers (COOP/COEP), which GitHub Pages cannot set.

## Development

### Requirements

- **Node.js ≥ 22** — `build-db.ts` uses the built-in [`node:sqlite`][node-sqlite]
  module, which is unavailable on older versions.
- **[pnpm][pnpm]**

### Setup

```bash
pnpm install
```

### Generate the data

The browse pages and the query database are built from a local cache. Populate it,
then derive the artefacts (this talks to RWTHonline, so it needs network access):

```bash
pnpx tsx fetch-data.ts     # scrape RWTHonline into ~/.cache/campusoffline/
pnpx tsx transform.ts      # build the per-semester studiesTree.json
pnpx tsx build-db.ts       # build public/db/courses.sqlite3
```

### Run

```bash
pnpm run dev               # dev server on http://localhost:3000
pnpm run generate          # produce the static site in .output/public
pnpm run preview           # preview the generated static site
```

## Deployment

[`.github/workflows/build.yaml`](./.github/workflows/build.yaml) runs the full
pipeline on every push to `master`, daily at 05:00 UTC, and on manual dispatch, then
publishes the generated site to GitHub Pages.

## Data & disclaimer

This is an unofficial project and is not affiliated with or endorsed by RWTH Aachen.
All course data originates from [RWTHonline][rwthonline] and belongs to its
respective owners. The query interface in particular is experimental and may change
or break at any time.

Contributions and feedback are welcome — please open an issue or pull request.

[rwthonline]: https://online.rwth-aachen.de/
[nuxt]: https://nuxt.com/
[pnpm]: https://pnpm.io/
[sqlite-wasm]: https://sqlite.org/wasm
[node-sqlite]: https://nodejs.org/api/sqlite.html
[deserialize]: https://www.sqlite.org/c3ref/deserialize.html
