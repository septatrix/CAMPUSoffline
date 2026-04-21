<template>
  <div id="app">
    <NuxtPage />
  </div>

  <footer>
    <p v-if="conf.public.ciRunUrl">
      Data is refreshed daily at 05:00 using a Github Action. You can check
      <a :href="conf.public.ciRunUrl">the run</a>
      which generated this deployment.
    </p>
    <p v-if="fetchedAt && fetchedAtText">
      Data was last fetched at
      <time :datetime="fetchedAt">{{ fetchedAtText }}</time>.
    </p>
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

const conf = useRuntimeConfig();
const { data: fetchedAt } = await useFetch<string | null>("/api/fetched-at");
const fetchedAtText = computed(() => {
  if (!fetchedAt.value) {
    return null;
  }
  const date = new Date(fetchedAt.value);
  if (Number.isNaN(date.getTime())) {
    return "unavailable";
  }
  return (
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZone: "UTC",
    }).format(date) + " UTC"
  );
});
</script>
