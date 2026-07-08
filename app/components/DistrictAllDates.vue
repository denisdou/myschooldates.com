<script setup lang="ts">
const { formatDate, eventTypeLabel, eventTypeColor } = useDistrictPage()

type CalendarEvent = { date: string; name: string; type: string }
type LegendItem = { label: string; dot: string }

defineProps<{
  events: CalendarEvent[]
  title: string
  sourceUrl: string
  districtName: string
  verifiedDate: string | null
  legend?: LegendItem[]
}>()
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-100">
      <h2 class="text-lg font-semibold text-gray-900" :class="legend?.length ? 'mb-3' : ''">{{ title }}</h2>
      <div v-if="legend?.length" class="flex flex-wrap gap-3">
        <span
          v-for="item in legend"
          :key="item.label"
          class="inline-flex items-center gap-1.5 text-xs text-gray-500"
        >
          <span class="w-2 h-2 rounded-full flex-shrink-0" :class="item.dot" />
          {{ item.label }}
        </span>
      </div>
    </div>
    <div class="divide-y divide-gray-50">
      <div
        v-for="event in events"
        :key="event.date + event.type"
        class="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div>
          <div class="font-medium text-gray-900">{{ event.name }}</div>
          <div class="text-sm text-gray-500">{{ formatDate(event.date) }}</div>
        </div>
        <span class="text-xs font-medium px-2.5 py-1 rounded-full" :class="eventTypeColor[event.type]">
          {{ eventTypeLabel[event.type] }}
        </span>
      </div>
    </div>
    <div class="px-6 py-3 border-t border-gray-50 flex items-center gap-1.5 text-xs text-gray-400">
      <span>Sourced from the</span>
      <a :href="sourceUrl" target="_blank" rel="nofollow noopener" class="underline hover:text-blue-600 transition-colors">{{ districtName }} official calendar</a>
      <template v-if="verifiedDate"><span>· Last reviewed {{ verifiedDate }}</span></template>
    </div>
  </div>
</template>
