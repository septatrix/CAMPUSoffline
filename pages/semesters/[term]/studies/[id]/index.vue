<template>
  <h1>{{ currSemester?.semesterDesignation.value }}</h1>

  <h2>
    {{ data!.studyNameInfo.name.value }}
    ({{ data!.studyNameInfo.curriculumVersionIdentification }})
  </h2>

  <CurriculumTree :children="data!.currics">
    <template #branch="{ node, path, id }">
      <template
        v-if="Object.values(node.children).some((c) => c.iconName === 'stp_3')"
      >
        <a :href="`courses/${[...path, id].join('/')}/`">
          {{ node.name }}
        </a>
      </template>
    </template>
    <template #leaf="{ node, path, id }">
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
const { data: semesters } = await useFetch("/api/semesters");
const currSemester = computed(() =>
  semesters.value?.find((s) => s.id === parseInt(route.params.term as string))
);
</script>
