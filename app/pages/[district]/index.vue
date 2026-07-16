<script setup lang="ts">
const route = useRoute()
const slug = route.params.district as string
const { formatDate, formatShortDate, daysUntil, getBreaks, getSecondSemesterStart, isCoveredByBreak, eventTypeLabel, eventTypeColor } = useDistrictPage()

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

// Load all data in parallel (allDistricts needed for state detection)
const [{ data: allDistricts }, { data: district }, { data: allCals }, { data: statePageData }] = await Promise.all([
  useAsyncData('districts-all', async () =>
    (await queryCollection('districts').order('name', 'ASC').all()).map(toDistrictSummary)
  ),
  useAsyncData(`district:${slug}`, () =>
    queryCollection('districts').where('slug', '=', slug).first()
  ),
  useAsyncData(`cals:${slug}`, async () => {
    const d = await queryCollection('districts').where('slug', '=', slug).first()
    if (!d) return []
    return queryCollection('calendars').where('institutionId', '=', d.institutionId).order('schoolYear', 'DESC').all()
  }),
  useAsyncData(`state:${slug}`, () => queryCollection('states').where('stateSlug', '=', slug).first()),
])

// State detection — derive state slug from state name (e.g. "New York" → "new-york")
const toStateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-')
const uniqueStates = [...new Set((allDistricts.value ?? []).map(d => d.state))]
const matchedStateName = uniqueStates.find(s => toStateSlug(s) === slug) ?? null
const isStatePage = !!matchedStateName
const stateDistricts = (allDistricts.value ?? [])
  .filter(d => d.state === matchedStateName)

if (!isStatePage && !district.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

// ── State page SEO ─────────────────────────────────────────────────────────
// Derive the most common school year from state districts to keep title current
const stateCurrentYear = (() => {
  if (!stateDistricts.length) return '2025-2026'
  const years = stateDistricts.map(d => d.currentSchoolYear).filter(Boolean)
  const freq: Record<string, number> = {}
  for (const y of years) freq[y] = (freq[y] ?? 0) + 1
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '2025-2026'
})()

if (isStatePage) {
  const stateTitle = `${matchedStateName} School Calendars ${stateCurrentYear} | MySchoolDates`
  const stateDesc = `${stateCurrentYear} school calendar dates sourced from official district websites for ${stateDistricts.length} public school district${stateDistricts.length !== 1 ? 's' : ''} in ${matchedStateName}. First day of school, spring break, winter break, and all important dates.`
  useSeoMeta({ title: stateTitle, description: stateDesc })
  useHead({
    link: [{ rel: 'canonical', href: `https://myschooldates.com/${slug}` }],
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myschooldates.com' },
            { '@type': 'ListItem', position: 2, name: `${matchedStateName} School Calendars`, item: `https://myschooldates.com/${slug}` },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `${matchedStateName} Public School Districts — ${stateCurrentYear} Calendars`,
          description: `${stateCurrentYear} school calendar dates sourced from official district websites for ${stateDistricts.length} public school districts in ${matchedStateName}.`,
          numberOfItems: stateDistricts.length,
          itemListElement: stateDistricts.map((d, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: d.name,
            url: `https://myschooldates.com/${d.slug}`,
            item: {
              '@type': 'EducationalOrganization',
              name: d.name,
              url: `https://myschooldates.com/${d.slug}`,
              address: {
                '@type': 'PostalAddress',
                addressLocality: d.city ?? '',
                addressRegion: (d as any).stateCode ?? d.state,
                addressCountry: 'US',
              },
            },
          })),
        },
      ]),
    }],
  })
}

// ── State page: load first days for district cards ─────────────────────────
const { data: stateCals } = await useAsyncData(`state-cals:${slug}`, async () => {
  if (!isStatePage || !stateDistricts.length) return []
  const all = await queryCollection('calendars').all()
  const ids = new Set(stateDistricts.map(d => d.institutionId))
  return (all ?? []).filter(c => ids.has(c.institutionId) && c.schoolYear === stateCurrentYear)
})

// Format "2026-08-10" → "Aug 10" (compact, no year)
const formatMonthDay = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleString('en-US', { month: 'short', day: 'numeric' })

// Per-district stats for the state comparison table
const stateDistrictStats = computed(() => {
  type DistrictStat = {
    firstDay: string; lastDay: string
    winterBreak: { start: string; end: string } | null
    springBreak: { start: string; end: string } | null
    daysOff: number; eventCount: number
  }
  const result: Record<string, DistrictStat> = {}
  for (const c of stateCals.value ?? []) {
    const calBreaks = getBreaks(c.events ?? [])
    const winterBreak = calBreaks.find(b =>
      b.name.toLowerCase().includes('winter') ||
      b.name.toLowerCase().includes('christmas') ||
      b.name.toLowerCase().includes('december')
    ) ?? null
    const springBreak = calBreaks.find(b => b.name.toLowerCase().includes('spring')) ?? null
    let daysOff = 0
    const breakRanges: { start: string; end: string }[] = []
    for (const e of (c.events ?? [])) {
      if (e.type === 'break_start') {
        const endEvt = (c.events ?? []).find((x: any) => x.type === 'break_end' && x.date > e.date)
        if (endEvt) breakRanges.push({ start: e.date, end: endEvt.date })
      }
      if (e.type === 'holiday' || e.type === 'no_school') daysOff++
    }
    for (const { start, end } of breakRanges) {
      let d = new Date(start + 'T00:00:00')
      const endD = new Date(end + 'T00:00:00')
      while (d <= endD) {
        if (d.getDay() !== 0 && d.getDay() !== 6) daysOff++
        d.setDate(d.getDate() + 1)
      }
    }
    result[c.institutionId] = {
      firstDay: c.firstDay, lastDay: c.lastDay,
      winterBreak: winterBreak ? { start: winterBreak.start, end: winterBreak.end } : null,
      springBreak: springBreak ? { start: springBreak.start, end: springBreak.end } : null,
      daysOff, eventCount: (c.events ?? []).length,
    }
  }
  return result
})

