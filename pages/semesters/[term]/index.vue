<template>
  <ul class="slim nowrap stp_1">
    <li v-for="[type, studies] in studyTree">
      <details open>
        <summary>{{ type }}</summary>
        <ul class="slim study-class stp_0">
          <li v-for="study in studies">
            <a :href="`studies/${study.id}/`">
              {{ study.name }} ({{ study.version }})
            </a>
          </li>
        </ul>
      </details>
    </li>
  </ul>
</template>

<script setup lang="ts">
const route = useRoute();
const { data } = await useFetch(`/api/semesters/${route.params.term}`);

// TODO replace with Object.groupBy once node/TS supports it
function groupBy<K extends PropertyKey, T>(
  items: T[],
  keySelector: (item: T, index: number) => K
): Partial<Record<K, T[]>> {
  return items.reduce<Partial<Record<K, T[]>>>((storage, item, idx) => {
    const key = keySelector(item, idx);
    storage[key] = storage[key] || [];
    storage[key]!.push(item);
    return storage;
  }, {});
}

const SORT_ORDER = [
  "Bachelor",
  "Bachelor 1 Fach",
  "Bachelor (2 Fächer)",
  "Bachelor 2 Fach",
  "Master",
  "Master 1 Fach",
  "Master (2 Fächer)",
  "Master 2 Fächer",
  "Bachelor Lehramt an Gymnasien und Gesamtschulen",
  "Bachelor Lehramt an Berufskollegs",
  "Master Lehramt an Gymnasien und Gesamtschulen",
  "Master Lehramt an Gymnasien u. Gesamtschulen",
  "Master Lehramt an Berufskollegs",
  "LA Master Berufskollegs (berufsbegleitend)",
  "Abschluss im Ausland",
  "Promotion",
  "Erweiterungsstudium Bachelor Lehramt an Gymnasien und Gesamtschulen",
  "Erweiterungsstudium Bachelor Lehramt an Berufskollegs",
  "Erweiterungsstudium Master Lehramt an Gymnasien und Gesamtschulen",
  "Erweiterungsstudium Master Lehramt an Berufskollegs",
];

const studyTree = computed(() => {
  const studies = data.value!.map((s) => ({
    id: s.curriculumVersionId,
    type: s.displayedType.value,
    name: s.name.value,
    version: s.curriculumVersionIdentification,
  }));
  return Object.entries(groupBy(studies, ({ type }) => type))
    .map(
      ([group, entries]) =>
        [
          group,
          (entries ?? []).toSorted(({ name: nameA }, { name: nameB }) =>
            nameA.localeCompare(nameB)
          ),
        ] as const
    )
    .toSorted(
      ([typeA], [typeB]) =>
        SORT_ORDER.indexOf(typeA) - SORT_ORDER.indexOf(typeB)
    );
});
</script>
