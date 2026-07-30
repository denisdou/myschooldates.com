<script setup lang="ts">
const { formatDate, getBreaks, daysUntil } = useDistrictPage()

const props = defineProps<{
  cal: {
    firstDay: string
    lastDay: string
    totalSchoolDays?: number
    keyDateCardsVariant?: 'compact'
    keyDateCardsFirstLabel?: string
    keyDateCardsSecondLabel?: string
    keyDateCardsSecondValue?: string
    keyDateCardsSecondDate?: string
    keyDateCardsThirdLabel?: string
    keyDateCardsThirdValue?: string
    keyDateCardsThirdDate?: string
    hideInstructionalDaysSummary?: boolean
    calendarType?: string
    meta?: Record<string, any>
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
    ? 'rounded-lg border border-rds-hairline bg-rds-surface-panel p-3'
    : 'p-5'
)
const valueClass = computed(() =>
  isCompact.value ? 'block text-base font-semibold text-[#1f2933]' : 'block text-lg font-semibold tracking-tight text-[#1f2933]'
)
const isTrackCalendar = computed(() => String(props.cal.calendarType ?? '').toLowerCase() === 'track')
const cardSetting = (key: string) => (props.cal as any)[key] ?? props.cal.meta?.[key]
const secondCardLabel = computed(() => cardSetting('keyDateCardsSecondLabel') ?? 'Last Day of School')
const secondCardValue = computed(() => cardSetting('keyDateCardsSecondValue') ?? formatDate(props.cal.lastDay))
const secondCardDate = computed(() => cardSetting('keyDateCardsSecondDate') ?? props.cal.lastDay)
const defaultDaysLabel = computed(() => ((props.cal as any).hideInstructionalDaysSummary ?? props.cal.meta?.hideInstructionalDaysSummary) ? 'Student Days' : 'Instructional Days')
const thirdCardLabel = computed(() =>
  cardSetting('keyDateCardsThirdLabel') ?? (props.cal.totalSchoolDays ? defaultDaysLabel.value : isTrackCalendar.value ? 'Major Break Periods' : 'School Breaks')
)
const thirdCardValue = computed(() =>
  cardSetting('keyDateCardsThirdValue') ?? (props.cal.totalSchoolDays ? `${props.cal.totalSchoolDays} days` : isTrackCalendar.value ? 'Vary by track' : `${breaks.value.length} breaks`)
)
const thirdCardDate = computed(() => cardSetting('keyDateCardsThirdDate'))
</script>

<template>
  <div
    :class="isCompact
      ? 'grid grid-cols-1 gap-4 sm:grid-cols-3'
      : 'grid grid-cols-1 overflow-hidden rounded-lg border border-rds-hairline bg-rds-surface-panel shadow-[0_1px_0_rgba(31,41,51,0.03)] sm:grid-cols-3'"
  >
    <div :class="cardClass">
      <div class="text-xs font-semibold text-[#7b756d] uppercase tracking-wide mb-1">{{ cardSetting('keyDateCardsFirstLabel') ?? 'First Day of School' }}</div>
      <time :datetime="cal.firstDay" :class="valueClass">{{ formatDate(cal.firstDay) }}</time>
      <ClientOnly>
        <div v-if="daysUntilStart > 0" class="mt-2 inline-flex text-sm font-medium text-[#0f5d6b] bg-[#e6f0ef] px-2.5 py-1 rounded-lg">
          {{ daysUntilStart }} days away
        </div>
        <div v-else-if="daysUntilStart === 0" class="mt-2 text-sm font-medium text-[#3f6f48]">Today!</div>
        <div v-else class="mt-2 text-sm text-[#3f6f48]">School is in session</div>
      </ClientOnly>
    </div>
    <div :class="[cardClass, !isCompact ? 'border-t border-rds-hairline sm:border-l sm:border-t-0' : '']">
      <div class="text-xs font-semibold text-[#7b756d] uppercase tracking-wide mb-1">{{ secondCardLabel }}</div>
      <time :datetime="secondCardDate" :class="valueClass">{{ secondCardValue }}</time>
    </div>
    <div :class="[cardClass, !isCompact ? 'border-t border-rds-hairline sm:border-l sm:border-t-0' : '']">
      <div class="text-xs font-semibold text-[#7b756d] uppercase tracking-wide mb-1">
        {{ thirdCardLabel }}
      </div>
      <time v-if="thirdCardDate" :datetime="thirdCardDate" :class="valueClass">{{ thirdCardValue }}</time>
      <div v-else :class="isCompact ? 'text-base font-semibold text-[#1f2933]' : 'text-lg font-semibold tracking-tight text-[#1f2933]'">{{ thirdCardValue }}</div>
    </div>
  </div>
</template>
