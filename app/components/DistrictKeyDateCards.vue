<script setup lang="ts">
const { formatDate, formatShortDate, getBreaks, daysUntil } = useDistrictPage()

const props = defineProps<{
  cal: {
    firstDay: string
    lastDay: string
    events: Array<{ date: string; name: string; type: string }>
  }
}>()

const today = new Date()
today.setHours(0, 0, 0, 0)

const breaks = computed(() => getBreaks(props.cal.events))
const daysUntilStart = computed(() => daysUntil(props.cal.firstDay))
const keyDateTypes = new Set(['school_start', 'school_end', 'holiday', 'break_start', 'early_dismissal', 'early_release', 'academic', 'graduation'])
const nextEvent = computed(() =>
  props.cal.events.find(e => keyDateTypes.has(e.type) && new Date(e.date + 'T00:00:00') >= today) ?? null
)
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div class="bg-white rounded-xl border border-gray-200 p-5">
      <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">First Day of School</div>
      <div class="text-lg font-bold text-gray-900">{{ formatDate(cal.firstDay) }}</div>
      <ClientOnly>
        <div v-if="daysUntilStart > 0" class="mt-2 inline-flex text-sm font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
          {{ daysUntilStart }} days away
        </div>
        <div v-else-if="daysUntilStart === 0" class="mt-2 text-sm font-medium text-green-700">Today!</div>
        <div v-else class="mt-2 text-sm text-green-600">School is in session</div>
      </ClientOnly>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 p-5">
      <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Last Day of School</div>
      <div class="text-lg font-bold text-gray-900">{{ formatDate(cal.lastDay) }}</div>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 p-5">
      <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{{ nextEvent ? 'Next Key Date' : 'School Breaks' }}</div>
      <template v-if="nextEvent">
        <div class="text-lg font-bold text-gray-900">{{ nextEvent.name }}</div>
        <div class="text-sm text-gray-500 mt-1">{{ formatShortDate(nextEvent.date) }}</div>
      </template>
      <div v-else class="text-lg font-bold text-gray-900">{{ breaks.length }} breaks</div>
    </div>
  </div>
</template>
