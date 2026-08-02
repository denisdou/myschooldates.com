<script setup lang="ts">
const { formatShortDate } = useDistrictPage()

defineProps<{
  alternateCalendars: { label: string; type: string; firstDay?: string; pdfUrl?: string; buttonLabel?: string; ariaLabel?: string }[]
  districtName: string
  title?: string
  description?: string
  buttonLabel?: string
  footerTitle?: string
  footerDescription?: string
  footerLinkLabel?: string
  footerLinkUrl?: string
}>()
</script>

<template>
  <div id="other-calendars" class="bg-white rounded-lg border border-gray-200 p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ title || 'Other Official Calendars' }}</h2>
    <p class="text-sm text-gray-500 mb-4">{{ description || `${districtName} publishes separate calendars for specific programs.` }}</p>
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
          :aria-label="alt.ariaLabel"
          target="_blank"
          rel="noopener"
          class="w-full sm:w-auto sm:flex-shrink-0 inline-flex items-center justify-center gap-1.5 text-center whitespace-normal text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ alt.buttonLabel || buttonLabel || `View ${alt.label} PDF` }}
          <span class="sr-only">(opens in a new tab)</span>
        </a>
      </li>
    </ul>
    <div v-if="footerTitle || footerDescription || footerLinkUrl" class="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-600">
      <p v-if="footerTitle" class="font-medium text-gray-900">{{ footerTitle }}</p>
      <p v-if="footerDescription" class="mt-1">
        {{ footerDescription }}
        <a
          v-if="footerLinkUrl"
          :href="footerLinkUrl"
          target="_blank"
          rel="noopener"
          class="underline hover:text-[#0f5d6b] transition-colors"
        >
          {{ footerLinkLabel || 'official calendar page' }}.<span class="sr-only">(opens in a new tab)</span>
        </a>
      </p>
      <p v-else-if="footerLinkUrl" class="mt-1">
        <a
          :href="footerLinkUrl"
          target="_blank"
          rel="noopener"
          class="underline hover:text-[#0f5d6b] transition-colors"
        >
          {{ footerLinkLabel || 'official calendar page' }}<span class="sr-only">(opens in a new tab)</span>
        </a>
      </p>
    </div>
  </div>
</template>
