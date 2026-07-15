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
  const breakRanges = breaks.map((b: any) => ({ start: b.start, end: b.end }))
  const isWeekday = (date: string) => {
    const day = new Date(date + 'T00:00:00').getDay()
    return day !== 0 && day !== 6
  }
  const isInsideMajorBreak = (date: string) =>
    breakRanges.some((range: { start: string; end: string }) => date >= range.start && date <= range.end)
  const noSchoolDates = new Set(
    events
      .filter((e: any) => ['holiday', 'no_school', 'student_holiday'].includes(e.type))
      .filter((e: any) => isWeekday(e.date) && !isInsideMajorBreak(e.date))
      .map((e: any) => e.date)
  )
  const noSchoolDayCount = noSchoolDates.size

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

  let cards = scoreYearNumbers(pool, props.schoolYear, formatShortDate)
  const hasCustomNoSchoolCard = (props.cal.yearNumbers ?? []).some((card: any) =>
    typeof card.label === 'string' && card.label.toLowerCase().includes('no-school')
  )
  if (hasCustomNoSchoolCard) {
    cards = cards.filter(card => card.key !== 'studentHolidays')
  }
  if (props.cal.yearNumbersMode === 'compact') {
    return cards.filter(card => card.key === 'instructionalDays' || card.key.startsWith('extra_'))
  }
  return cards
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
    <p class="mt-5 text-xs text-gray-400 leading-relaxed">Additional no-school weekday counts include staff workdays and standalone holidays outside the listed Thanksgiving, Winter, and Spring Break periods. Early-dismissal days are not included.</p>
  </section>
</template>