// ── Related district calendars (for comparison table) ──────────────────────
const { data: relatedCals } = await useAsyncData(`related-cals:${slug}`, async () => {
  if (isStatePage || !district.value?.relatedDistricts?.length) return []
  const relatedSlugs = new Set((district.value.relatedDistricts as { slug: string }[]).map(rd => rd.slug))
  const relatedIds = (allDistricts.value ?? [])
    .filter(d => relatedSlugs.has(d.slug))
    .map(d => d.institutionId)
  if (!relatedIds.length) return []
  const all = await queryCollection('calendars').all()
  const year = district.value.currentSchoolYear
  return (all ?? [])
    .filter(c => relatedIds.includes(c.institutionId) && c.schoolYear === year)
    .map(toComparisonCalendarSummary)
})

// ── District page logic ────────────────────────────────────────────────────
const currentYear = district.value?.currentSchoolYear ?? ''
const cal = allCals.value?.find(y => y.schoolYear === currentYear) ?? null
const meta = district
const calendarIcsHref = computed(() =>
  district.value && cal
    ? `/calendars/${district.value.slug}-${cal.schoolYear}.ics`
    : ''
)

const archivedYears = computed(() =>
  (allCals.value ?? []).filter(y => y.schoolYear !== currentYear).map(y => y.schoolYear)
)
const today = new Date(); today.setHours(0, 0, 0, 0)
const breaks = computed(() => getBreaks(cal?.events ?? []))

const keyDateHighlights = computed(() => {
  if (!cal?.events) return []
  const HIGHLIGHT_TYPES = new Set(['school_start', 'school_end', 'break_start'])
  const CORE_HOLIDAYS = ['labor day', 'martin luther king', 'good friday']
  return cal.events.filter(e =>
    HIGHLIGHT_TYPES.has(e.type) ||
    (e.type === 'holiday' && CORE_HOLIDAYS.some(name => e.name.toLowerCase().includes(name)) && !isCoveredByBreak(e, cal.events))
  )
})

function keyDateLabel(event: { type: string }) {
  if (event.type === 'break_start') return 'Break'
  return eventTypeLabel[event.type]
}

function keyDateDisplayDate(event: { date: string; name: string; type: string }) {
  if (event.type !== 'break_start') return formatShortDate(event.date)
  const match = breaks.value.find(b => b.name === event.name && b.start === event.date)
  if (!match) return formatShortDate(event.date)
  return `${formatShortDate(match.start)} – ${formatShortDate(match.end)}`
}

function keyDateRange(event: { date: string; name: string; type: string }) {
  if (event.type !== 'break_start') return { start: event.date, end: event.date }
  const match = breaks.value.find(b => b.name === event.name && b.start === event.date)
  return { start: event.date, end: match?.end ?? event.date }
}

const calendarSummary = computed(() => {
  if (!cal || !district.value) return ''
  const springBreak = breaks.value.find(b => b.name.toLowerCase().includes('spring'))
  const schoolEndEvent = cal.events?.find((e: any) => e.type === 'school_end')
  const lastDayNote = schoolEndEvent?.name?.toLowerCase().includes('early')
    ? ', with early release'
    : ''
  const springPart = springBreak
    ? ` Spring Break runs ${formatShortDate(springBreak.start)}–${formatShortDate(springBreak.end)}.`
    : ''
  const shortName = district.value.shortName && !district.value.name.includes(district.value.shortName)
    ? `, also known as ${district.value.shortName},`
    : ''
  return `${district.value.name}${shortName} begins the ${currentYear} school year on ${formatDate(cal.firstDay)}. The final day is ${formatDate(cal.lastDay)}${lastDayNote}.${springPart}`
})

const faqs = computed(() => {
  if (!cal || !district.value) return []
  const specificFaqs: { q: string; a: string }[] = (district.value as any).districtFaqs ?? []
  const calendarFaqs: { q: string; a: string }[] = (cal as any).calendarFaqs ?? []
  return [...specificFaqs, ...calendarFaqs]
})

const hiddenSections = computed(() => new Set<string>((district.value as any).hiddenSections ?? []))
const customSections = computed(() => ((district.value as any).customSections ?? []) as { id: string; label: string; content: string; position?: string }[])
const hasCalendarTrackCaution = computed(() => {
  const text = `${(cal as any)?.calendarNotes ?? ''} ${(district.value as any)?.districtFact ?? ''}`.toLowerCase()
  return text.includes('track') || text.includes('modified traditional') || text.includes('year-round')
})
const calendarTrackLabel = computed(() => {
  const type = String((cal as any)?.calendarType ?? '').replace(/[_-]+/g, ' ')
  return type ? type.replace(/\b\w/g, c => c.toUpperCase()) : 'Student'
})

const secondSemStart = computed(() => cal ? getSecondSemesterStart(cal.events) : '')
const showSemesterCount = computed(() => (cal as any)?.hideSemesterCount !== true)

