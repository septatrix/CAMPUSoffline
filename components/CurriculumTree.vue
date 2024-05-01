<template>
  <ul class="slim">
    <template v-for="[id, child] in sortedChildren" :key="id">
      <li :class="child.iconName" v-if="child.iconName !== LEAF_NODE">
        <template
          v-if="
            Object.values(child.children).some((c) => c.iconName !== LEAF_NODE)
          "
        >
          <slot name="branch" :path="path" :id="id" :node="child">
            {{ child.name }}
          </slot>
          <CurriculumTree :children="child.children" :path="[...path, id]">
            <template #branch="props">
              <slot name="branch" v-bind="props" />
            </template>
            <template #leaf="props">
              <slot name="leaf" v-bind="props" />
            </template>
          </CurriculumTree>
        </template>
        <slot v-else name="leaf" :path="path" :id="id" :node="child">
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

const LEAF_NODE = "stp_3";

const props = withDefaults(
  defineProps<{
    children: TreeNode["children"];
    path?: string[];
  }>(),
  { path: () => [] }
);

const slots = defineSlots<{
  branch(props: { path: string[]; id: string; node: TreeNode }): any;
  leaf(props: { path: string[]; id: string; node: TreeNode }): any;
}>();

const sortedChildren = computed(() =>
  Object.entries(props.children).sort(([_keyA, valA], [_keyB, valB]) =>
    valA.name.localeCompare(valB.name)
  )
);
</script>
