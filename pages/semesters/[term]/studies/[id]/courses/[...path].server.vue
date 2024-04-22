<template>
  <CurriculumTree :children="modules" :stop-nodes="[]">
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
  `/api/semesters/${route.params.term}/studies/${route.params.id}`
);
const attributePath = computed(() =>
  (route.params.path as string[]).slice(0, -1)
);
const modules = computed(() =>
  attributePath.value.reduce(
    (obj, key) => obj[key]["children"],
    data.value!.currics
  )
);
</script>