function countWeekdays(start: string, end: string) {
  const cursor = new Date(start + 'T00:00:00')
  const stop = new Date(end + 'T00:00:00')
  let count = 0
  while (cursor <= stop) {
    const day = cursor.getDay()
    if (day !== 0 && day !== 6) count++
    cursor.setDate(cursor.getDate() + 1)
  }
  return count
}

function breakDurationLabel(b: { name: string; start: string; end: string; days: number }) {
  const weekdays = countWeekdays(b.start, b.end)
  if (weekdays === b.days) {
    return `${weekdays} weekday${weekdays !== 1 ? 's' : ''} without school`
  }
  return `${weekdays} weekday${weekdays !== 1 ? 's' : ''} without school · ${b.days} calendar day${b.days !== 1 ? 's' : ''} total`
}

const todayStr = (() => {
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})()

// Next upcoming events (excludes break_end since break_start already shows the range)
const upcomingEvents = computed(() => {
  if (!cal) return []
  return cal.events
    .filter(e => e.date >= todayStr && e.type !== 'break_end')
    .slice(0, 6)
})

// B4: Dynamic mid-section order — varies by time context
type MidSection = 'about' | 'upcoming' | 'breaks'
const midSectionOrder = computed((): MidSection[] => {
  // Upcoming Dates removed — covered by AllDates table below, reduces date repetition
  // Break starting within 14 days: surface breaks first so families can plan
  const breakSoon = breaks.value.some(b => { const d = daysUntil(b.start); return d >= 0 && d <= 14 })
  if (breakSoon) return ['breaks', 'about']
  return ['breaks', 'about']
})

