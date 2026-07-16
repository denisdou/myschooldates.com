<script setup lang="ts">
const route = useRoute()
const slug = route.params.district as string
const year = route.params.year as string
const { formatShortDate, getBreaks, getSecondSemesterStart } = useDistrictPage()

function toDistrictSummary(d: any) {
  return {
    institutionId: d.institutionId,
    name: d.name,
    shortName: d.shortName,
    slug: d.slug,
    state: d.state,
    stateCode: d.stateCode,
    city: d.city,
    currentSchoolYear: d.currentSchoolYear,
    officialWebsite: d.officialWebsite,
    calendarPage: d.calendarPage,
  }
}

function toComparisonCalendarSummary(c: any) {
  return {
    institutionId: c.institutionId,
    schoolYear: c.schoolYear,
    firstDay: c.firstDay,
    lastDay: c.lastDay,
    sourceUrl: c.sourceUrl,
    sourcePdfUrl: c.sourcePdfUrl,
    sourceVersion: c.sourceVersion,
    events: (c.events ?? [])
      .filter((e: any) => e.type === 'break_start' || e.type === 'break_end')
      .map((e: any) => ({ name: e.name, date: e.date, type: e.type })),
  }
}

const [{ data: district }, { data: cal }, { data: allDistricts }] = await Promise.all([
  useAsyncData(`district:${slug}`, () =>
    queryCollection('districts').where('slug', '=', slug).first()
  ),
  useAsyncData(`cal:${slug}:${year}`, async () => {
    const d = await queryCollection('districts').where('slug', '=', slug).first()
    if (!d) return null
    return queryCollection('calendars')
      .where('institutionId', '=', d.institutionId)
      .where('schoolYear', '=', year)
      .first()
  }),
  useAsyncData('districts-all', async () =>
    (await queryCollection('districts').order('name', 'ASC').all()).map(toDistrictSummary)
  ),
])

const { data: relatedCals } = await useAsyncData(`related-cals:${slug}:${year}`, async () => {
  if (!district.value?.relatedDistricts?.length) return []
  const relatedSlugs = new Set((district.value.relatedDistricts as { slug: string }[]).map(rd => rd.slug))
  const relatedIds = (allDistricts.value ?? [])
    .filter(d => relatedSlugs.has(d.slug))
    .map(d => d.institutionId)
  if (!relatedIds.length) return []
  const all = await queryCollection('calendars').all()
  return (all ?? [])
    .filter(c => relatedIds.includes(c.institutionId) && c.schoolYear === year)
    .map(toComparisonCalendarSummary)
})

if (!district.value || !cal.value) {
  throw createError({ statusCode: 404, statusMessage: 'Calendar not found' })
}

const prevYearVal = (() => {
  const [y1, y2] = year.split('-').map(Number)
  return `${y1 - 1}-${y2 - 1}`
})()
const { data: prevCal } = await useAsyncData(`cal:${slug}:${prevYearVal}`, async () => {
  if (!district.value) return null
  return queryCollection('calendars')
    .where('institutionId', '=', district.value.institutionId)
    .where('schoolYear', '=', prevYearVal)
    .first()
})

const isCurrentYear = district.value.currentSchoolYear === year
const hubUrl = `https://myschooldates.com/${slug}`
const canonicalUrl = isCurrentYear ? hubUrl : `${hubUrl}/${year}`

const today = new Date(); today.setHours(0, 0, 0, 0)
const todayStr = (() => {
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})()

const isFutureYear = cal.value!.firstDay > todayStr

const formatWeekdayDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

