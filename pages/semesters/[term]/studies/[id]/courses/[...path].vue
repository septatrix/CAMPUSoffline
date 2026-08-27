<template>
  <h1>{{ data?.name }}</h1>
  <CoursesTable v-if="data" :children="data.children" />
</template>

<script setup lang="ts">
const route = useRoute();
const { data } = await useFetch(
  `/api/semesters/${route.params.term}/studies/${route.params.id}/courses/${(
    route.params.path as string[]
  ).join("/")}`
);
</script>
