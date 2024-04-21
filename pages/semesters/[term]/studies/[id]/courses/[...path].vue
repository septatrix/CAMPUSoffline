<template>
  <ul>
    <li v-for="parentMod in modules">
      {{ parentMod.name }}
      <ul>
        <li v-for="(module, id) in parentMod.children" :class="module.iconName">
          <!-- TODO get correct ID and add link to RWTHonline -->
          {{ module.name }} ({{ id }})
        </li>
      </ul>
    </li>
  </ul>
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
    data.value.currics
  )
);
</script>