// Data quality: estimated when no lastVerifiedAt is set
const isEstimated = computed(() => !cal?.lastVerifiedAt)
const verifiedDate = computed(() => {
  if (!cal?.lastVerifiedAt) return null
  return new Date(cal.lastVerifiedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
})

const prevYear = computed(() => {
  const [y1, y2] = currentYear.split('-').map(Number)
  return `${y1 - 1}-${y2 - 1}`
})
const prevCal = computed(() => allCals.value?.find(c => c.schoolYear === prevYear.value) ?? null)

const allDatesMode = computed(() => ((district.value as any)?.allDatesMode === 'keyDates' ? 'keyDates' : 'all') as 'all' | 'keyDates')
const allDatesTitle = computed(() =>
  allDatesMode.value === 'keyDates'
    ? `Major Student Calendar Dates — ${currentYear}`
    : `All Important Dates — ${currentYear}`
)

const dateLegend = computed(() => {
  const hasEventType = (types: string[]) =>
    (cal?.events ?? []).some((event: any) => types.includes(event.type))
  const hasPossibleMakeupDay = (cal?.events ?? []).some((event: any) => {
    const name = String(event.name ?? '').toLowerCase()
    return name.includes('possible') && (name.includes('make-up') || name.includes('makeup'))
  })
  const items = [
    ...(hasEventType(['break_start']) ? [{ label: 'Breaks', dot: 'bg-purple-400' }] : []),
    ...(hasEventType(['holiday']) ? [{ label: 'Holidays', dot: 'bg-blue-400' }] : []),
    ...(hasEventType(['no_school', 'student_holiday', 'teacher_workday']) ? [{ label: 'No school', dot: 'bg-amber-400' }] : []),
    ...(hasPossibleMakeupDay ? [{ label: 'Possible make-up day', dot: 'bg-orange-400' }] : []),
    ...(hasEventType(['early_dismissal', 'early_release']) ? [{ label: 'Early dismissal', dot: 'bg-orange-400' }] : []),
    ...(hasEventType(['school_resume', 'school_reopen']) ? [{ label: 'School resumes', dot: 'bg-green-400' }] : []),
    ...(hasEventType(['academic', 'quarter_end', 'semester_end']) ? [{ label: 'Academic', dot: 'bg-gray-400' }] : []),
  ]
  return items
})

const instructionalDaysLine = computed(() => {
  const days = cal?.totalSchoolDays ?? 180
  const description = String((cal as any)?.instructionalDaysDescription ?? '').toLowerCase()
  const label = String((cal as any)?.instructionalDaysLabel ?? '').toLowerCase()
  if (description.includes('calculated')) {
    const sourceName = district.value?.shortName || district.value?.name || 'district'
    if (label.includes('attendance')) {
      return `${days} calculated student attendance days, based on the published ${sourceName} calendar`
    }
    return `${days} currently scheduled instructional days, calculated from the published ${sourceName} calendar`
  }
  return `${days} instructional days`
})

if (!isStatePage && district.value) {
  const canonicalUrl = `https://myschooldates.com/${slug}`
  const _dn = meta.value!.name
  const _sn = (meta.value as any).shortName || _dn
  const _titleSuffix = cal?.sourcePdfUrl ? ': PDF & Holidays' : ': Holidays & Key Dates'
  const _slug = meta.value!.slug
  const _fd = cal ? formatShortDate(cal.firstDay) : ''
  const _ld = cal ? formatShortDate(cal.lastDay) : ''
  const _hasSpring = breaks.value.some((b: any) => b.name.toLowerCase().includes('spring'))
  const _descTemplates = [
    // A — PDF + key dates (~130 chars)
    `${_sn} Calendar ${currentYear} with holidays${_hasSpring ? ', spring break' : ''} and key dates. Download the official PDF or add to Google Calendar.`,
    // B — verified + download (~125 chars)
    `${_sn} Calendar ${currentYear}: first day ${_fd}, last day ${_ld}${_hasSpring ? ', spring break' : ''}. Verified. Download the PDF or sync to Google Calendar.`,
    // C — user benefit (~135 chars)
    `${_sn} Calendar ${currentYear} — verified holidays${_hasSpring ? ', spring break' : ''}, key dates, and official PDF download. Works with Google Calendar.`,
    // D — ICS/sync (~130 chars)
    `${_sn} ${currentYear} calendar dates sourced from official district calendars, with holidays${_hasSpring ? ', spring break' : ''} and winter break. Download PDF or sync to Google Calendar.`,
    // E — verified dates (~130 chars)
    `${_sn} ${currentYear}: first day ${_fd}, last day ${_ld}. Holidays${_hasSpring ? ', spring break' : ''} and official PDF. Syncs with Google Calendar.`,
  ]
  const _idxDesc = cal
    ? _descTemplates[simpleHash(_slug + currentYear) % _descTemplates.length]
    : `${_dn} ${currentYear} school calendar with all holidays, breaks, and key dates.`
  const _replacePlaceholders = (s: string) =>
    s.replace(/\{year\}/g, currentYear).replace(/\{shortName\}/g, _sn).replace(/\{name\}/g, _dn)
  const _calTitle = cal ? (cal as any).seoTitle : undefined
  const _calDesc = cal ? (cal as any).seoDescription : undefined
  const _districtTitle = (meta.value as any).seoTitle ? _replacePlaceholders((meta.value as any).seoTitle) : undefined
  const _districtDesc = (meta.value as any).seoDescription ? _replacePlaceholders((meta.value as any).seoDescription) : undefined
  const _pageTitle = _calTitle ?? _districtTitle ?? `${_dn} Calendar ${currentYear}${_titleSuffix}`
  const _pageDesc = _calDesc ?? _districtDesc ?? _idxDesc
  useSeoMeta({
    title: _pageTitle,
    description: _pageDesc,
    ogTitle: _pageTitle,
    ogDescription: _pageDesc,
    ogUrl: canonicalUrl,
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
    '@id': `${canonicalUrl}#district`,
    name: meta.value!.name,
    url: meta.value!.officialWebsite || canonicalUrl,
  }
  const pageDateModified = (cal as any)?.dateModified ?? cal?.lastVerifiedAt
  const pageDatePublished = (cal as any)?.datePublished ?? pageDateModified
  const sourcePdfUrl = (cal as any)?.sourcePdfUrl
  const sourceUrl = (cal as any)?.sourceUrl ?? meta.value!.calendarPage
  const sourcePdfIsArchivedCopy = typeof sourcePdfUrl === 'string' && sourcePdfUrl.includes('assets.myschooldates.com')
  const basedOnUrl = sourcePdfUrl && !sourcePdfIsArchivedCopy ? sourcePdfUrl : sourceUrl
  const sourceCitation = [sourceUrl, sourcePdfUrl && !sourcePdfIsArchivedCopy ? sourcePdfUrl : null].filter(Boolean)
  const calendarTypeName = cal
    ? String((cal as any)?.calendarType ?? '').replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : ''
  const schemaCalendarName = calendarTypeName
    ? `${meta.value!.name} ${calendarTypeName} Calendar ${currentYear}`
    : `${meta.value!.name} Calendar ${currentYear}`
  const sourceCalendarEntity = basedOnUrl ? {
    '@type': 'CreativeWork',
    '@id': `${canonicalUrl}#source-calendar`,
    name: (cal as any)?.sourceVersion ?? `${meta.value!.name} ${currentYear} Calendar PDF`,
    url: basedOnUrl,
    publisher: { '@id': districtAbout['@id'] },
  } : null
  const calendarIcsUrl = district.value && cal
    ? `https://myschooldates.com/calendars/${district.value.slug}-${cal.schoolYear}.ics`
    : ''
  const datasetEntity = {
    '@type': 'Dataset',
    '@id': `${canonicalUrl}#calendar-dataset`,
    name: schemaCalendarName,
    description: _pageDesc,
    url: canonicalUrl,
    inLanguage: 'en-US',
    ...(pageDateModified ? { dateModified: pageDateModified } : {}),
    temporalCoverage: cal ? `${cal.firstDay}/${cal.lastDay}` : undefined,
    creator: { '@id': 'https://myschooldates.com/#organization' },
    publisher: { '@id': 'https://myschooldates.com/#organization' },
    isBasedOn: basedOnUrl ? { '@id': `${canonicalUrl}#source-calendar` } : undefined,
    distribution: [
      calendarIcsUrl ? {
        '@type': 'DataDownload',
        name: `${schemaCalendarName} calendar file`,
        description: `Unofficial one-time calendar import generated from reviewed ${meta.value!.name} calendar dates.`,
        encodingFormat: 'text/calendar',
        contentUrl: calendarIcsUrl,
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
        name: `Archived official ${currentYear} calendar PDF`,
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
    isPartOf: { '@id': `${canonicalUrl}#webpage` },
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
              { '@type': 'ListItem', position: 2, name: meta.value!.state, item: `https://myschooldates.com/${toStateSlug(meta.value!.state)}` },
              { '@type': 'ListItem', position: 3, name: `${meta.value!.name} Calendar`, item: canonicalUrl },
            ],
          },
        ],
      }),
    }],
  })
}
</script>

