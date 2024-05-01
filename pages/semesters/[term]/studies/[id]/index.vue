<template>
  {{ data!.studyNameInfo.name.value }}
  ({{ data!.studyNameInfo.curriculumVersionIdentification }})

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
</script>
