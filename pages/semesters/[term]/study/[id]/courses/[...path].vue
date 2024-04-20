<template>
  <ul>
    <li v-for="parentMod in modules">
      {{ parentMod.name }}
      <ul>
        <li v-for="(module, id) in parentMod.children">
          <a
            :href="`https://online.rwth-aachen.de/RWTHonline/ee/ui/ca2/app/desktop/#/slc.tm.cp/student/courses/${id}`"
          >
            {{ module.name }}
            <br />
            {{ module }}
          </a>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script setup lang="ts">
const route = useRoute();
const { data } = await useFetch(`/api/studiesTree/${route.params.id}`);
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
