<template>
  <div id="app">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "CAMPUSoffline",
  description: "The handy search engine for RWTHonline.",
});
</script>

<style>
:root {
  font-family: Arial, Helvetica, sans-serif;
}
a:active,
a:hover {
  color: #000000;
}
.nowrap {
  white-space: nowrap;
}
ul.slim {
  padding-left: 20px;
}

.stp_0 {
  list-style-image: url("~/assets/stp0.svg");
}
.stp_1 {
  list-style-image: url("~/assets/stp1.svg");
}
.stp_2 {
  list-style-image: url("~/assets/stp2.svg");
}
.stp_3 {
  list-style-image: url("~/assets/stp3.svg");
}
.stp_4 {
  list-style-image: url("~/assets/stp4.svg");
}
.stp_5 {
  list-style-image: url("~/assets/stp5.svg");
}
</style>
