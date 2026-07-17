<script setup lang="ts">
const { formatShortDate } = useDistrictPage()

defineProps<{
  alternateCalendars: { label: string; type: string; firstDay?: string; pdfUrl?: string }[]
  districtName: string
}>()
</script>

<template>
  <div id="other-calendars" class="bg-white rounded-xl border border-gray-200 p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-1">Other Official Calendars</h2>
    <p class="text-sm text-gray-500 mb-4">{{ districtName }} also publishes official calendars for specific school types.</p>
    <ul class="space-y-0">
      <li
        v-for="alt in alternateCalendars"
        :key="alt.type"
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-3 border-b border-gray-100 last:border-0"
      >
        <div class="min-w-0">
          <div class="text-sm font-medium text-gray-900">{{ alt.label }}</div>
          <div v-if="alt.firstDay" class="text-xs text-gray-500 mt-0.5">First day: {{ formatShortDate(alt.firstDay) }}</div>
        </div>
        <a
          v-if="alt.pdfUrl"
          :href="alt.pdfUrl"
          target="_blank"
          rel="noopener"
          class="w-full sm:w-auto sm:flex-shrink-0 inline-flex items-center justify-center gap-1.5 text-center whitespace-normal text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          View {{ alt.label }} PDF
          <span class="sr-only">(opens in a new tab)</span>
        </a>
      </li>
    </ul>
  </div>
</template>
