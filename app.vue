<template>
  <div id="app">
    <NuxtPage />
  </div>

  <footer>
    <p>
      Contribute on
      <a href="https://www.github.com/septatrix/CAMPUSoffline">Github</a>.
    </p>
  </footer>
</template>

<script setup lang="ts">
import "~/assets/styles.css";

useSeoMeta({
  title: "CAMPUSoffline",
  description: "The handy search engine for RWTHonline.",
});
</script>
