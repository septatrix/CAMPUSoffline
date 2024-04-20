<template>
  <h1>RWTHoffline</h1>
  <p>Course overview taken from RWTHonline, made usable</p>

  <ul class="stp_1">
    <li v-for="semester in data.semesters">
      <a :href="`semesters/${semester.id}/`">
        {{ semester["semesterDesignation"]["value"] }}
      </a>
    </li>
  </ul>
</template>

<script setup lang="ts">
const { data } = await useFetch<any>(
  "https://online.rwth-aachen.de/RWTHonline/ee/rest/slc.lib.tm/semesters/student",
  { headers: { Accept: "application/json" } }
);
</script>
