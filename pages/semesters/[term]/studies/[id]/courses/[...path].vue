<template>
  <h1>{{ data?.name }}</h1>
  <CourseTable :rows="rows" />
</template>

<script setup lang="ts">
import type { CourseRow } from "~/course-row";
import type { CourseNode, PathEntry } from "~/studies-tree";

const LEAF_NODE = "stp_empty";
const MODULE_NODE = "stp_3";

const route = useRoute();
const { data } = await useFetch(
  `/api/semesters/${route.params.term}/studies/${route.params.id}/courses/${(
    route.params.path as string[]
  ).join("/")}`
);

/**
 * The depth below a curriculum node varies,
 * so instead of nesting a fixed number of loops the tree is walked down to the courses.
 * The module of a course is the closest module node above it,
 * the direct parent supplies the icon telling apart lecture, exercise and the like.
 */
function flatten(
  node: Pick<PathEntry, "children">,
  ancestors: PathEntry[] = []
): CourseRow[] {
  return Object.entries(node.children ?? {}).flatMap(([id, child]) => {
    if (child.iconName !== LEAF_NODE) {
      return flatten(child, [...ancestors, child]);
    }
    const course = child as CourseNode;
    return [
      {
        key: [...ancestors.map((a) => a.name), id].join("/"),
        module:
          ancestors.findLast((a) => a.iconName === MODULE_NODE)?.name ??
          ancestors[0]?.name ??
          "",
        iconName: ancestors.at(-1)?.iconName ?? "",
        courseType: course.courseType ?? "",
        title: course.name,
        credits: course.credits ?? null,
        sws: course.sws ?? null,
        semesterRecommendation: course.semesterRecommendation ?? null,
        subjectType: course.subjectType ?? null,
        examMethod: course.examMethod ?? null,
        appointments: course.appointments ?? [],
        courseId: id,
      } satisfies CourseRow,
    ];
  });
}

const rows = computed(() =>
  data.value ? flatten(data.value as PathEntry) : []
);
</script>
