<script setup lang="ts">
const props = defineProps<{
  sources: { label: string; url?: string }[]
  districtName: string
  shortName: string
  year: string
  verifiedDate: string | null
  sourceVersion?: string | null
  sourcePdfUrl?: string | null
}>()

const isArchivedPdfCopy = computed(() => typeof props.sourcePdfUrl === 'string' && props.sourcePdfUrl.includes('assets.myschooldates.com'))
const possessiveDistrictName = computed(() =>
  /(?:s|')$/i.test(props.districtName) ? `${props.districtName}'` : `${props.districtName}'s`
)
const displayYear = computed(() => {
  const match = props.year.match(/^(\d{4})-(\d{4})$/)
  return match ? `${match[1]}–${match[2]!.slice(2)}` : props.year
})
</script>

<template>
  <div class="bg-gray-50 rounded-xl border border-gray-100 p-5">
    <h2 class="text-sm font-semibold text-gray-700 mb-2">Sources and Review Notes</h2>
    <p class="text-sm text-gray-600 mb-3">
      MySchoolDates is an independent calendar reference and is not affiliated with {{ districtName }}.
      Calendar dates are based on {{ possessiveDistrictName }} official {{ displayYear }} calendar.
      <template v-if="verifiedDate"> We checked the dates against the official district source on {{ verifiedDate }}.</template>
      <template v-else> Not yet checked against the official source.</template>
    </p>
    <ul class="space-y-1.5 mb-3">
      <li v-for="src in sources" :key="src.label" class="flex items-start gap-2 text-xs text-gray-500">
        <svg class="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        <a v-if="src.url" :href="src.url" target="_blank" rel="noopener" class="inline-flex min-h-11 items-center underline hover:text-blue-700 transition-colors">
          {{ src.label }}
          <span class="sr-only">(opens in a new tab)</span>
        </a>
        <span v-else>{{ src.label }}</span>
      </li>
    </ul>
    <div class="text-xs text-gray-500 pt-3 border-t border-gray-200 space-y-1.5">
      <p v-if="sourceVersion">
        <span class="font-medium text-gray-600">Calendar version:</span>
        <a
          v-if="sourcePdfUrl"
          :href="sourcePdfUrl"
          target="_blank"
          rel="noopener"
          class="font-medium text-blue-600 hover:text-blue-800 underline"
        >
          {{ sourceVersion }}
          <span class="sr-only">(opens in a new tab)</span>
        </a>
        <template v-else>{{ sourceVersion }}</template>
        <template v-if="sourcePdfUrl && isArchivedPdfCopy"> · Archived official PDF copy stored by MySchoolDates</template>
      </p>
      <p v-if="verifiedDate">
        <span class="font-medium text-gray-600">Maintained by:</span>
        MySchoolDates Calendar Data Team ·
        <NuxtLink to="/calendar-verification-methodology" class="font-medium text-blue-600 hover:text-blue-800 underline">
          Verification Methodology
        </NuxtLink>
        ·
        <NuxtLink to="/editorial-policy" class="font-medium text-blue-600 hover:text-blue-800 underline">
          Editorial Policy
        </NuxtLink>
      </p>
      <p v-if="verifiedDate">
        <span class="font-medium text-gray-600">Last manual review:</span>
        {{ verifiedDate }}, by Denis Dou.
      </p>
      <p v-if="verifiedDate">
        <span class="font-medium text-gray-600">Next review:</span>
        When {{ shortName }} publishes a calendar update or a revised official source.
      </p>
      <details class="pt-1">
        <summary class="cursor-pointer select-none font-medium text-gray-600 hover:text-gray-800">
          How we verify this calendar
        </summary>
        <div class="mt-2 space-y-1.5">
          <p>Each school year, MySchoolDates checks the dates shown on this page against the district's published calendar and other official calendar documents.</p>
          <p>If we find a mismatch, we correct the page and update its review date. This page focuses on major districtwide student dates. School-specific dismissal times, testing, staff details, and program events may appear only in the official PDF or individual school calendars. The downloadable calendar file is a one-time import generated from the calendar records used for this page, and the official district calendar remains the source of record for last-minute changes.</p>
          <p>Confirm program deadlines, transportation notices, and emergency schedule changes directly with {{ shortName }}.</p>
          <p>
            <a
              href="mailto:hello@myschooldates.com?subject=Calendar%20Correction"
              class="font-medium text-blue-600 hover:text-blue-800 underline"
            >Report a calendar error</a>
            if a date appears incorrect or outdated.
            See our
            <NuxtLink to="/calendar-verification-methodology" class="font-medium text-blue-600 hover:text-blue-800 underline">
              Calendar Verification Methodology
            </NuxtLink>
            and
            <NuxtLink to="/editorial-policy" class="font-medium text-blue-600 hover:text-blue-800 underline">
              Editorial Policy
            </NuxtLink>
            for the verification method and corrections process.
          </p>
        </div>
      </details>
    </div>
  </div>
</template>
