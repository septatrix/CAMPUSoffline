<template>
  <ul class="slim">
    <template v-for="[id, child] in sortedChildren" :key="id">
      <li :class="child.iconName">
        <template
          v-if="
            Object.values(child.children).some(
              (c) => !stopNodes.includes(c.iconName)
            )
          "
        >
          {{ child.name }}
          <CurriculumTree
            :children="child.children"
            :path="[...path, id]"
            :stop-nodes="stopNodes"
            :create-link="createLink"
          />
        </template>
        <a v-else :href="createLink([...path, id])">
          {{ child.name }}
        </a>
      </li>
    </template>
  </ul>
</template>

<script setup lang="ts">
type TreeNode = {
  name: string;
  iconName: string;
  children: Record<number, TreeNode>;
};

const props = withDefaults(
  defineProps<{
    children: TreeNode["children"];
    createLink?: (path: string[]) => string | undefined;
    path?: string[];
    stopNodes?: string[];
  }>(),
  {
    createLink: () => () => undefined,
    path: () => [],
    stopNodes: () => ["stp_1", "stp_2", "stp_3", "stp_4"],
  }
);

const sortedChildren = computed(() =>
  Object.entries(props.children).sort(([_keyA, valA], [_keyB, valB]) =>
    valA.name.localeCompare(valB.name)
  )
);
</script>