const breaks = computed(() => getBreaks(cal.value!.events))
const secondSemStart = computed(() => getSecondSemesterStart(cal.value!.events))
const showSemesterCount = computed(() => (cal.value as any)?.hideSemesterCount !== true)
const springBreak = computed(() =>
  breaks.value.find(b => b.name.toLowerCase().includes('spring')) ?? null
)
const isEstimated = computed(() => !(cal.value as any)?.lastVerifiedAt)
const verifiedDate = computed(() => {
  if (!(cal.value as any)?.lastVerifiedAt) return null
  return new Date((cal.value as any).lastVerifiedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
})

const hiddenSections = computed(() => new Set<string>((district.value as any).hiddenSections ?? []))
const hasCalendarTrackCaution = computed(() => {
  const text = `${(cal.value as any)?.calendarNotes ?? ''} ${(district.value as any)?.districtFact ?? ''}`.toLowerCase()
  return text.includes('track') || text.includes('modified traditional') || text.includes('year-round')
})
const calendarTrackLabel = computed(() => {
  const type = String((cal.value as any)?.calendarType ?? '').replace(/[_-]+/g, ' ')
  return type ? type.replace(/\b\w/g, c => c.toUpperCase()) : 'Student'
})

const instructionalDaysLine = computed(() => {
  const days = cal.value?.totalSchoolDays ?? 180
  const description = String((cal.value as any)?.instructionalDaysDescription ?? '').toLowerCase()
  const label = String((cal.value as any)?.instructionalDaysLabel ?? '').toLowerCase()
  if (description.includes('calculated')) {
    const sourceName = district.value?.shortName || district.value?.name || 'district'
    if (label.includes('attendance')) {
      return `${days} calculated student attendance days, based on the published ${sourceName} calendar`
    }
    return `${days} currently scheduled instructional days, calculated from the published ${sourceName} calendar`
  }
  return `${days} instructional days`
})
const customSections = computed(() => ((district.value as any).customSections ?? []) as { id: string; label: string; content: string; position?: string }[])
const allDatesMode = computed(() => ((district.value as any)?.allDatesMode === 'keyDates' ? 'keyDates' : 'all') as 'all' | 'keyDates')
const allDatesTitle = computed(() =>
  allDatesMode.value === 'keyDates'
    ? `Major Student Calendar Dates — ${year}`
    : `All Important Dates — ${year}`
)

const faqs = computed(() => {
  if (!district.value || !cal.value) return []
  const specificFaqs: { q: string; a: string }[] = (district.value as any).districtFaqs ?? []
  const calendarFaqs: { q: string; a: string }[] = (cal.value as any).calendarFaqs ?? []
  return [...specificFaqs, ...calendarFaqs]
})

const _dn = district.value.name
const _sn = (district.value as any).shortName || _dn
const _titleSuffix = (cal.value as any).sourcePdfUrl ? ': PDF & Holidays' : ': Holidays & Key Dates'
const _fd = formatShortDate(cal.value.firstDay)
const _ld = formatShortDate(cal.value.lastDay)
const _hasSpring = breaks.value.some(b => b.name.toLowerCase().includes('spring'))
const _descTemplates = [
  // A — PDF + key dates (~130 chars)
  `${_sn} Calendar ${year} with holidays${_hasSpring ? ', spring break' : ''} and key dates. Download the official PDF or add to Google Calendar.`,
  // B — verified + download (~125 chars)
  `${_sn} Calendar ${year}: first day ${_fd}, last day ${_ld}${_hasSpring ? ', spring break' : ''}. Verified. Download the PDF or sync to Google Calendar.`,
  // C — user benefit (~135 chars)
  `${_sn} Calendar ${year} — verified holidays${_hasSpring ? ', spring break' : ''}, key dates, and official PDF download. Works with Google Calendar.`,
  // D — ICS/sync (~130 chars)
  `${_sn} ${year} calendar dates sourced from official district calendars, with holidays${_hasSpring ? ', spring break' : ''} and winter break. Download PDF or sync to Google Calendar.`,
  // E — verified dates (~130 chars)
  `${_sn} ${year}: first day ${_fd}, last day ${_ld}. Holidays${_hasSpring ? ', spring break' : ''} and official PDF. Syncs with Google Calendar.`,
]
const _autoDesc = _descTemplates[simpleHash(district.value.slug + year) % _descTemplates.length]
const _autoTitle = `${_dn} Calendar ${year}${_titleSuffix}`

const _replacePlaceholders = (s: string) =>
  s.replace(/\{year\}/g, year).replace(/\{shortName\}/g, _sn).replace(/\{name\}/g, _dn)
const _districtTitle = (district.value as any).seoTitle ? _replacePlaceholders((district.value as any).seoTitle) : undefined
const _districtDesc = (district.value as any).seoDescription ? _replacePlaceholders((district.value as any).seoDescription) : undefined
const _pageTitle = (cal.value as any).seoTitle ?? _districtTitle ?? _autoTitle
const _pageDesc = (cal.value as any).seoDescription ?? _districtDesc ?? _autoDesc

useSeoMeta({
  title: _pageTitle,
  description: _pageDesc,
  ogTitle: _pageTitle,
  ogDescription: _pageDesc,
  ogUrl: canonicalUrl,
  twitterTitle: _pageTitle,
  twitterDescription: _pageDesc,
})

const sitePublisher = {
  '@type': 'Organization',
  '@id': 'https://myschooldates.com/#organization',
  name: 'MySchoolDates',
  url: 'https://myschooldates.com',
}
const siteEntity = {
  '@type': 'WebSite',
  '@id': 'https://myschooldates.com/#website',
  name: 'MySchoolDates',
  url: 'https://myschooldates.com',
  publisher: { '@id': 'https://myschooldates.com/#organization' },
}
const districtAbout = {
  '@type': 'EducationalOrganization',
  '@id': `${hubUrl}#district`,
  name: district.value.name,
  url: district.value.officialWebsite,
}
const pageDateModified = (cal.value as any).dateModified ?? (cal.value as any).lastVerifiedAt
const pageDatePublished = (cal.value as any).datePublished ?? pageDateModified
const sourcePdfUrl = (cal.value as any).sourcePdfUrl
const sourceUrl = (cal.value as any).sourceUrl ?? district.value.calendarPage
const sourcePdfIsArchivedCopy = typeof sourcePdfUrl === 'string' && sourcePdfUrl.includes('assets.myschooldates.com')
const basedOnUrl = sourcePdfUrl && !sourcePdfIsArchivedCopy ? sourcePdfUrl : sourceUrl
const sourceCitation = [sourceUrl, sourcePdfUrl && !sourcePdfIsArchivedCopy ? sourcePdfUrl : null].filter(Boolean)
const calendarTypeName = String((cal.value as any)?.calendarType ?? '').replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
const schemaCalendarName = calendarTypeName
  ? `${district.value.name} ${calendarTypeName} Calendar ${year}`
  : `${district.value.name} Calendar ${year}`
const sourceCalendarEntity = basedOnUrl ? {
  '@type': 'CreativeWork',
  '@id': `${canonicalUrl}#source-calendar`,
  name: (cal.value as any).sourceVersion ?? `${district.value.name} ${year} Calendar PDF`,
  url: basedOnUrl,
  publisher: { '@id': districtAbout['@id'] },
} : null
const calendarIcsUrl = `https://myschooldates.com/calendars/${district.value.slug}-${cal.value.schoolYear}.ics`
const datasetEntity = {
  '@type': 'Dataset',
  '@id': `${canonicalUrl}#calendar-dataset`,
  name: schemaCalendarName,
  description: _pageDesc,
  url: canonicalUrl,
  inLanguage: 'en-US',
  ...(pageDateModified ? { dateModified: pageDateModified } : {}),
  temporalCoverage: `${cal.value.firstDay}/${cal.value.lastDay}`,
  creator: { '@id': 'https://myschooldates.com/#organization' },
  publisher: { '@id': 'https://myschooldates.com/#organization' },
  provider: { '@id': 'https://myschooldates.com/#organization' },
  isBasedOn: basedOnUrl ? { '@id': `${canonicalUrl}#source-calendar` } : undefined,
  distribution: [
    {
      '@type': 'DataDownload',
      name: `${schemaCalendarName} calendar file`,
      description: `Unofficial one-time calendar import generated from reviewed ${district.value.name} calendar dates.`,
      encodingFormat: 'text/calendar',
      contentUrl: calendarIcsUrl,
    },
    sourcePdfUrl ? {
      '@type': 'DataDownload',
      name: `Official ${schemaCalendarName} PDF`,
      encodingFormat: 'application/pdf',
      contentUrl: sourcePdfUrl,
    } : null,
  ].filter(Boolean),
}
const webPageEntity = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${canonicalUrl}#webpage`,
  name: _pageTitle,
  description: _pageDesc,
  url: canonicalUrl,
  inLanguage: 'en-US',
  ...(pageDateModified ? { dateModified: pageDateModified, datePublished: pageDatePublished } : {}),
  publisher: { '@id': 'https://myschooldates.com/#organization' },
  about: { '@id': districtAbout['@id'] },
  mainEntity: { '@id': `${canonicalUrl}#calendar-dataset` },
  ...(faqs.value.length ? { hasPart: { '@id': `${canonicalUrl}#faq` } } : {}),
  ...(basedOnUrl ? { isBasedOn: { '@id': `${canonicalUrl}#source-calendar` } } : {}),
  ...(sourcePdfIsArchivedCopy ? {
    associatedMedia: {
      '@type': 'MediaObject',
      '@id': `${canonicalUrl}#official-pdf`,
      name: `Archived official ${year} calendar PDF`,
      contentUrl: sourcePdfUrl,
      encodingFormat: 'application/pdf',
    },
  } : {}),
  ...(sourceCitation.length ? { citation: sourceCitation } : {}),
  isPartOf: {
    '@id': 'https://myschooldates.com/#website',
  },
}
const faqPageEntity = faqs.value.length ? {
  '@type': 'FAQPage',
  '@id': `${canonicalUrl}#faq`,
  mainEntity: faqs.value.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.a,
    },
  })),
} : null

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        sitePublisher,
        siteEntity,
        districtAbout,
        ...(sourceCalendarEntity ? [sourceCalendarEntity] : []),
        datasetEntity,
        webPageEntity,
        ...(faqPageEntity ? [faqPageEntity] : []),
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myschooldates.com' },
            { '@type': 'ListItem', position: 2, name: district.value.state, item: `https://myschooldates.com/${district.value.state.toLowerCase().replace(/\s+/g, '-')}` },
            { '@type': 'ListItem', position: 3, name: `${district.value.name} Calendar`, item: hubUrl },
            { '@type': 'ListItem', position: 4, name: year, item: canonicalUrl },
          ],
        },
      ],
    }),
  }],
})
</script>

