<script setup lang="ts">
const { formatDate, getBreaks, daysUntil } = useDistrictPage()

const props = defineProps<{
  cal: {
    firstDay: string
    lastDay: string
    totalSchoolDays?: number
    keyDateCardsVariant?: 'compact'
    keyDateCardsFirstLabel?: string
    keyDateCardsThirdLabel?: string
    keyDateCardsThirdValue?: string
    calendarType?: string
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
const isTrackCalendar = computed(() => String(props.cal.calendarType ?? '').toLowerCase() === 'track')
const thirdCardLabel = computed(() =>
  props.cal.keyDateCardsThirdLabel ?? (props.cal.totalSchoolDays ? 'Instructional Days' : isTrackCalendar.value ? 'Major Break Periods' : 'School Breaks')
)
const thirdCardValue = computed(() =>
  props.cal.keyDateCardsThirdValue ?? (props.cal.totalSchoolDays ? `${props.cal.totalSchoolDays} days` : isTrackCalendar.value ? 'Vary by track' : `${breaks.value.length} breaks`)
)
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div :class="cardClass">
      <div class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{{ cal.keyDateCardsFirstLabel ?? 'First Day of School' }}</div>
      <time :datetime="cal.firstDay" :class="valueClass">{{ formatDate(cal.firstDay) }}</time>
      <ClientOnly>
        <div v-if="daysUntilStart > 0" class="mt-2 inline-flex text-sm font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
          {{ daysUntilStart }} days away
        </div>
        <div v-else-if="daysUntilStart === 0" class="mt-2 text-sm font-medium text-green-700">Today!</div>
        <div v-else class="mt-2 text-sm text-green-700">School is in session</div>
      </ClientOnly>
    </div>
    <div :class="cardClass">
      <div class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Last Day of School</div>
      <time :datetime="cal.lastDay" :class="valueClass">{{ formatDate(cal.lastDay) }}</time>
    </div>
    <div :class="cardClass">
      <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        {{ thirdCardLabel }}
      </div>
      <div :class="isCompact ? 'text-base font-semibold text-gray-900' : 'text-lg font-bold text-gray-900'">{{ thirdCardValue }}</div>
    </div>
  </div>
</template>
