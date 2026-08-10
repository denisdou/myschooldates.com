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
  hideReviewDate?: boolean
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
  <div id="sources" class="district-source-panel scroll-mt-24 p-6">
    <h2 class="text-xl font-semibold tracking-tight text-rds-ink mb-2">Sources and Review Notes</h2>
    <p v-if="reviewSummary" class="text-sm leading-relaxed text-rds-ink-muted mb-4">
      {{ reviewSummary }}
    </p>
    <p v-else class="text-sm leading-relaxed text-rds-ink-muted mb-4">
      MySchoolDates is an independent calendar reference and is not affiliated with {{ districtName }}.
      Calendar dates are based on {{ possessiveDistrictName }} official {{ displayYear }} calendar.
      <template v-if="verifiedDate"> We checked the dates against the official district source on {{ verifiedDate }}.</template>
      <template v-else> Not yet checked against the official source.</template>
    </p>
    <ul class="space-y-2.5 mb-4">
      <li v-for="src in sources" :key="src.label" class="flex min-w-0 items-center gap-2 text-xs text-rds-ink-dim">
        <svg class="w-3 h-3 text-rds-ink-dim flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        <span class="flex min-w-0 max-w-full items-center overflow-hidden whitespace-nowrap">
          <a v-if="src.url" :href="src.url" target="_blank" rel="noopener" class="rds-link inline-flex min-w-0 items-center truncate underline">
            {{ src.label }}
            <span class="sr-only">(opens in a new tab)</span>
          </a>
          <span v-else class="truncate">{{ src.label }}</span>
          <span
            v-if="isSourceVersionLink(src) && sourceVersion"
            class="hidden flex-shrink-0 text-rds-ink-dim lg:inline"
          >
            · {{ sourceVersionLabel }}: {{ sourceVersionDisplay }}
          </span>
          <span
            v-if="src.note || src.versionLabel"
            class="hidden flex-shrink-0 text-rds-ink-dim lg:inline"
          >
            · {{ src.note || src.versionLabel }}
          </span>
          <span
            v-if="isSourceVersionLink(src) && isArchivedPdfCopy"
            class="hidden flex-shrink-0 text-rds-ink-dim xl:inline"
          >
            · Archived official PDF copy stored by MySchoolDates
          </span>
        </span>
      </li>
    </ul>
    <div class="district-source-panel__rule space-y-2 pt-4 text-xs leading-relaxed text-rds-ink-dim">
      <p v-if="sourceVersion && !sourceVersionInline && !hideSourceVersionDisplay">
        <span class="font-medium text-rds-ink-muted">{{ sourceVersionLabel }}:</span>
        <a
          v-if="sourcePdfUrl"
          :href="sourcePdfUrl"
          target="_blank"
          rel="noopener"
          class="rds-link font-medium underline"
        >
          {{ sourceVersionDisplay }}
          <span class="sr-only">(opens in a new tab)</span>
        </a>
        <template v-else>{{ sourceVersionDisplay }}</template>
        <template v-if="sourcePdfUrl && isArchivedPdfCopy"> · Archived official PDF copy stored by MySchoolDates</template>
      </p>
      <p v-if="verifiedDate">
        <span class="font-medium text-rds-ink-muted">Maintained by:</span>
        {{ maintainerText || 'MySchoolDates Calendar Data Team' }} ·
        <NuxtLink to="/calendar-verification-methodology" class="rds-link font-medium underline">
          Verification Methodology
        </NuxtLink>
        ·
        <NuxtLink to="/editorial-policy" class="rds-link font-medium underline">
          Editorial Policy
        </NuxtLink>
      </p>
      <p v-if="verifiedDate && !hideReviewDate">
        <span class="font-medium text-rds-ink-muted">{{ reviewDateLabel || 'Last manual review' }}:</span>
        {{ verifiedDate }}, by Denis Dou.
      </p>
      <p v-if="verifiedDate">
        <template v-if="nextReviewText">{{ nextReviewText }}</template>
        <template v-else>
          <span class="font-medium text-rds-ink-muted">Next review:</span>
          When {{ shortName }} revises the calendar or updates its official calendar page.
        </template>
      </p>
      <details class="pt-1">
        <summary class="cursor-pointer select-none font-medium text-rds-ink-muted hover:text-rds-ink">
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
              class="rds-link font-medium underline"
            >Report a calendar error</a>
            if a date appears incorrect or outdated.
            See our
            <NuxtLink to="/calendar-verification-methodology" class="rds-link font-medium underline">
              Calendar Verification Methodology
            </NuxtLink>
            and
            <NuxtLink to="/editorial-policy" class="rds-link font-medium underline">
              Editorial Policy
            </NuxtLink>
            for the verification method and corrections process.
          </p>
        </div>
      </details>
    </div>
  </div>
</template>
