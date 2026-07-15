<script setup lang="ts">
defineProps<{
  sources: { label: string; url?: string }[]
  districtName: string
  shortName: string
  year: string
  verifiedDate: string | null
  sourceVersion?: string | null
}>()
</script>

<template>
  <div class="bg-gray-50 rounded-xl border border-gray-100 p-5">
    <h2 class="text-sm font-semibold text-gray-700 mb-2">Sources and Verification</h2>
    <p class="text-sm text-gray-600 mb-3">
      MySchoolDates is an independent calendar reference and is not affiliated with {{ districtName }}.
      Calendar dates are based on {{ districtName }}'s official {{ year }} calendar.
      <template v-if="verifiedDate"> Reviewed by our editorial team on {{ verifiedDate }}.</template>
      <template v-else> Not yet independently reviewed against the official source.</template>
    </p>
    <ul class="space-y-1.5 mb-3">
      <li v-for="src in sources" :key="src.label" class="flex items-start gap-2 text-xs text-gray-500">
        <svg class="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        <a v-if="src.url" :href="src.url" target="_blank" rel="noopener" class="underline hover:text-blue-600 transition-colors">{{ src.label }}</a>
        <span v-else>{{ src.label }}</span>
      </li>
    </ul>
    <div class="text-xs text-gray-500 pt-3 border-t border-gray-200 space-y-1.5">
      <p v-if="sourceVersion">
        <span class="font-medium text-gray-600">Calendar version:</span> {{ sourceVersion }}
      </p>
      <p class="font-medium text-gray-600">How we collect and verify this data</p>
      <p>Each school year, our editorial team downloads the official calendar PDF published on the district's website. We use AI to extract key dates and events from the source document, then manually cross-check first day, last day, major breaks, holidays, student no-school days, early dismissals, exam windows, and alternate-calendar links against the original PDF before publishing.</p>
      <p>Any discrepancy between extracted data and the official document is corrected by hand. The downloadable calendar file is generated from the same reviewed records shown on this page. Staff-only labels are shown only when they change the student calendar, and the official district calendar remains the source of record for last-minute changes.</p>
      <p>Supplemental planning notes and district profile information may change by year. Families should confirm program deadlines, transportation notices, and emergency schedule updates directly with {{ shortName }}.</p>
      <p>
        <a
          href="mailto:hello@myschooldates.com?subject=Calendar%20Correction"
          class="font-medium text-blue-600 hover:text-blue-800 underline"
        >Report a correction</a>
        if a date appears incorrect or outdated.
      </p>
    </div>
  </div>
</template>