<template>
  <div>
    <main class="max-w-4xl mx-auto px-4 py-8 space-y-8">

      <!-- Breadcrumb -->
      <Breadcrumb :items="[
        { label: 'Home', href: '/' },
        { label: district!.state, href: `/${district!.state.toLowerCase().replace(/\s+/g, '-')}` },
        { label: district!.name, href: `/${slug}` },
        { label: year },
      ]" />

      <!-- Notice for non-current year (past or future) -->
      <div v-if="!isCurrentYear" class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p class="text-sm text-blue-700">
          You're viewing the <strong>{{ isFutureYear ? 'upcoming' : 'archived' }} {{ year }}</strong> calendar.
          <NuxtLink :to="`/${slug}`" class="underline font-medium">View the current {{ district!.currentSchoolYear }} calendar →</NuxtLink>
        </p>
      </div>

      <!-- Title -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          {{ district!.name }} Calendar {{ year }}
        </h1>
        <div class="mt-3 text-gray-600 leading-relaxed space-y-2">
          <p>
            The first day of school for {{ district!.name }}<template v-if="district!.shortName && !district!.name.includes(district!.shortName)">, also known as {{ district!.shortName }},</template> {{ isFutureYear ? 'is' : 'was' }}
            <strong>{{ formatWeekdayDate(cal!.firstDay) }}</strong>.
            The last day {{ isFutureYear || isCurrentYear ? 'is' : 'was' }}
            <strong>{{ formatWeekdayDate(cal!.lastDay) }}</strong>.
            <span v-if="springBreak">
              Spring Break {{ isFutureYear || isCurrentYear ? 'runs' : 'ran' }}
              {{ formatShortDate(springBreak.start) }}–{{ formatShortDate(springBreak.end) }}.
            </span>
          </p>
          <p class="text-sm text-gray-500">
            {{ instructionalDaysLine }}
            <span v-if="showSemesterCount"> · {{ cal!.semesters ?? 2 }} semesters</span>
            <span v-if="secondSemStart"> · Students return after Winter Break on {{ formatShortDate(secondSemStart) }}</span>
          </p>
          <p class="text-xs text-gray-600">
            MySchoolDates is an independent calendar reference and is not affiliated with {{ district!.name }}.
          </p>
        </div>
      </div>

      <!-- Calendar track notice -->
      <div v-if="hasCalendarTrackCaution" class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <svg class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-blue-800">
          <strong>Calendar shown:</strong> {{ district!.shortName || district!.name }} {{ calendarTrackLabel }} Calendar.
          Other calendar tracks or specialized programs may use different dates. Check your school's assigned calendar before making plans.
          <a href="#identify-egusd-calendar-track" class="underline font-medium">How to confirm your calendar track</a>
        </p>
      </div>

      <!-- Key Date Cards -->
      <DistrictKeyDateCards :cal="cal!" />

      <!-- Alternate calendars notice -->
      <div v-if="(cal as any)?.alternateCalendars?.length" class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-amber-800">
          This page shows the <strong>Traditional Calendar</strong>, which applies to most {{ district!.name }} schools.
          If your child attends a year-round school or specialized program, see
          <a href="#other-calendars" class="underline font-medium">Other Official Calendars</a> below.
        </p>
      </div>

      <!-- Today / Year Status -->
      <DistrictTodayStatus :cal="cal!" />

      <!-- Quick Facts -->
      <DistrictQuickFacts
        v-if="!hiddenSections.has('quickFacts')"
        :cal="cal!"
        :district="district!"
        :related-cals="relatedCals ?? []"
        :all-districts="allDistricts ?? []"
        :prev-cal="prevCal ?? undefined"
      />

      <!-- All Dates -->
      <DistrictAllDates
        :events="cal!.events"
        :title="allDatesTitle"
        :source-url="cal!.sourceUrl ?? district!.officialWebsite"
        :district-name="district!.name"
        :verified-date="verifiedDate"
        :mode="allDatesMode"
      />

      <!-- Add to Calendar + Share -->
      <CalendarExportShare
        :district-name="district!.name"
        :year="year"
        :source-url="cal!.sourceUrl ?? district!.officialWebsite"
        :district="district!"
        :cal="cal!"
      />

      <!-- Other Official Calendars -->
      <DistrictOtherCalendars
        v-if="(cal as any)?.alternateCalendars?.length"
        :alternate-calendars="(cal as any).alternateCalendars"
        :district-name="district!.name"
      />

      <!-- Year by the Numbers -->
      <DistrictYearNumbers v-if="!hiddenSections.has('yearNumbers')" :cal="cal!" :school-year="year" />

      <!-- Grading Periods -->
      <DistrictGradingPeriods :periods="(cal as any).gradingPeriods" />

      <!-- What's Different This Year -->
      <DistrictYearDiff v-if="!hiddenSections.has('whatsDifferent')" :cal="cal!" :prev-cal="prevCal ?? undefined" />

      <!-- Calendar Context + About -->
      <DistrictCalendarAbout :cal="cal!" :district="district!" />

      <!-- Custom Sections: afterAbout (default position) -->
      <DistrictCustomSections :sections="customSections" position="afterAbout" />

      <!-- FAQ -->
      <DistrictFaq :cal="cal!" :district="district!" />

      <!-- Custom Sections: afterFaq -->
      <DistrictCustomSections :sections="customSections" position="afterFaq" />

      <!-- Compare with Nearby Districts -->
      <DistrictComparison :cal="cal!" :district="district!" :related-cals="relatedCals ?? []" :all-districts="allDistricts ?? []" :year="year" />

      <!-- Planning Tips -->
      <DistrictPlanningTips
        v-if="!hiddenSections.has('planningTips') && (district as any).planningTips?.content?.length"
        :name="district!.shortName || district!.name"
        :tips="(district as any).planningTips.content"
        :title="(district as any).planningTips.title"
      />

      <!-- Custom Sections: afterPlanningTips -->
      <DistrictCustomSections :sections="customSections" position="afterPlanningTips" />

      <!-- Living Here -->
      <DistrictLivingHere
        v-if="!hiddenSections.has('livingHere') && (district as any).livingHere?.highlights?.length"
        :city="district!.city || district!.name"
        :intro="(district as any).livingHere.intro"
        :highlights="(district as any).livingHere.highlights"
      />

      <!-- District Profile -->
      <DistrictProfile
        v-if="!hiddenSections.has('districtProfile') && ((district as any).studentCount || (district as any).schoolCount)"
        :student-count="(district as any).studentCount"
        :school-count="(district as any).schoolCount"
        :calendar-type="(district as any).calendarType"
        :grades="district!.grades"
        :founded="(district as any).founded"
        :county="(district as any).county"
        :metro="(district as any).metro"
        :district-fact="(district as any).districtFact"
      />

      <!-- Custom Sections: beforeSources -->
      <DistrictCustomSections :sections="customSections" position="beforeSources" />

      <!-- Sources -->
      <DistrictSources
        v-if="(district as any).sources?.length"
        :sources="(district as any).sources"
        :district-name="district!.name"
        :short-name="district!.shortName || district!.name"
        :year="year"
        :verified-date="verifiedDate"
        :source-version="(cal as any).sourceVersion"
        :source-pdf-url="(cal as any).sourcePdfUrl"
      />

      <!-- Data quality notice -->
      <DistrictDataQuality
        v-if="!(district as any).sources?.length"
        :cal="cal!"
        :district="district!"
        :year="year"
      />

      <!-- Back to current -->
      <div class="text-center">
        <NuxtLink :to="`/${slug}`" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
          ← Back to {{ district!.name }} current calendar ({{ district!.currentSchoolYear }})
        </NuxtLink>
      </div>

    </main>
  </div>
</template>
