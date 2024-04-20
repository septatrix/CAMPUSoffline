<template>
  <a
    v-if="
      sortedChildren.some(([_, c]) => !['stp_0', 'stp_5'].includes(c.iconName))
    "
    :href="`courses/${linkPrefix}`"
  >
    {{ tree.name }}
  </a>
  <span v-else>{{ tree.name }}</span>
  <ul class="slim">
    <template v-for="[id, treeNode] in sortedChildren" :key="id">
      <li
        v-if="['stp_0', 'stp_5'].includes(treeNode.iconName)"
        :class="treeNode.iconName"
      >
        <CurriculumTree :tree="treeNode" :link-prefix="`${linkPrefix}${id}/`" />
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
    tree: TreeNode;
    linkPrefix?: string;
  }>(),
  { linkPrefix: "" }
);

const sortedChildren = computed(() =>
  Object.entries(props.tree.children).sort(([_keyA, valA], [_keyB, valB]) =>
    valA.name.localeCompare(valB.name)
  )
);
</script>
