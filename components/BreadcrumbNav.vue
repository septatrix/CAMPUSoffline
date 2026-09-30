<template>
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <ol>
      <li v-for="(item, i) in items" :key="item.to ?? item.label">
        <NuxtLink
          v-if="item.to && i < items.length - 1"
          :to="item.to"
        >
          {{ item.label }}
        </NuxtLink>
        <span v-else aria-current="page">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
export type BreadcrumbItem = { label: string; to?: string };

defineProps<{ items: BreadcrumbItem[] }>();
</script>

<style scoped>
.breadcrumbs ol {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0 0 1em;
  padding: 0;
}
.breadcrumbs li:not(:first-child)::before {
  content: "›";
  margin: 0 0.5em;
  color: #7a8793;
}
</style>
