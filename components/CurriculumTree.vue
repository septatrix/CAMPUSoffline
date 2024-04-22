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
          >
            <template #default="{ path, id, node }">
              <slot :path="path" :id="id" :node="node" />
            </template>
          </CurriculumTree>
        </template>
        <slot v-else :path="path" :id="id" :node="child">
          {{ child.name }}
        </slot>
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
    path?: string[];
    stopNodes?: string[];
  }>(),
  {
    path: () => [],
    stopNodes: () => ["stp_1", "stp_2", "stp_3", "stp_4"],
  }
);

const slots = defineSlots<{
  default(props: { path: string[]; id: string; node: TreeNode }): any;
}>();

const sortedChildren = computed(() =>
  Object.entries(props.children).sort(([_keyA, valA], [_keyB, valB]) =>
    valA.name.localeCompare(valB.name)
  )
);
</script>
