<script setup lang="ts">
const { formatShortDate, getBreaks, daysUntil } = useDistrictPage()

const props = defineProps<{
  cal: {
    schoolYear: string
    firstDay: string
    lastDay: string
    events: Array<{ date: string; name: string; type: string }>
  }
}>()

const today = new Date()
today.setHours(0, 0, 0, 0)

const todayStr = (() => {
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})()

const breaks = computed(() => getBreaks(props.cal.events))
const keyDateTypes = new Set(['school_start', 'school_end', 'holiday', 'break_start', 'early_dismissal', 'early_release', 'academic', 'graduation'])
const nextEvent = computed(() =>
  props.cal.events.find(e => keyDateTypes.has(e.type) && new Date(e.date + 'T00:00:00') >= today) ?? null
)

const todayStatus = computed(() => {
  const d = daysUntil(props.cal.firstDay)
  if (todayStr < props.cal.firstDay) {
    return {
      type: 'upcoming' as const,
      headline: d === 0 ? 'School starts today!' : d === 1 ? 'School starts tomorrow' : `School starts in ${d} days`,
      detail: `First day: ${formatShortDate(props.cal.firstDay)}`,
    }
  }
  if (todayStr > props.cal.lastDay) {
    return {
      type: 'ended' as const,
      headline: `The ${props.cal.schoolYear} school year has ended`,
      detail: `Last day was ${formatShortDate(props.cal.lastDay)}`,
    }
  }
  for (const b of breaks.value) {
    if (todayStr >= b.start && todayStr <= b.end) {
      const remaining = daysUntil(b.end)
      return { type: 'break' as const, headline: b.name, detail: `${remaining + 1} day${remaining !== 0 ? 's' : ''} remaining` }
    }
  }
  const holiday = props.cal.events.find(e => e.date === todayStr && (e.type === 'holiday' || e.type === 'no_school'))
  if (holiday) {
    return {
      type: 'holiday' as const,
      headline: holiday.type === 'holiday' ? `No school today — ${holiday.name}` : 'No school today',
      detail: nextEvent.value ? `Next school event: ${formatShortDate(nextEvent.value.date)}` : '',
    }
  }
  return {
    type: 'school' as const,
    headline: 'School is in session',
    detail: nextEvent.value ? `Next: ${nextEvent.value.name} — ${formatShortDate(nextEvent.value.date)}` : '',
  }
})
</script>

<template>
  <ClientOnly>
    <div
      v-if="todayStatus"
      class="rounded-2xl px-6 py-6"
      :class="{
        'bg-green-50 border border-green-200': todayStatus.type === 'school',
        'bg-blue-50 border border-blue-200': todayStatus.type === 'upcoming',
        'bg-purple-50 border border-purple-200': todayStatus.type === 'break',
        'bg-amber-50 border border-amber-200': todayStatus.type === 'holiday',
        'bg-gray-100 border border-gray-200': todayStatus.type === 'ended',
      }"
    >
      <div class="text-xs font-semibold uppercase tracking-wide mb-1"
        :class="{
          'text-green-500': todayStatus.type === 'school',
          'text-blue-500': todayStatus.type === 'upcoming',
          'text-purple-500': todayStatus.type === 'break',
          'text-amber-500': todayStatus.type === 'holiday',
          'text-gray-400': todayStatus.type === 'ended',
        }"
      >Today</div>
      <div
        class="font-bold text-2xl leading-tight"
        :class="{
          'text-green-800': todayStatus.type === 'school',
          'text-blue-800': todayStatus.type === 'upcoming',
          'text-purple-800': todayStatus.type === 'break',
          'text-amber-800': todayStatus.type === 'holiday',
          'text-gray-600': todayStatus.type === 'ended',
        }"
      >{{ todayStatus.headline }}</div>
      <div v-if="todayStatus.detail" class="text-sm mt-1"
        :class="{
          'text-green-600': todayStatus.type === 'school',
          'text-blue-600': todayStatus.type === 'upcoming',
          'text-purple-600': todayStatus.type === 'break',
          'text-amber-600': todayStatus.type === 'holiday',
          'text-gray-500': todayStatus.type === 'ended',
        }"
      >{{ todayStatus.detail }}</div>
      <slot name="cta" />
    </div>
  </ClientOnly>
</template>