<template>
  <div>
    <!-- ── State Page ─────────────────────────────────────────────────────── -->
    <template v-if="isStatePage">
      <main class="max-w-4xl mx-auto px-4 py-8 space-y-8">

        <!-- Breadcrumb -->
        <Breadcrumb :items="[{ label: 'Home', href: '/' }, { label: matchedStateName! }]" />

        <!-- Hero -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ matchedStateName }} School Calendars {{ stateCurrentYear }}
          </h1>
          <p class="mt-2 text-sm text-gray-500">
            {{ stateCurrentYear }} school calendar dates · {{ stateDistricts.length }} public school district{{ stateDistricts.length !== 1 ? 's' : '' }} · Sourced from official district websites
          </p>
          <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            <span class="flex items-center gap-1.5 text-sm text-gray-700">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
              {{ stateDistricts.length }} districts covered
            </span>
            <span class="flex items-center gap-1.5 text-sm text-gray-700">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
              Updated for {{ stateCurrentYear }}
            </span>
            <span class="flex items-center gap-1.5 text-sm text-gray-700">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
              Google Calendar support
            </span>
            <span class="flex items-center gap-1.5 text-sm text-gray-700">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
              Official district sources
            </span>
          </div>
        </div>

        <!-- Quick Facts from state data -->
        <div v-if="statePageData?.quickFacts?.length" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div v-for="fact in statePageData.quickFacts" :key="fact.label" class="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div class="text-lg font-bold text-gray-900">{{ fact.value }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ fact.label }}</div>
          </div>
        </div>

        <!-- About section -->
        <div v-if="statePageData?.about" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">About {{ matchedStateName }} School Calendars</h2>
          <div class="text-gray-600 leading-relaxed space-y-3">
            <p v-for="(para, i) in statePageData.about.split('\n\n')" :key="i">{{ para }}</p>
          </div>
        </div>

        <!-- District Comparison Table -->
        <div v-if="Object.keys(stateDistrictStats).length" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">Compare {{ matchedStateName }} Districts at a Glance</h2>
            <p class="text-sm text-gray-500 mt-1">First and last days, major breaks, and days off — side by side.</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <th class="text-left px-6 py-3 whitespace-nowrap">District</th>
                  <th class="text-left px-4 py-3 whitespace-nowrap">First Day</th>
                  <th class="text-left px-4 py-3 whitespace-nowrap">Winter Break</th>
                  <th class="text-left px-4 py-3 whitespace-nowrap">Spring Break</th>
                  <th class="text-left px-4 py-3 whitespace-nowrap">Last Day</th>
                  <th class="text-right px-6 py-3 whitespace-nowrap">Days Off</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="d in stateDistricts" :key="d.slug" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-3">
                    <NuxtLink :to="`/${d.slug}`" class="font-medium text-gray-900 hover:text-blue-600 transition-colors whitespace-nowrap">
                      {{ d.shortName || d.name }}
                    </NuxtLink>
                  </td>
                  <template v-if="stateDistrictStats[d.institutionId]">
                    <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ formatMonthDay(stateDistrictStats[d.institutionId].firstDay) }}</td>
                    <td class="px-4 py-3 text-gray-600 whitespace-nowrap">
                      <span v-if="stateDistrictStats[d.institutionId].winterBreak">
                        {{ formatMonthDay(stateDistrictStats[d.institutionId].winterBreak!.start) }} – {{ formatMonthDay(stateDistrictStats[d.institutionId].winterBreak!.end) }}
                      </span>
                      <span v-else class="text-gray-300">—</span>
                    </td>
                    <td class="px-4 py-3 text-gray-600 whitespace-nowrap">
                      <span v-if="stateDistrictStats[d.institutionId].springBreak">
                        {{ formatMonthDay(stateDistrictStats[d.institutionId].springBreak!.start) }} – {{ formatMonthDay(stateDistrictStats[d.institutionId].springBreak!.end) }}
                      </span>
                      <span v-else class="text-gray-300">—</span>
                    </td>
                    <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ formatMonthDay(stateDistrictStats[d.institutionId].lastDay) }}</td>
                    <td class="px-6 py-3 text-right font-semibold text-gray-900">{{ stateDistrictStats[d.institutionId].daysOff }}</td>
                  </template>
                  <template v-else>
                    <td colspan="5" class="px-4 py-3 text-xs text-gray-300">Calendar not yet available</td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="px-6 py-3 border-t border-gray-50 text-xs text-gray-400">
            Days off = full student weekdays off (breaks, holidays, no-school days). Click any district for the full calendar.
          </div>
        </div>

        <!-- District Cards -->
        <div>
          <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ matchedStateName }} School Districts — {{ stateCurrentYear }}</h2>
          <p class="text-sm text-gray-500 mb-4">Click any district to view the full calendar, add dates to Google Calendar, or download an ICS file.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NuxtLink
              v-for="d in stateDistricts"
              :key="d.slug"
              :to="`/${d.slug}`"
              class="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div class="font-semibold text-gray-900 leading-snug">{{ d.name }}</div>
              <div class="text-xs text-gray-400 mt-0.5">{{ d.city ? `${d.city}, ` : '' }}{{ (d as any).stateCode ?? d.state }}</div>
              <template v-if="stateDistrictStats[d.institutionId]">
                <div class="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div>
                    <div class="text-xs text-gray-400">First day</div>
                    <div class="text-sm font-medium text-gray-800">{{ formatMonthDay(stateDistrictStats[d.institutionId].firstDay) }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-400">Last day</div>
                    <div class="text-sm font-medium text-gray-800">{{ formatMonthDay(stateDistrictStats[d.institutionId].lastDay) }}</div>
                  </div>
                  <div v-if="stateDistrictStats[d.institutionId].winterBreak">
                    <div class="text-xs text-gray-400">Winter break</div>
                    <div class="text-sm font-medium text-gray-800">
                      {{ formatMonthDay(stateDistrictStats[d.institutionId].winterBreak!.start) }} – {{ formatMonthDay(stateDistrictStats[d.institutionId].winterBreak!.end) }}
                    </div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-400">Days off</div>
                    <div class="text-sm font-medium text-gray-800">{{ stateDistrictStats[d.institutionId].daysOff }} days</div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="mt-3 text-xs text-gray-400">{{ d.currentSchoolYear }}</div>
              </template>
              <div class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span class="text-xs text-gray-400">{{ d.currentSchoolYear }}</span>
                <span class="text-xs font-medium text-blue-600">View calendar →</span>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Common Holidays -->
        <div v-if="statePageData?.commonHolidays?.length" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">Common {{ matchedStateName }} School Holidays</h2>
          <p class="text-sm text-gray-500 mb-4">Exact dates vary by district. Always verify with your district's official calendar before making plans.</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="holiday in statePageData.commonHolidays"
              :key="holiday"
              class="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700"
            >{{ holiday }}</span>
          </div>
        </div>

        <!-- Planning Tips -->
        <div v-if="statePageData?.planningTips?.length" class="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Planning Tips for {{ matchedStateName }} Families</h2>
          <ul class="space-y-3">
            <li v-for="tip in statePageData.planningTips" :key="tip" class="flex items-start gap-2 text-sm text-gray-700">
              <svg class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ tip }}
            </li>
          </ul>
        </div>

        <!-- FAQ -->
        <div v-if="statePageData?.faqs?.length" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-5">Frequently Asked Questions</h2>
          <div class="space-y-5 divide-y divide-gray-100">
            <div v-for="faq in statePageData.faqs" :key="faq.q" class="pt-5 first:pt-0">
              <h3 class="font-medium text-gray-900">{{ faq.q }}</h3>
              <p class="text-gray-600 mt-1.5">{{ faq.a }}</p>
            </div>
          </div>
        </div>

        <!-- Related States -->
        <div v-if="statePageData?.relatedStates?.length" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">Compare Nearby States</h2>
            <p class="text-sm text-gray-500 mt-1">School start dates, spring break, and holiday schedules vary significantly between states — even for neighboring districts across state lines.</p>
          </div>
          <div class="divide-y divide-gray-50">
            <NuxtLink
              v-for="rs in statePageData.relatedStates"
              :key="rs.slug"
              :to="`/${rs.slug}`"
              class="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div class="font-medium text-gray-900">{{ rs.name }} School Calendars</div>
              <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </div>

        <!-- SEO footer note -->
        <p class="text-xs text-gray-400 text-center">
          All calendar data is sourced from official {{ matchedStateName }} school district websites.
          Dates are subject to board approval — always verify with your district before making plans.
        </p>

      </main>
    </template>

    <!-- ── District Page ──────────────────────────────────────────────────── -->
    <template v-else-if="district && cal">
      <main class="max-w-4xl mx-auto px-4 py-8 space-y-8">

        <!-- Breadcrumb -->
        <Breadcrumb :items="[
          { label: 'Home', href: '/' },
          { label: district.state, href: `/${toStateSlug(district.state)}` },
          { label: district.name },
        ]" />

        <!-- Title -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ district.name }} Calendar {{ currentYear }}
          </h1>
          <p class="mt-2 text-sm text-gray-500">
            {{ currentYear }} calendar dates · Sourced from the official {{ district.shortName || district.name }} calendar ·
            <a href="#add-to-calendar" class="underline hover:text-blue-600 transition-colors">Add school dates to calendar</a>
          </p>
          <p class="mt-1 text-xs text-gray-600">
            MySchoolDates is an independent calendar reference and is not affiliated with {{ district.name }}.
          </p>
          <!-- Featured snippet: direct answer for search intent -->
          <p v-if="calendarSummary" class="mt-3 text-sm text-gray-700 leading-relaxed">{{ calendarSummary }}</p>
          <p class="mt-1 text-sm text-gray-500">
            {{ instructionalDaysLine }}
            <span v-if="showSemesterCount"> · {{ cal.semesters ?? 2 }} semesters</span>
            <span v-if="secondSemStart"> · Students return after Winter Break on {{ formatShortDate(secondSemStart) }}</span>
          </p>
          <!-- Verification badge -->
          <div class="mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
            :class="isEstimated
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-green-50 text-green-700 border border-green-200'"
          >
            <svg v-if="!isEstimated" class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span v-if="!isEstimated">Reviewed by MySchoolDates calendar editors · Last reviewed {{ verifiedDate }}</span>
            <span v-else>Based on official district website · Not yet human-verified</span>
          </div>
        </div>

        <!-- Today Status — HERO: first thing users see after the title -->
        <DistrictTodayStatus :cal="cal">
          <template #cta>
            <a
              :href="calendarIcsHref"
              :download="district && cal ? `${district.slug}-${cal.schoolYear}.ics` : undefined"
              :aria-label="district && cal ? `Download ${district.name} ${cal.schoolYear} calendar file` : 'Download calendar file'"
              class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Add school dates to calendar
            </a>
          </template>
        </DistrictTodayStatus>

        <!-- Calendar track notice -->
        <div v-if="hasCalendarTrackCaution" class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <svg class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-blue-800">
            <strong>Calendar shown:</strong> {{ district.shortName || district.name }} {{ calendarTrackLabel }} Calendar.
            Other calendar tracks or specialized programs may use different dates. Check your school's assigned calendar before making plans.
            <a href="#identify-egusd-calendar-track" class="underline font-medium">How to confirm your calendar track</a>
          </p>
        </div>

        <!-- Key Date Cards -->
        <DistrictKeyDateCards :cal="cal" />

        <!-- Alternate calendars notice -->
        <div v-if="(cal as any)?.alternateCalendars?.length" class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-amber-800">
            This page shows the <strong>Traditional Calendar</strong>, which applies to most {{ district.name }} schools.
            If your child attends a year-round school or specialized program, see
            <a href="#other-calendars" class="underline font-medium">Other Official Calendars</a> below.
          </p>
        </div>

        <!-- Key Dates & Holidays Summary -->
        <div v-if="!hiddenSections.has('keyDates') && keyDateHighlights.length" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ currentYear }} Key Dates &amp; Holidays</h2>
          <p class="text-xs text-gray-600 mb-4">First day, last day, school holidays, and major break ranges</p>
          <div class="divide-y divide-gray-100">
            <div
              v-for="event in keyDateHighlights"
              :key="event.date + event.name"
              class="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <span
                  class="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                  :class="eventTypeColor[event.type]"
                >{{ keyDateLabel(event) }}</span>
                <span class="text-sm text-gray-900 truncate">{{ event.name }}</span>
              </div>
              <span class="text-sm text-gray-500 tabular-nums ml-4 flex-shrink-0">
                <time :datetime="keyDateRange(event).start">{{ event.type === 'break_start' ? formatShortDate(keyDateRange(event).start) : keyDateDisplayDate(event) }}</time>
                <template v-if="keyDateRange(event).end !== keyDateRange(event).start">
                  <span> – </span>
                  <time :datetime="keyDateRange(event).end">{{ formatShortDate(keyDateRange(event).end) }}</time>
                </template>
              </span>
            </div>
          </div>
        </div>

        <!-- All Dates -->
        <DistrictAllDates
          :events="cal.events"
          :title="allDatesTitle"
          :source-url="(cal?.sourceUrl ?? district.calendarPage) ?? district.officialWebsite"
          :district-name="district.name"
          :verified-date="verifiedDate"
          :legend="dateLegend"
          :mode="allDatesMode"
        />

        <!-- Add to Calendar + Share -->
        <CalendarExportShare
          :district-name="district.name"
          :year="currentYear"
          :source-url="(cal.sourceUrl ?? district.calendarPage) ?? district.officialWebsite"
          :district="district"
          :cal="cal"
        />

        <!-- Other Official Calendars -->
        <DistrictOtherCalendars
          v-if="(cal as any)?.alternateCalendars?.length"
          :alternate-calendars="(cal as any).alternateCalendars"
          :district-name="district.name"
        />

        <!-- Quick Facts (fixed position — moved above Year by Numbers) -->
        <DistrictQuickFacts
          v-if="!hiddenSections.has('quickFacts')"
          :cal="cal"
          :district="district"
          :related-cals="relatedCals ?? []"
          :all-districts="allDistricts ?? []"
          :prev-cal="prevCal ?? undefined"
        />

        <!-- Dynamic mid sections: order varies by time context -->
        <template v-for="section in midSectionOrder" :key="section">

          <!-- About / Calendar Context -->
          <div v-if="section === 'about' && !hiddenSections.has('about')" class="text-gray-600 leading-relaxed space-y-3 text-sm">
            <template v-if="cal.calendarNotes">
              <p v-for="(para, i) in cal.calendarNotes.split('\n\n')" :key="i">{{ para }}</p>
            </template>
            <template v-else>
              <p>
                The {{ currentYear }} academic year for {{ district.name }} runs from
                <strong>{{ formatDate(cal.firstDay) }}</strong> to
                <strong>{{ formatDate(cal.lastDay) }}</strong>,
                with {{ instructionalDaysLine }}.
                <span v-if="secondSemStart">
                  Students return after Winter Break on {{ formatShortDate(secondSemStart) }}.
                </span>
              </p>
              <p v-if="breaks.length">
                Students have {{ breaks.length }} major school break{{ breaks.length !== 1 ? 's' : '' }} throughout the year —
                {{ breaks.map(b => b.name).join(', ') }} — plus district-observed holidays and additional no-school days.
              </p>
            </template>
            <template v-if="(district as any).about?.length">
              <div v-for="card in (district as any).about" :key="card.title" class="bg-white rounded-xl border border-gray-200 p-5">
                <h3 class="text-sm font-semibold text-gray-900 mb-2">{{ card.title }}</h3>
                <p class="text-sm text-gray-600 leading-relaxed">{{ card.content }}</p>
              </div>
            </template>
          </div>

          <!-- Upcoming Events — timeline of next 6 events -->
          <div v-else-if="section === 'upcoming' && upcomingEvents.length" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900">Upcoming Dates</h2>
            </div>
            <div class="divide-y divide-gray-50">
              <div
                v-for="event in upcomingEvents"
                :key="event.date + event.type"
                class="flex items-center gap-4 px-6 py-3.5"
              >
                <!-- Date column -->
                <div class="w-16 flex-shrink-0 text-center">
                  <div class="text-xs font-semibold text-gray-400 uppercase">
                    {{ new Date(event.date + 'T00:00:00').toLocaleString('en-US', { month: 'short' }) }}
                  </div>
                  <div class="text-xl font-bold text-gray-900 leading-tight">
                    {{ new Date(event.date + 'T00:00:00').getDate() }}
                  </div>
                </div>
                <!-- Divider -->
                <div class="w-px h-8 bg-gray-200 flex-shrink-0" />
                <!-- Event info -->
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-gray-900 text-sm">{{ event.name }}</div>
                  <div class="text-xs text-gray-400 mt-0.5">
                    {{ new Date(event.date + 'T00:00:00').toLocaleString('en-US', { weekday: 'long' }) }}
                  </div>
                </div>
                <!-- Badge -->
                <span class="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0" :class="eventTypeColor[event.type]">
                  {{ eventTypeLabel[event.type] }}
                </span>
              </div>
            </div>
          </div>

          <!-- Break Summary -->
          <div v-else-if="section === 'breaks' && breaks.length" class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Major School Breaks</h2>
            <div class="space-y-3">
              <div v-for="b in breaks" :key="b.name" class="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <div class="font-medium text-gray-900">{{ b.name }}</div>
                  <div class="text-sm text-gray-500">{{ formatShortDate(b.start) }} – {{ formatShortDate(b.end) }}</div>
                  <div v-if="todayStr >= b.start && todayStr <= b.end" class="text-xs text-purple-600 mt-0.5 font-medium">
                    In progress
                  </div>
                </div>
                <div class="text-sm font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">{{ breakDurationLabel(b) }}</div>
              </div>
            </div>
          </div>

        </template>

        <!-- Custom Sections: afterAbout (default position) -->
        <DistrictCustomSections :sections="customSections" position="afterAbout" />

        <!-- Year by the Numbers -->
        <DistrictYearNumbers v-if="!hiddenSections.has('yearNumbers')" :cal="cal" :school-year="currentYear" />

        <!-- Grading Periods -->
        <DistrictGradingPeriods :periods="(cal as any).gradingPeriods" />

        <!-- What's Different This Year -->
        <DistrictYearDiff v-if="!hiddenSections.has('whatsDifferent')" :cal="cal" :prev-cal="prevCal ?? undefined" />

        <!-- Year Switcher -->
        <div v-if="archivedYears.length" class="flex items-center gap-2 flex-wrap">
          <span class="text-sm text-gray-500">Other years:</span>
          <NuxtLink
            v-for="y in archivedYears"
            :key="y"
            :to="`/${slug}/${y}`"
            class="text-sm px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            {{ y }}
          </NuxtLink>
        </div>

        <!-- Compare with Nearby Districts -->
        <DistrictComparison :cal="cal" :district="district" :related-cals="relatedCals ?? []" :all-districts="allDistricts ?? []" :year="currentYear" />

        <!-- FAQ -->
        <DistrictFaq :cal="cal" :district="district" />

        <!-- Custom Sections: afterFaq -->
        <DistrictCustomSections :sections="customSections" position="afterFaq" />

        <!-- Planning Tips -->
        <DistrictPlanningTips
          v-if="!hiddenSections.has('planningTips') && (district as any).planningTips?.content?.length"
          :name="district.shortName || district.name"
          :tips="(district as any).planningTips.content"
          :title="(district as any).planningTips.title"
        />

        <!-- Custom Sections: afterPlanningTips -->
        <DistrictCustomSections :sections="customSections" position="afterPlanningTips" />

        <!-- District Profile (moved below Planning Tips) -->
        <DistrictProfile
          v-if="!hiddenSections.has('districtProfile') && ((district as any).studentCount || (district as any).schoolCount)"
          :student-count="(district as any).studentCount"
          :school-count="(district as any).schoolCount"
          :calendar-type="(district as any).calendarType"
          :grades="district.grades"
          :founded="(district as any).founded"
          :county="(district as any).county"
          :metro="(district as any).metro"
          :district-fact="(district as any).districtFact"
        />

        <!-- Living Here -->
        <DistrictLivingHere
          v-if="!hiddenSections.has('livingHere') && (district as any).livingHere?.highlights?.length"
          :city="district.city || district.name"
          :intro="(district as any).livingHere.intro"
          :highlights="(district as any).livingHere.highlights"
        />

        <!-- Related Districts -->
        <DistrictRelatedDistricts
          v-if="!hiddenSections.has('relatedDistricts') && (district as any).relatedDistricts?.length"
          :related-districts="(district as any).relatedDistricts"
          :state-name="district.state"
        />

        <!-- Custom Sections: beforeSources -->
        <DistrictCustomSections :sections="customSections" position="beforeSources" />

        <!-- Sources & Verification -->
        <DistrictSources
          v-if="(district as any).sources?.length"
          :sources="(district as any).sources"
          :district-name="district.name"
          :short-name="(district as any).shortName || district.name"
          :year="currentYear"
          :verified-date="verifiedDate"
          :source-version="(cal as any).sourceVersion"
          :source-pdf-url="(cal as any).sourcePdfUrl"
        />

        <!-- Data quality notice -->
        <DistrictDataQuality
          v-if="!(district as any).sources?.length"
          :cal="cal"
          :district="district"
          :year="currentYear"
        />

      </main>
    </template>
  </div>
</template>
