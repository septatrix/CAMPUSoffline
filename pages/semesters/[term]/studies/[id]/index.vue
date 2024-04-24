<template>
  <h2>Summer Semester 2024</h2>

  {{ data!.studyNameInfo.name.value }}
  ({{ data!.studyNameInfo.curriculumVersionIdentification }})

  <CurriculumTree :children="data!.currics">
    <template #default="{ path, node, id }">
      <a :href="`courses/${[...path, id].join('/')}/`">
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
</script>
