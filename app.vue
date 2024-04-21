<template>
  <div id="app">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import "~/assets/styles.css";

useSeoMeta({
  title: "CAMPUSoffline",
  description: "The handy search engine for RWTHonline.",
});

useHead({
  link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
});
</script>
