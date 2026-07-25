<script setup lang="ts">
const { formatDate, getBreaks, daysUntil } = useDistrictPage()

const props = defineProps<{
  cal: {
    firstDay: string
    lastDay: string
    totalSchoolDays?: number
    keyDateCardsVariant?: 'compact'
    events: Array<{ date: string; name: string; type: string }>
  }
}>()

const today = new Date()
today.setHours(0, 0, 0, 0)

const breaks = computed(() => getBreaks(props.cal.events))
const daysUntilStart = computed(() => daysUntil(props.cal.firstDay))
const isCompact = computed(() => props.cal.keyDateCardsVariant === 'compact')
const cardClass = computed(() =>
  isCompact.value
    ? 'bg-white rounded-lg border border-gray-200 p-3'
    : 'bg-white rounded-xl border border-gray-200 p-5'
)
const valueClass = computed(() =>
  isCompact.value ? 'block text-base font-semibold text-gray-900' : 'block text-lg font-bold text-gray-900'
)
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div :class="cardClass">
      <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">First Day of School</div>
      <time :datetime="cal.firstDay" :class="valueClass">{{ formatDate(cal.firstDay) }}</time>
      <ClientOnly>
        <div v-if="daysUntilStart > 0" class="mt-2 inline-flex text-sm font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
          {{ daysUntilStart }} days away
        </div>
        <div v-else-if="daysUntilStart === 0" class="mt-2 text-sm font-medium text-green-700">Today!</div>
        <div v-else class="mt-2 text-sm text-green-600">School is in session</div>
      </ClientOnly>
    </div>
    <div :class="cardClass">
      <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Last Day of School</div>
      <time :datetime="cal.lastDay" :class="valueClass">{{ formatDate(cal.lastDay) }}</time>
    </div>
    <div :class="cardClass">
      <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        {{ cal.totalSchoolDays ? 'Instructional Days' : 'School Breaks' }}
      </div>
      <div v-if="cal.totalSchoolDays" :class="isCompact ? 'text-base font-semibold text-gray-900' : 'text-lg font-bold text-gray-900'">{{ cal.totalSchoolDays }} days</div>
      <div v-else :class="isCompact ? 'text-base font-semibold text-gray-900' : 'text-lg font-bold text-gray-900'">{{ breaks.length }} breaks</div>
    </div>
  </div>
</template>
