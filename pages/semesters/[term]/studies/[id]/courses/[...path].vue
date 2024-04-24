<template>
  <CurriculumTree :children="data!" :stop-nodes="[]">
    <template #default="{ node, id }">
      <a
        :href="`https://online.rwth-aachen.de/RWTHonline/ee/ui/ca2/app/desktop/#/slc.tm.cp/student/courses/${id}`"
      >
        {{ node.name }}
      </a>
    </template>
  </CurriculumTree>
</template>

<script setup lang="ts">
const route = useRoute();
const { data } = await useFetch(
  `/api/semesters/${route.params.term}/studies/${route.params.id}/courses/${(
    route.params.path as string[]
  ).join("/")}`
);
</script>
