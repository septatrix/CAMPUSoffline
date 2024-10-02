<template>
  <h1>{{ data?.name }}</h1>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Course Type</th>
        <th>Name</th>
        <th>Credits</th>
        <th>ID</th>
      </tr>
    </thead>
    <template v-for="(value, key) in data?.children">
      <tbody>
        <template v-for="(value2, key2, idx) in value.children">
          <tr v-for="(node, id, idx2) in value2.children">
            <!--
              The rowspan shenanigans are to fix one of:
              - https://bugzilla.mozilla.org/show_bug.cgi?id=1000435
              - https://bugzilla.mozilla.org/show_bug.cgi?id=217769
              - https://bugzilla.mozilla.org/show_bug.cgi?id=244135
              - https://bugzilla.mozilla.org/show_bug.cgi?id=332740
              - https://bugzilla.mozilla.org/show_bug.cgi?id=332977
            -->
            <td
              v-if="idx === 0 && idx2 === 0"
              :rowspan="
                Object.values(value.children)
                  .map((v) => Object.values(v.children).length)
                  .reduce((a, b) => a + b)
              "
            >
              {{ value.name }}
            </td>
            <td>
              (<i :class="`icon_${value2.iconName}`" />)
              {{ node.courseTypeDto }}
            </td>
            <td>{{ node.name }}</td>
            <td>{{ node.credits ?? "" }}</td>
            <td>
              <a
                :href="`https://online.rwth-aachen.de/RWTHonline/ee/ui/ca2/app/desktop/#/slc.tm.cp/student/courses/${id}`"
              >
                {{ id }}
              </a>
            </td>
          </tr>
        </template>
      </tbody>
    </template>
  </table>
</template>

<script setup lang="ts">
const route = useRoute();
const { data } = await useFetch(
  `/api/semesters/${route.params.term}/studies/${route.params.id}/courses/${(
    route.params.path as string[]
  ).join("/")}`
);
</script>
