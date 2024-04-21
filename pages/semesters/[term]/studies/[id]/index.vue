<template>
  <h2>Summer Semester 2024</h2>

  {{ data.studyNameInfo.name.value }}
  ({{ data.studyNameInfo.curriculumVersionIdentification }})

  <CurriculumTree
    :tree="{ name: '', iconName: 'stp_5', children: data.currics }"
  />
</template>

<script setup lang="ts">
const route = useRoute();
const { data } = await useFetch(
  `/api/semesters/${route.params.term}/studies/${route.params.id}`
);
</script>
