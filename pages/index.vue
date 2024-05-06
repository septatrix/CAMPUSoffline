<template>
  <h1>CAMPUSoffline</h1>
  <p>Course overview taken from RWTHonline, made usable</p>

  <ul class="stp_1">
    <li v-for="semester in semesters">
      <a :href="`semesters/${semester.id}/`">
        {{ semester["semesterDesignation"]["value"] }}
      </a>
    </li>
  </ul>
</template>

<script setup lang="ts">
const { data: semesters } = await useFetch("/api/semesters");
</script>
