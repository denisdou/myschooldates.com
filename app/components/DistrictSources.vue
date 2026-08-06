<script setup lang="ts">
type SourceLink = { label: string; url?: string; note?: string; versionLabel?: string }

const props = defineProps<{
  sources: SourceLink[]
  districtName: string
  shortName: string
  year: string
  verifiedDate: string | null
  sourceVersion?: string | null
  sourceVersionLabel?: string | null
  sourceVersionDisplay?: string | null
  hideSourceVersionDisplay?: boolean
  sourcePdfUrl?: string | null
  reviewSummary?: string | null
  reviewDetails?: string[] | null
  reviewDetailsTitle?: string | null
  maintainerText?: string | null
  nextReviewText?: string | null
  reviewDateLabel?: string | null
}>()

const isArchivedPdfCopy = computed(() => typeof props.sourcePdfUrl === 'string' && props.sourcePdfUrl.includes('assets.myschooldates.com'))
const possessiveDistrictName = computed(() =>
  /(?:s|')$/i.test(props.districtName) ? `${props.districtName}'` : `${props.districtName}'s`
)
const displayYear = computed(() => {
  const match = props.year.match(/^(\d{4})-(\d{4})$/)
  return match ? `${match[1]}–${match[2]!.slice(2)}` : props.year
})
const sourceVersionInline = computed(() =>
  Boolean(!props.hideSourceVersionDisplay && sourceVersionSourceUrl.value && props.sourceVersion)
)
const sourceVersionSourceUrl = computed(() => {
  if (props.hideSourceVersionDisplay || !props.sourceVersion) return ''
  if (props.sourcePdfUrl && props.sources.some(src => src.url === props.sourcePdfUrl)) {
    return props.sourcePdfUrl
  }
  return ''
})
const isSourceVersionLink = (src: SourceLink) =>
  Boolean(sourceVersionSourceUrl.value && src.url === sourceVersionSourceUrl.value)
const sourceVersionLabel = computed(() => props.sourceVersionLabel || 'Calendar version')
const sourceVersionDisplay = computed(() => props.sourceVersionDisplay || props.sourceVersion)
</script>

<template>
  <div id="sources" class="bg-[#f3f0e8] rounded-lg border border-[#e1dbd0] p-5 scroll-mt-24">
    <h2 class="text-lg font-semibold text-[#1f2933] mb-2">Sources and Review Notes</h2>
    <p v-if="reviewSummary" class="text-sm text-[#6b645c] mb-3">
      {{ reviewSummary }}
    </p>
    <p v-else class="text-sm text-[#6b645c] mb-3">
      MySchoolDates is an independent calendar reference and is not affiliated with {{ districtName }}.
      Calendar dates are based on {{ possessiveDistrictName }} official {{ displayYear }} calendar.
      <template v-if="verifiedDate"> We checked the dates against the official district source on {{ verifiedDate }}.</template>
      <template v-else> Not yet checked against the official source.</template>
    </p>
    <ul class="space-y-2 mb-3">
      <li v-for="src in sources" :key="src.label" class="flex min-w-0 items-center gap-2 text-xs text-[#7b756d]">
        <svg class="w-3 h-3 text-[#9a938a] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        <span class="flex min-w-0 max-w-full items-center overflow-hidden whitespace-nowrap">
          <a v-if="src.url" :href="src.url" target="_blank" rel="noopener" class="inline-flex min-w-0 items-center truncate underline hover:text-[#0f5d6b] transition-colors">
            {{ src.label }}
            <span class="sr-only">(opens in a new tab)</span>
          </a>
          <span v-else class="truncate">{{ src.label }}</span>
          <span
            v-if="isSourceVersionLink(src) && sourceVersion"
            class="hidden flex-shrink-0 text-[#8a837a] lg:inline"
          >
            · {{ sourceVersionLabel }}: {{ sourceVersionDisplay }}
          </span>
          <span
            v-if="src.note || src.versionLabel"
            class="hidden flex-shrink-0 text-[#8a837a] lg:inline"
          >
            · {{ src.note || src.versionLabel }}
          </span>
          <span
            v-if="isSourceVersionLink(src) && isArchivedPdfCopy"
            class="hidden flex-shrink-0 text-[#8a837a] xl:inline"
          >
            · Archived official PDF copy stored by MySchoolDates
          </span>
        </span>
      </li>
    </ul>
    <div class="text-xs text-[#7b756d] pt-3 border-t border-[#ddd6cb] space-y-1.5">
      <p v-if="sourceVersion && !sourceVersionInline && !hideSourceVersionDisplay">
        <span class="font-medium text-[#6b645c]">{{ sourceVersionLabel }}:</span>
        <a
          v-if="sourcePdfUrl"
          :href="sourcePdfUrl"
          target="_blank"
          rel="noopener"
          class="font-medium text-[#0f5d6b] hover:text-[#0b4c58] underline"
        >
          {{ sourceVersionDisplay }}
          <span class="sr-only">(opens in a new tab)</span>
        </a>
        <template v-else>{{ sourceVersionDisplay }}</template>
        <template v-if="sourcePdfUrl && isArchivedPdfCopy"> · Archived official PDF copy stored by MySchoolDates</template>
      </p>
      <p v-if="verifiedDate">
        <span class="font-medium text-[#6b645c]">Maintained by:</span>
        {{ maintainerText || 'MySchoolDates Calendar Data Team' }} ·
        <NuxtLink to="/calendar-verification-methodology" class="font-medium text-[#0f5d6b] hover:text-[#0b4c58] underline">
          Verification Methodology
        </NuxtLink>
        ·
        <NuxtLink to="/editorial-policy" class="font-medium text-[#0f5d6b] hover:text-[#0b4c58] underline">
          Editorial Policy
        </NuxtLink>
      </p>
      <p v-if="verifiedDate">
        <span class="font-medium text-[#6b645c]">{{ reviewDateLabel || 'Last manual review' }}:</span>
        {{ verifiedDate }}, by Denis Dou.
      </p>
      <p v-if="verifiedDate">
        <template v-if="nextReviewText">{{ nextReviewText }}</template>
        <template v-else>
          <span class="font-medium text-[#6b645c]">Next review:</span>
          When {{ shortName }} revises the calendar or updates its official calendar page.
        </template>
      </p>
      <details class="pt-1">
        <summary class="cursor-pointer select-none font-medium text-[#6b645c] hover:text-[#1f2933]">
          {{ reviewDetailsTitle || 'How we verify this calendar' }}
        </summary>
        <div class="mt-2 space-y-1.5">
          <template v-if="reviewDetails?.length">
            <p v-for="detail in reviewDetails" :key="detail">{{ detail }}</p>
          </template>
          <template v-else>
            <p>Each school year, MySchoolDates checks the dates shown on this page against the district's published calendar and other official calendar documents.</p>
            <p>If we find a mismatch, we correct the page and update its review date. This page focuses on major districtwide student dates. School-specific dismissal times, testing, staff details, and program events may appear only in the official PDF or individual school calendars. The downloadable calendar file is a one-time import generated from the calendar records used for this page, and the official district calendar remains the source of record for last-minute changes.</p>
            <p>Confirm program deadlines, transportation notices, and emergency schedule changes directly with {{ shortName }}.</p>
          </template>
          <p>
            <a
              href="mailto:hello@myschooldates.com?subject=Calendar%20Correction"
              class="font-medium text-[#0f5d6b] hover:text-[#0b4c58] underline"
            >Report a calendar error</a>
            if a date appears incorrect or outdated.
            See our
            <NuxtLink to="/calendar-verification-methodology" class="font-medium text-[#0f5d6b] hover:text-[#0b4c58] underline">
              Calendar Verification Methodology
            </NuxtLink>
            and
            <NuxtLink to="/editorial-policy" class="font-medium text-[#0f5d6b] hover:text-[#0b4c58] underline">
              Editorial Policy
            </NuxtLink>
            for the verification method and corrections process.
          </p>
        </div>
      </details>
    </div>
  </div>
</template>
