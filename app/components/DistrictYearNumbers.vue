<script setup lang="ts">
import { scoreYearNumbers } from '~/utils/yearNumbers'
import type { YearNumbersPool } from '~/utils/yearNumbers'

const { getBreaks, getSecondSemesterStart, formatShortDate } = useDistrictPage()

const props = defineProps<{
  cal: any
  schoolYear: string
}>()

const cards = computed(() => {
  const events = props.cal.events ?? []
  const breaks = getBreaks(events)
  const winterBreak = breaks.find((b: any) =>
    b.name.toLowerCase().includes('winter') ||
    b.name.toLowerCase().includes('christmas') ||
    b.name.toLowerCase().includes('december')
  ) ?? null
  const secondSemStart = getSecondSemesterStart(events) || null
  const noSchoolDayCount = events.filter((e: any) =>
    ['holiday', 'no_school', 'student_holiday'].includes(e.type)
  ).length

  const pool: YearNumbersPool = {
    instructionalDays: props.cal.totalSchoolDays ?? 180,
    noSchoolDayCount,
    semesters: props.cal.semesters ?? 2,
    extraCards: props.cal.yearNumbers ?? [],
    winterBreakLength: winterBreak?.days ?? null,
    winterBreakStart: winterBreak?.start ?? null,
    winterBreakEnd: winterBreak?.end ?? null,
    secondSemStart,
    firstDay: props.cal.firstDay,
    lastDay: props.cal.lastDay,
  }

  return scoreYearNumbers(pool, props.schoolYear, formatShortDate)
})
</script>

<template>
  <section v-if="cards.length">
    <h2 class="text-xl font-bold text-gray-900 mb-5">The Year, by the Numbers</h2>
    <div class="divide-y divide-gray-100">
      <div v-for="card in cards" :key="card.key" class="py-1.5 first:pt-0">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{{ card.label }}</h3>
        <p class="text-sm text-gray-700 leading-relaxed">
          <strong class="text-gray-900">{{ card.displayValue ?? `${card.value}\u00a0${card.unit}` }}</strong>
          — {{ card.description }}
        </p>
      </div>
    </div>
    <p class="mt-5 text-xs text-gray-400 leading-relaxed">Counts include listed weekday student no-school dates between the first and last day of school. Weekends and pre-year teacher workdays are not counted.</p>
  </section>
</template>
