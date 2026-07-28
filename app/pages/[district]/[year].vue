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
const { data: prevCal } = await useAsyncData(`prev-cal:${slug}:${prevYearVal}`, async () => {
  if (!district.value) return null
  const previous = await queryCollection('calendars')
    .where('institutionId', '=', district.value.institutionId)
    .where('schoolYear', '=', prevYearVal)
    .first()
  return previous ? toComparisonCalendarSummary(previous) : null
})

const { data: yearOptions } = await useAsyncData(`years:${slug}:${year}`, async () => {
  if (!district.value) return []
  const years = await queryCollection('calendars')
    .where('institutionId', '=', district.value.institutionId)
    .order('schoolYear', 'DESC')
    .all()
  return (years ?? []).map(c => c.schoolYear)
})

const isCurrentYear = district.value.currentSchoolYear === year
const hubUrl = `https://myschooldates.com/${slug}`
const canonicalUrl = isCurrentYear ? hubUrl : `${hubUrl}/${year}`
const availableYears = computed(() => yearOptions.value ?? [])
const yearLink = (y: string) => y === district.value!.currentSchoolYear ? `/${slug}` : `/${slug}/${y}`

function eventSchemaLocation() {
  return {
    '@type': 'Place',
    name: `${district.value!.name} districtwide calendar`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: district.value!.city ?? '',
      addressRegion: (district.value as any).stateCode ?? district.value!.state,
      addressCountry: district.value!.country ?? 'US',
    },
  }
}

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
const heroFactChips = computed(() =>
  (((cal.value as any)?.heroFactChips ?? (cal.value as any)?.meta?.heroFactChips ?? []) as string[]).filter(Boolean)
)
const winterBreakLabel = computed(() => {
  const winterBreak = breaks.value.find(b =>
    b.name.toLowerCase().includes('winter') ||
    b.name.toLowerCase().includes('christmas') ||
    b.name.toLowerCase().includes('december')
  )
  return winterBreak
    ? winterBreak.name.replace(/\b(Begins|Starts|Begin|Start)\b/gi, '').replace(/\s+/g, ' ').trim()
    : 'Winter Break'
})
const springBreak = computed(() =>
  breaks.value.find(b => b.name.toLowerCase().includes('spring')) ?? null
)
const springBreakReturnDate = computed(() => {
  if (!springBreak.value) return ''
  return cal.value?.events?.find((event: any) =>
    ['school_resume', 'school_reopen'].includes(event.type) && event.date > springBreak.value!.end
  )?.date ?? ''
})
const isEstimated = computed(() => !(cal.value as any)?.lastVerifiedAt)
const verifiedDate = computed(() => {
  if (!(cal.value as any)?.lastVerifiedAt) return null
  return new Date((cal.value as any).lastVerifiedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
})
const editorialAuthorName = 'Denis Dou'

const hiddenSections = computed(() => new Set<string>((district.value as any).hiddenSections ?? []))
const hideHeroVerificationProcess = computed(() =>
  Boolean(slug === 'chicago-public-schools-calendar' || (district.value as any).hideHeroVerificationProcess || (cal.value as any)?.hideHeroVerificationProcess || (cal.value as any)?.meta?.hideHeroVerificationProcess)
)
const hasCalendarTrackCaution = computed(() => {
  const text = `${(cal.value as any)?.calendarNotes ?? ''} ${(district.value as any)?.districtFact ?? ''}`.toLowerCase()
  return text.includes('track') || text.includes('modified traditional') || text.includes('year-round')
})
const calendarTrackLabel = computed(() => {
  const type = String((cal.value as any)?.calendarType ?? '').replace(/[_-]+/g, ' ')
  return type ? type.replace(/\b\w/g, c => c.toUpperCase()) : 'Student'
})
const calendarShownLabel = computed(() =>
  String((cal.value as any)?.calendarShownLabel ?? (cal.value as any)?.meta?.calendarShownLabel ?? `${district.value?.shortName || district.value?.name} ${calendarTrackLabel.value} Calendar`)
)
const calendarShownDescription = computed(() =>
  String((cal.value as any)?.calendarShownDescription ?? (cal.value as any)?.meta?.calendarShownDescription ?? 'Other calendar tracks or specialized programs may use different dates. Check your school\'s assigned calendar before making plans.')
)
const calendarSelectorGroups = computed(() =>
  (((cal.value as any)?.calendarSelectorGroups ?? (cal.value as any)?.meta?.calendarSelectorGroups ?? []) as Array<{ label?: string, items?: string[] }>).filter(group => group.label && Array.isArray(group.items) && group.items.length)
)
const alternateCalendarsNotice = computed(() =>
  String((cal.value as any)?.alternateCalendarsNotice ?? (cal.value as any)?.meta?.alternateCalendarsNotice ?? '')
)
const customJumpNavigation = computed(() =>
  (((cal.value as any)?.jumpNavigation ?? (cal.value as any)?.meta?.jumpNavigation ?? []) as Array<{ label?: string, href?: string, id?: string }>).filter(item => item.label && (item.href || item.id))
)

const instructionalDaysLine = computed(() => {
  if ((cal.value as any)?.hideInstructionalDaysSummary === true || (cal.value as any)?.meta?.hideInstructionalDaysSummary === true) {
    return `School year span: ${formatShortDate(cal.value!.firstDay)} - ${formatShortDate(cal.value!.lastDay)}`
  }
  const days = cal.value?.totalSchoolDays ?? 180
  const description = String((cal.value as any)?.instructionalDaysDescription ?? (cal.value as any)?.meta?.instructionalDaysDescription ?? '').toLowerCase()
  const label = String((cal.value as any)?.instructionalDaysLabel ?? (cal.value as any)?.meta?.instructionalDaysLabel ?? '').toLowerCase()
  if (description.includes('attendance-day count') || description.includes('exact attendance')) {
    return `School year span: ${formatShortDate(cal.value!.firstDay)} - ${formatShortDate(cal.value!.lastDay)}`
  }
  if (description.includes('approximately') || description.includes('approximate')) {
    const sourceName = district.value?.shortName || district.value?.name || 'district'
    return `Approximately ${days} instructional days are scheduled, based on the published ${sourceName} calendar`
  }
  if (description.includes('summarized') || description.includes('summary')) {
    return `${days} listed calendar days (calendar summary)`
  }
  if (description.includes('calculated')) {
    const sourceName = district.value?.shortName || district.value?.name || 'district'
    if (label.includes('attendance')) {
      return `${days} calculated student attendance days, based on the published ${sourceName} calendar`
    }
    return `${days} currently scheduled instructional days, calculated from the published ${sourceName} calendar`
  }
  return `${days} instructional days`
})
type DistrictCustomSection = {
  id: string
  label: string
  content: string
  position?: string
  collapsible?: boolean
  defaultOpen?: boolean
  image?: { src: string; alt: string; caption?: string; width?: number; height?: number }
  groups?: { label: string; items: string[] }[]
  links?: { label: string; to: string; description?: string }[]
  table?: { columns?: string[]; headers?: string[]; rows: string[][] }
}
const customSections = computed(() => [
  ...(((district.value as any).customSections ?? []) as DistrictCustomSection[]),
  ...(((cal.value as any)?.customSections ?? []) as DistrictCustomSection[]),
  ...(((cal.value as any)?.meta?.customSections ?? []) as DistrictCustomSection[]),
])
const summarySectionId = computed(() => {
  const section = customSections.value.find(s =>
    s.id.toLowerCase().includes('summary') ||
    s.label.toLowerCase().includes('summary')
  )
  return section?.id
})
const overviewSectionId = computed(() => {
  const section = customSections.value.find(s =>
    s.id.toLowerCase().includes('overview') ||
    s.label.toLowerCase().includes('overview') ||
    s.id.toLowerCase().includes('at-a-glance') ||
    s.label.toLowerCase().includes('at a glance')
  )
  return section?.id
})
const downloadGuideSectionId = computed(() => {
  const section = customSections.value.find(s => {
    const text = `${s.id} ${s.label}`.toLowerCase()
    return s.position === 'afterCalendarExport' && (text.includes('download') || text.includes('print'))
  })
  return section?.id
})
const changesSectionId = computed(() => {
  const section = customSections.value.find(s => {
    const text = `${s.id} ${s.label}`.toLowerCase()
    return text.includes('change') || text.includes('year-diff') || text.includes('previous year')
  })
  return section?.id
})
const importantDatesSectionId = computed(() => {
  const section = customSections.value.find(s => {
    const text = `${s.id} ${s.label}`.toLowerCase()
    return text.includes('important-date') || text.includes('important date')
  })
  return section?.id
})
const planningSectionId = computed(() => {
  const section = customSections.value.find(s =>
    s.id.toLowerCase().includes('planning-around') ||
    s.label.toLowerCase().includes('planning around')
  )
  return section?.id || ((district.value as any).planningTips?.content?.length ? 'planning-tips' : undefined)
})
const earlyDismissalSectionId = computed(() => {
  const section = customSections.value.find(s => {
    const text = `${s.id} ${s.label}`.toLowerCase()
    return text.includes('early-dismissal') ||
      text.includes('early dismissal') ||
      text.includes('shortened-days') ||
      text.includes('shortened days')
  })
  return section?.id
})
const hasBreaksSection = computed(() => customSections.value.some(s => s.position === 'afterBreaks'))
const calendarTrackHelpId = computed(() => {
  const section = customSections.value.find(s =>
    s.id.toLowerCase().includes('calendar-track') ||
    s.label.toLowerCase().includes('calendar track') ||
    s.label.toLowerCase().includes('calendar type')
  )
  return section?.id || (((cal.value as any)?.alternateCalendars?.length) ? 'other-calendars' : 'sources')
})
const allDatesMode = computed(() => ((district.value as any)?.allDatesMode === 'keyDates' ? 'keyDates' : 'all') as 'all' | 'keyDates')
const allDatesTitle = computed(() =>
  allDatesMode.value === 'keyDates'
    ? `Major Student Calendar Dates — ${year}`
    : `All Important Dates — ${year}`
)

const allFaqs = computed(() => {
  if (!district.value || !cal.value) return []
  const specificFaqs: { q: string; a: string }[] = (district.value as any).districtFaqs ?? []
  const calendarFaqs: { q: string; a: string }[] = (cal.value as any).calendarFaqs ?? []
  const dedupeFaqs = (items: { q: string; a: string }[]) => {
    const seen = new Set<string>()
    return items.filter((faq) => {
      const key = faq.q.trim().toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
  const prefersCalendarFirst = (cal.value as any).faqOrderLimit ?? (cal.value as any).meta?.faqOrderLimit ?? (district.value as any).faqOrderLimit ?? (district.value as any).meta?.faqOrderLimit ?? (cal.value as any).faqLimit ?? (cal.value as any).meta?.faqLimit ?? (district.value as any).faqLimit ?? (district.value as any).meta?.faqLimit
  if (typeof prefersCalendarFirst === 'number' && prefersCalendarFirst > 0) {
    return dedupeFaqs([...calendarFaqs, ...specificFaqs])
  }
  return dedupeFaqs([...specificFaqs, ...calendarFaqs])
})
const faqs = computed(() => {
  const displayQuestions = [
    ...(((district.value as any)?.faqDisplayQuestions ?? (district.value as any)?.meta?.faqDisplayQuestions ?? []) as string[]),
    ...(((cal.value as any)?.faqDisplayQuestions ?? (cal.value as any)?.meta?.faqDisplayQuestions ?? []) as string[]),
  ]
  if (displayQuestions.length) {
    return displayQuestions
      .map(q => allFaqs.value.find(item => item.q.trim().toLowerCase() === q.trim().toLowerCase()))
      .filter(Boolean) as { q: string; a: string }[]
  }
  const displayLimit = (cal.value as any)?.faqDisplayLimit ?? (cal.value as any)?.meta?.faqDisplayLimit ?? (district.value as any)?.faqDisplayLimit ?? (district.value as any)?.meta?.faqDisplayLimit ?? (cal.value as any)?.faqLimit ?? (cal.value as any)?.meta?.faqLimit ?? (district.value as any)?.faqLimit ?? (district.value as any)?.meta?.faqLimit
  if (typeof displayLimit === 'number' && displayLimit > 0) {
    return allFaqs.value.slice(0, displayLimit)
  }
  return allFaqs.value
})
const faqSchemaItems = computed(() => {
  const limit = (cal.value as any).faqSchemaLimit ?? (cal.value as any).meta?.faqSchemaLimit ?? (district.value as any).faqSchemaLimit ?? (district.value as any).meta?.faqSchemaLimit
  const includeQuestions = [
    ...(((district.value as any).faqSchemaQuestions ?? (district.value as any).meta?.faqSchemaQuestions ?? []) as string[]),
    ...(((cal.value as any).faqSchemaQuestions ?? (cal.value as any).meta?.faqSchemaQuestions ?? []) as string[]),
  ]
  const excludes = [
    ...(((district.value as any).faqSchemaExclude ?? (district.value as any).meta?.faqSchemaExclude ?? []) as string[]),
    ...(((cal.value as any).faqSchemaExclude ?? (cal.value as any).meta?.faqSchemaExclude ?? []) as string[]),
  ].map(item => item.toLowerCase())
  const includedCandidates = includeQuestions.length
    ? includeQuestions
      .map(q => allFaqs.value.find(item => item.q.trim().toLowerCase() === q.trim().toLowerCase()))
      .filter(Boolean) as { q: string; a: string }[]
    : allFaqs.value
  const candidates = excludes.length
    ? includedCandidates.filter(item => !excludes.some(exclude => item.q.toLowerCase().includes(exclude)))
    : includedCandidates
  if (includeQuestions.length) {
    return typeof limit === 'number' && limit > 0 ? candidates.slice(0, limit) : candidates
  }
  if (typeof limit !== 'number' || limit <= 0) return candidates
  const priority = (q: string) => {
    const text = q.toLowerCase()
    if (text.includes('first day') || text.includes('start')) return 1
    if (text.includes('last day') || text.includes('end')) return 2
    if (text.includes('pdf') || text.includes('print')) return 3
    if (text.includes('google calendar') || text.includes('ics') || text.includes('import')) return 4
    if (text.includes('weather') || text.includes('make-up') || text.includes('makeup')) return 5
    return 20
  }
  return [...candidates]
    .sort((a, b) => priority(a.q) - priority(b.q))
    .slice(0, limit)
})

const heroSummary = computed(() => (cal.value as any).heroSummary ?? (cal.value as any).meta?.heroSummary ?? '')
const heroQuickDates = computed(() =>
  (((cal.value as any)?.heroQuickDates ?? (cal.value as any)?.meta?.heroQuickDates ?? []) as Array<{ label?: string, value?: string }>).filter(item => item.label && item.value)
)

const _dn = district.value.name
const _sn = (district.value as any).shortName || _dn
const _titleSuffix = (cal.value as any).sourcePdfUrl ? ': PDF & Holidays' : ': Holidays & Key Dates'
const _fd = formatShortDate(cal.value.firstDay)
const _ld = formatShortDate(cal.value.lastDay)
const _hasSpring = breaks.value.some(b => b.name.toLowerCase().includes('spring'))
const _descTemplates = [
  // A — PDF + key dates (~130 chars)
  `${_sn} Calendar ${year} with holidays${_hasSpring ? ', spring break' : ''} and key dates. Download the official PDF or calendar import file.`,
  // B — verified + download (~125 chars)
  `${_sn} Calendar ${year}: first day ${_fd}, last day ${_ld}${_hasSpring ? ', spring break' : ''}. Checked against district source. Download the PDF or .ics calendar file.`,
  // C — user benefit (~135 chars)
  `${_sn} Calendar ${year} — verified holidays${_hasSpring ? ', spring break' : ''}, key dates, and official PDF download. Works with Google Calendar.`,
  // D — ICS/sync (~130 chars)
  `${_sn} ${year} calendar dates sourced from official district calendars, with holidays${_hasSpring ? ', spring break' : ''} and winter break. Download PDF or importable .ics file.`,
  // E — verified dates (~130 chars)
  `${_sn} ${year}: first day ${_fd}, last day ${_ld}. Holidays${_hasSpring ? ', spring break' : ''}, official PDF, and calendar import file.`,
]
const _autoDesc = _descTemplates[simpleHash(district.value.slug + year) % _descTemplates.length]
const _autoTitle = `${_dn} Calendar ${year}${_titleSuffix}`

const _replacePlaceholders = (s: string) =>
  s.replace(/\{year\}/g, year).replace(/\{shortName\}/g, _sn).replace(/\{name\}/g, _dn)
const _districtTitle = (district.value as any).seoTitle ? _replacePlaceholders((district.value as any).seoTitle) : undefined
const _districtDesc = (district.value as any).seoDescription ? _replacePlaceholders((district.value as any).seoDescription) : undefined
const _pageTitle = (cal.value as any).seoTitle ?? _districtTitle ?? _autoTitle
const _pageDesc = (cal.value as any).seoDescription ?? _districtDesc ?? _autoDesc
const schemaImageUrl = 'https://myschooldates.com/icons/myschooldates-og-img.png'
const schemaLicenseUrl = 'https://myschooldates.com/terms'

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
const reviewTeamEntity = {
  '@type': 'Organization',
  '@id': 'https://myschooldates.com/#education-research-team',
  name: 'MySchoolDates Calendar Data Team',
  url: 'https://myschooldates.com/calendar-verification-methodology',
  parentOrganization: { '@id': 'https://myschooldates.com/#organization' },
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
  ...(district.value.shortName && district.value.shortName !== district.value.name ? { alternateName: district.value.shortName } : {}),
  url: district.value.officialWebsite,
  sameAs: [district.value.officialWebsite, district.value.calendarPage].filter(Boolean),
}
const pageDateCreated = (cal.value as any).dateCreated
const pageDateModified = (cal.value as any).dateModified ?? (cal.value as any).lastVerifiedAt
const pageDatePublished = (cal.value as any).datePublished
const sourcePdfUrl = (cal.value as any).sourcePdfUrl
const printablePdfPath = (cal.value as any).printablePdfUrl
const printablePdfUrl = typeof printablePdfPath === 'string'
  ? printablePdfPath.startsWith('http') ? printablePdfPath : `https://myschooldates.com${printablePdfPath}`
  : ''
const sourceUrl = (cal.value as any).sourceUrl ?? district.value.calendarPage
const sourcePdfIsArchivedCopy = typeof sourcePdfUrl === 'string' && sourcePdfUrl.includes('assets.myschooldates.com')
const basedOnUrl = sourcePdfUrl && !sourcePdfIsArchivedCopy ? sourcePdfUrl : sourceUrl
const sourceCalendarName = (cal.value as any).sourceVersion
  ?? `${district.value.name} ${year} Calendar ${sourcePdfUrl && !sourcePdfIsArchivedCopy ? 'PDF' : 'Source'}`
const sourceCitation = basedOnUrl
  ? [{ '@id': `${canonicalUrl}#source-calendar` }]
  : []
const calendarTypeName = String((cal.value as any)?.calendarType ?? '').replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
const schemaCalendarName = calendarTypeName
  ? `${district.value.name} ${calendarTypeName} Calendar ${year}`
  : `${district.value.name} Calendar ${year}`
const schemaDatasetName = (cal.value as any)?.schemaDatasetName ?? (cal.value as any)?.meta?.schemaDatasetName ?? `${schemaCalendarName} Dataset`
const datasetDescription = calendarTypeName
  ? `Major ${calendarTypeName} Calendar dates for ${district.value.name} in ${year}, including school-year boundaries, major holidays, break ranges, and school resume dates.`
  : `Major calendar dates for ${district.value.name} in ${year}, including school-year boundaries, major holidays, break ranges, and school resume dates.`
const schemaKeywords = [
  ...(((district.value as any).schemaKeywords ?? (district.value as any).meta?.schemaKeywords ?? []) as string[]),
  ...(((cal.value as any)?.schemaKeywords ?? (cal.value as any)?.meta?.schemaKeywords ?? []) as string[]),
]
const sourceCalendarEntity = basedOnUrl ? {
  '@type': 'CreativeWork',
  '@id': `${canonicalUrl}#source-calendar`,
  name: sourceCalendarName,
  url: basedOnUrl,
  publisher: { '@id': districtAbout['@id'] },
} : null
const calendarIcsUrl = `https://myschooldates.com/calendars/${district.value.slug}-${cal.value.schoolYear}.ics`
const hideDatasetSchema = computed(() => Boolean((cal.value as any)?.hideDatasetSchema || (cal.value as any)?.meta?.hideDatasetSchema))
const datasetTemporalCoverage = computed(() => {
  const start = (cal.value as any)?.temporalCoverageStart || cal.value.firstDay
  const end = (cal.value as any)?.temporalCoverageEnd || cal.value.lastDay
  return `${start}/${end}`
})
const datasetEntity = hideDatasetSchema.value ? null : {
  '@type': 'Dataset',
  '@id': `${canonicalUrl}#calendar-dataset`,
  name: schemaDatasetName,
  description: datasetDescription,
  url: canonicalUrl,
  ...(schemaKeywords.length ? { keywords: schemaKeywords } : {}),
  license: schemaLicenseUrl,
  usageInfo: schemaLicenseUrl,
  inLanguage: 'en-US',
  ...(pageDateCreated ? { dateCreated: pageDateCreated } : {}),
  ...(pageDateModified ? { dateModified: pageDateModified } : {}),
  ...(pageDateModified ? { lastReviewed: pageDateModified } : {}),
  temporalCoverage: datasetTemporalCoverage.value,
  audience: {
    '@type': 'Audience',
    audienceType: 'Parents and Families',
  },
  creator: { '@id': 'https://myschooldates.com/#organization' },
  publisher: { '@id': 'https://myschooldates.com/#organization' },
  provider: { '@id': 'https://myschooldates.com/#organization' },
  reviewedBy: { '@id': 'https://myschooldates.com/#education-research-team' },
  sourceOrganization: { '@id': districtAbout['@id'] },
  isBasedOn: basedOnUrl ? { '@id': `${canonicalUrl}#source-calendar` } : undefined,
  distribution: [
    {
      '@type': 'DataDownload',
      name: `${schemaCalendarName} calendar file`,
      description: `Calendar import file generated from ${district.value.shortName ?? district.value.name} dates checked against the public official district source used for this page.`,
      encodingFormat: 'text/calendar',
      contentUrl: calendarIcsUrl,
    },
    sourcePdfUrl ? {
      '@type': 'DataDownload',
      name: `${schemaCalendarName} official PDF`,
      description: `Official ${year} calendar PDF used as a source for this ${district.value.shortName ?? district.value.name} calendar dataset.`,
      encodingFormat: 'application/pdf',
      contentUrl: sourcePdfUrl,
    } : null,
    printablePdfUrl ? {
      '@type': 'DataDownload',
      name: `${schemaCalendarName} printable PDF`,
      description: `Printable PDF generated by MySchoolDates from the reviewed ${district.value.shortName ?? district.value.name} ${year} calendar records.`,
      encodingFormat: 'application/pdf',
      contentUrl: printablePdfUrl,
    } : null,
  ].filter(Boolean),
}
const siblingYearLinks = availableYears.value
  .filter(y => y !== year)
  .map(y => y === district.value!.currentSchoolYear ? hubUrl : `${hubUrl}/${y}`)
const keyDateItemListEvents = computed(() => {
  const HIGHLIGHT_TYPES = new Set(['school_start', 'school_end', 'break_start'])
  if ((cal.value as any)?.itemListMode === 'allImportantDates') {
    return (cal.value?.events ?? []).filter((event: any) => event.type !== 'break_end')
  }
  return (cal.value?.events ?? []).filter((event: any) => HIGHLIGHT_TYPES.has(event.type) || event.schemaEvent === true)
})
const customSectionSchemaParts = computed(() =>
  customSections.value
    .filter((section) => {
      if ((section as any).schemaHasPart === true || (section as any).schema?.hasPart === true) return true
      const text = `${section.id} ${section.label}`.toLowerCase()
      return text.includes('download') ||
        text.includes('pdf') ||
        text.includes('preview') ||
        text.includes('print') ||
        text.includes('parent planning') ||
        text.includes('family planning') ||
        text.includes('planning guide') ||
        text.includes('calendar insights') ||
        text.includes('verification') ||
        text.includes('review') ||
        text.includes('update history')
    })
    .map(section => ({
      '@type': 'WebPageElement',
      '@id': `${canonicalUrl}#${section.id}`,
      name: section.label,
    }))
)
const yearNumbersSchemaParts = computed(() => {
  const title = (cal.value as any)?.yearNumbersTitle ?? (cal.value as any)?.meta?.yearNumbersTitle ?? ''
  return !hiddenSections.value.has('yearNumbers') && String(title).toLowerCase().includes('insights')
    ? [{
      '@type': 'WebPageElement',
      '@id': `${canonicalUrl}#calendar-insights`,
      name: title,
    }]
    : []
})
const webPageEntity = {
  '@type': 'WebPage',
  '@id': `${canonicalUrl}#webpage`,
  name: _pageTitle,
  description: _pageDesc,
  url: canonicalUrl,
  inLanguage: 'en-US',
  ...(pageDateCreated ? { dateCreated: pageDateCreated } : {}),
  ...(pageDateModified ? { dateModified: pageDateModified } : {}),
  ...(pageDateModified ? { lastReviewed: pageDateModified } : {}),
  ...(pageDatePublished ? { datePublished: pageDatePublished } : {}),
  publisher: { '@id': 'https://myschooldates.com/#organization' },
  author: { '@id': 'https://myschooldates.com/#education-research-team' },
  reviewedBy: { '@id': 'https://myschooldates.com/#education-research-team' },
  audience: {
    '@type': 'Audience',
    audienceType: 'Parents and Families',
  },
  about: { '@id': districtAbout['@id'] },
  ...(keyDateItemListEvents.value.length
    ? { mainEntity: { '@id': `${canonicalUrl}#key-dates` } }
    : datasetEntity
      ? { mainEntity: { '@id': `${canonicalUrl}#calendar-dataset` } }
      : {}),
  ...((datasetEntity || faqSchemaItems.value.length || customSectionSchemaParts.value.length || yearNumbersSchemaParts.value.length)
    ? { hasPart: [
      { '@id': `${canonicalUrl}#calendar-analysis` },
      ...(datasetEntity ? [{ '@id': `${canonicalUrl}#calendar-dataset` }] : []),
      ...(faqSchemaItems.value.length ? [{ '@id': `${canonicalUrl}#faq` }] : []),
      ...customSectionSchemaParts.value,
      ...yearNumbersSchemaParts.value,
    ] }
    : {}),
  ...(siblingYearLinks.length ? { relatedLink: siblingYearLinks } : {}),
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
const articleEntity = {
  '@type': 'Article',
  '@id': `${canonicalUrl}#calendar-analysis`,
  headline: _pageTitle,
  description: _pageDesc,
  url: canonicalUrl,
  inLanguage: 'en-US',
  ...(pageDatePublished ? { datePublished: pageDatePublished } : {}),
  ...(pageDateModified ? { dateModified: pageDateModified } : {}),
  ...(pageDateModified ? { dateReviewed: pageDateModified } : {}),
  author: { '@id': 'https://myschooldates.com/#education-research-team' },
  publisher: { '@id': 'https://myschooldates.com/#organization' },
  reviewedBy: { '@id': 'https://myschooldates.com/#education-research-team' },
  about: { '@id': districtAbout['@id'] },
  isPartOf: { '@id': `${canonicalUrl}#webpage` },
  ...(datasetEntity ? { mainEntity: { '@id': `${canonicalUrl}#calendar-dataset` } } : {}),
  ...(basedOnUrl ? { isBasedOn: { '@id': `${canonicalUrl}#source-calendar` } } : {}),
}
const faqPageEntity = faqSchemaItems.value.length ? {
  '@type': 'FAQPage',
  '@id': `${canonicalUrl}#faq`,
  isPartOf: { '@id': `${canonicalUrl}#webpage` },
  mainEntity: faqSchemaItems.value.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.a,
    },
  })),
} : null
const keyDateItemListEntity = keyDateItemListEvents.value.length ? {
  '@type': 'ItemList',
  '@id': `${canonicalUrl}#key-dates`,
  name: `${district.value.shortName || district.value.name} ${year} key school calendar dates`,
  itemListElement: keyDateItemListEvents.value.map((event: any, i: number) => {
    const range = event.type === 'break_start'
      ? { start: event.date, end: breaks.value.find((b: any) => b.name === event.name && b.start === event.date)?.end ?? event.date }
      : { start: event.date, end: event.date }
    return {
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Event',
        name: event.name,
        description: event.description
          ?? `${event.name} for the ${district.value.name} ${year} districtwide school calendar.`,
        image: schemaImageUrl,
        startDate: range.start,
        endDate: range.end,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: eventSchemaLocation(),
        organizer: { '@id': districtAbout['@id'] },
        performer: { '@id': districtAbout['@id'] },
        isAccessibleForFree: true,
      },
    }
  }),
} : null
const comparisonItems = [
  { district: district.value, calendar: cal.value, url: canonicalUrl },
  ...((relatedCals.value ?? []).slice(0, 3).map((relatedCal: any) => {
    const relatedDistrict = (allDistricts.value ?? []).find((d: any) => d.institutionId === relatedCal.institutionId)
    return relatedDistrict ? { district: relatedDistrict, calendar: relatedCal, url: `https://myschooldates.com/${relatedDistrict.slug}` } : null
  }).filter(Boolean)),
]
const includeComparisonSchema = (district.value as any)?.includeComparisonSchema !== false && (cal.value as any)?.includeComparisonSchema !== false
const includeArticleSchema = (district.value as any)?.includeArticleSchema !== false && (cal.value as any)?.includeArticleSchema !== false
const comparisonItemListEntity = includeComparisonSchema && comparisonItems.length > 1 ? {
  '@type': 'ItemList',
  '@id': `${canonicalUrl}#nearby-calendar-comparison`,
  name: `${district.value.name} nearby district calendar comparison`,
  itemListElement: comparisonItems.map((item: any, i: number) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'EducationalOrganization',
      '@id': item.url ? `${item.url}#district` : undefined,
      name: item.district.name,
      url: item.url,
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'School year', value: item.calendar.schoolYear },
        { '@type': 'PropertyValue', name: 'First day', value: item.calendar.firstDay },
        { '@type': 'PropertyValue', name: 'Last day', value: item.calendar.lastDay },
      ],
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
        reviewTeamEntity,
        siteEntity,
        districtAbout,
        ...(sourceCalendarEntity ? [sourceCalendarEntity] : []),
        ...(datasetEntity ? [datasetEntity] : []),
        ...(includeArticleSchema ? [articleEntity] : []),
        webPageEntity,
        ...(keyDateItemListEntity ? [keyDateItemListEntity] : []),
        ...(comparisonItemListEntity ? [comparisonItemListEntity] : []),
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
        <svg class="w-5 h-5 text-blue-700 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p class="text-sm text-blue-700">
          You're viewing the <strong>{{ isFutureYear ? 'upcoming' : 'archived' }} {{ year }}</strong> calendar.
          <NuxtLink :to="`/${slug}`" class="underline font-medium">View the current {{ district!.currentSchoolYear }} calendar →</NuxtLink>
        </p>
      </div>

      <!-- Title -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          {{ (cal as any).pageHeading || `${district!.name} Calendar ${year}` }}
        </h1>
        <div class="mt-3 text-gray-600 leading-relaxed space-y-2">
          <p v-if="heroSummary">
            {{ heroSummary }}
          </p>
          <p v-else>
            The first day of school for {{ district!.name }}<template v-if="district!.shortName && !district!.name.includes(district!.shortName)">, also known as {{ district!.shortName }},</template> {{ isFutureYear ? 'is' : 'was' }}
            <strong>{{ formatWeekdayDate(cal!.firstDay) }}</strong>.
            The last day {{ isFutureYear || isCurrentYear ? 'is' : 'was' }}
            <strong>{{ formatWeekdayDate(cal!.lastDay) }}</strong>.
            <span v-if="springBreak">
              Spring Break {{ isFutureYear || isCurrentYear ? 'runs' : 'ran' }}
              {{ formatShortDate(springBreak.start) }}–{{ formatShortDate(springBreak.end) }}<template v-if="springBreakReturnDate">, with students returning {{ formatShortDate(springBreakReturnDate) }}</template>.
            </span>
          </p>
          <div v-if="heroQuickDates.length" class="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <p class="text-sm font-semibold text-gray-900">{{ district!.shortName || district!.name }} {{ year }} quick dates:</p>
            <ul class="mt-2 grid gap-1.5 text-sm text-gray-700 sm:grid-cols-2">
              <li v-for="item in heroQuickDates" :key="`${item.label}-${item.value}`">
                <strong>{{ item.label }}:</strong> {{ item.value }}
              </li>
            </ul>
          </div>
          <p class="text-sm text-gray-500">
            {{ instructionalDaysLine }}
            <span v-for="chip in heroFactChips" :key="chip"> · {{ chip }}</span>
            <span v-if="showSemesterCount"> · {{ cal!.semesters ?? 2 }} semesters</span>
            <span v-if="secondSemStart"> · Students return after {{ winterBreakLabel }} on {{ formatShortDate(secondSemStart) }}</span>
          </p>
          <p class="text-xs text-gray-600">
            MySchoolDates is an independent calendar reference and is not affiliated with {{ district!.name }}.
          </p>
          <dl v-if="verifiedDate" class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
            <div>
              <dt class="inline font-semibold uppercase tracking-wide text-gray-600">Reviewed</dt>
              <dd class="ml-1 inline font-medium text-gray-700">{{ verifiedDate }}</dd>
            </div>
            <div>
              <dt class="inline font-semibold uppercase tracking-wide text-gray-600">By</dt>
              <dd class="ml-1 inline font-medium">
                <NuxtLink to="/author" class="text-blue-600 hover:underline">{{ editorialAuthorName }}</NuxtLink>
              </dd>
            </div>
            <div>
              <dt class="inline font-semibold uppercase tracking-wide text-gray-600">Updated</dt>
              <dd class="ml-1 inline font-medium text-gray-700">{{ verifiedDate }}</dd>
            </div>
          </dl>
          <div v-if="verifiedDate" class="mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
            <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>Verified against {{ district.name }} official calendar source · Maintained by MySchoolDates · Last updated {{ verifiedDate }}</span>
          </div>
          <details v-if="verifiedDate && !hideHeroVerificationProcess" class="mt-3 rounded-xl border border-gray-200 bg-white p-3">
            <summary class="cursor-pointer text-xs font-semibold uppercase tracking-wide text-gray-500">How verified</summary>
            <ul class="mt-2 grid gap-1.5 text-xs text-gray-600 sm:grid-cols-3">
              <li class="flex items-start gap-1.5">
                <span class="mt-0.5 text-green-700">✓</span>
                <span>Official district source checked</span>
              </li>
              <li class="flex items-start gap-1.5">
                <span class="mt-0.5 text-green-700">✓</span>
                <span>Key dates compared against source</span>
              </li>
              <li class="flex items-start gap-1.5">
                <span class="mt-0.5 text-green-700">✓</span>
                <span>Calendar file generated from checked records</span>
              </li>
            </ul>
          </details>
          <div class="mt-8">
            <DistrictCustomSections :sections="customSections" position="afterVerification" />
          </div>
        </div>
      </div>

      <!-- Calendar track notice -->
      <div v-if="hasCalendarTrackCaution" class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <svg class="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="space-y-3">
          <p class="text-sm text-blue-800">
            <strong>Calendar shown:</strong> {{ calendarShownLabel }}.
            {{ calendarShownDescription }}
            <a :href="`#${calendarTrackHelpId}`" class="underline font-medium">How to confirm your calendar track</a>
          </p>
          <div v-if="calendarSelectorGroups.length" class="grid gap-2 sm:grid-cols-2">
            <div v-for="group in calendarSelectorGroups" :key="group.label" class="rounded-lg border border-blue-100 bg-white/70 p-3">
              <div class="text-xs font-semibold uppercase tracking-wide text-blue-700">{{ group.label }}</div>
              <div class="mt-1 text-sm font-medium text-blue-900">{{ group.items?.join(' / ') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Key Date Cards -->
      <div id="key-dates" class="scroll-mt-24">
        <DistrictKeyDateCards :cal="cal!" />
      </div>

      <!-- Custom Sections: afterKeyDates -->
      <DistrictCustomSections :sections="customSections" position="afterKeyDates" />

      <!-- Quick Facts -->
      <DistrictQuickFacts
        v-if="!hiddenSections.has('quickFacts')"
        :cal="cal!"
        :district="district!"
        :related-cals="relatedCals ?? []"
        :all-districts="allDistricts ?? []"
        :prev-cal="prevCal ?? undefined"
      />
      <DistrictCustomSections :sections="customSections" position="afterQuickFacts" />

      <div class="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-blue-900">
          Save these school dates to Google Calendar, Apple Calendar, or Outlook, or print the official PDF after reviewing the key dates.
        </p>
        <div class="flex flex-wrap gap-2">
          <a
            href="#add-to-calendar"
            class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Download ICS Calendar
          </a>
          <a
            v-if="(cal as any).sourcePdfUrl || (cal as any).printablePdfUrl"
            :href="(cal as any).sourcePdfUrl || (cal as any).printablePdfUrl"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            {{ (cal as any).sourcePdfUrl ? 'Download PDF' : 'Download Printable PDF' }}
            <span class="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>

      <nav v-if="customJumpNavigation.length" aria-label="Page sections" class="sticky top-2 z-20 -mx-4 flex gap-2 overflow-x-auto border-y border-gray-100 bg-white/95 px-4 py-2 text-xs shadow-sm backdrop-blur sm:mx-0 sm:flex-wrap sm:rounded-xl sm:border">
        <a
          v-for="item in customJumpNavigation"
          :key="item.label"
          :href="item.href || `#${item.id}`"
          class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors"
        >{{ item.label }}</a>
      </nav>
      <nav v-else aria-label="Page sections" class="sticky top-2 z-20 -mx-4 flex gap-2 overflow-x-auto border-y border-gray-100 bg-white/95 px-4 py-2 text-xs shadow-sm backdrop-blur sm:mx-0 sm:flex-wrap sm:rounded-xl sm:border">
        <a href="#key-dates" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Key Dates</a>
        <a v-if="summarySectionId" :href="`#${summarySectionId}`" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Summary</a>
        <a v-if="overviewSectionId" :href="`#${overviewSectionId}`" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Overview</a>
        <a href="#add-to-calendar" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">PDF &amp; Calendar</a>
        <a v-if="downloadGuideSectionId" :href="`#${downloadGuideSectionId}`" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Download Guide</a>
        <a href="#all-dates" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Dates</a>
        <a v-if="hasBreaksSection" href="#breaks" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Breaks</a>
        <a v-if="changesSectionId" :href="`#${changesSectionId}`" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Changes</a>
        <a v-if="planningSectionId" :href="`#${planningSectionId}`" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Planning</a>
        <a v-if="importantDatesSectionId" :href="`#${importantDatesSectionId}`" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Important Dates</a>
        <a v-if="earlyDismissalSectionId" :href="`#${earlyDismissalSectionId}`" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Early Dismissal</a>
        <a href="#comparison" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Comparison</a>
        <a href="#faq" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">FAQ</a>
      </nav>

      <!-- Today / Year Status -->
      <DistrictTodayStatus :cal="cal!" />

      <!-- Add to Calendar + Share -->
      <CalendarExportShare
        :district-name="district!.name"
        :year="year"
        :source-url="cal!.sourceUrl ?? district!.officialWebsite"
        :district="district!"
        :cal="cal!"
      />
      <DistrictCustomSections :sections="customSections" position="afterCalendarExport" />

      <!-- Alternate calendars notice -->
      <div v-if="(cal as any)?.alternateCalendars?.length" class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-amber-800">
          <template v-if="alternateCalendarsNotice">{{ alternateCalendarsNotice }}</template>
          <template v-else>
            This page shows the <strong>Traditional Calendar</strong>, which applies to most {{ district!.name }} schools.
            If your child attends a year-round school or specialized program, see
            <a href="#other-calendars" class="underline font-medium">Other Official Calendars</a> below.
          </template>
        </p>
      </div>

      <!-- All Dates -->
      <DistrictAllDates
        :events="cal!.events"
        :title="allDatesTitle"
        :source-url="cal!.sourceUrl ?? district!.officialWebsite"
        :district-name="district!.name"
        :verified-date="verifiedDate"
        :mode="allDatesMode"
      />

      <!-- Custom Sections: afterBreaks (year pages render this after the full date list) -->
      <div id="breaks" class="scroll-mt-24">
        <DistrictCustomSections :sections="customSections" position="afterBreaks" />
      </div>

      <!-- Other Official Calendars -->
      <DistrictOtherCalendars
        v-if="(cal as any)?.alternateCalendars?.length"
        :alternate-calendars="(cal as any).alternateCalendars"
        :district-name="district!.name"
      />
      <DistrictCustomSections :sections="customSections" position="afterOtherCalendars" />

      <!-- Year by the Numbers -->
      <div v-if="!hiddenSections.has('yearNumbers')" id="calendar-insights" class="scroll-mt-24">
        <DistrictYearNumbers :cal="cal!" :school-year="year" />
      </div>

      <!-- Grading Periods -->
      <DistrictGradingPeriods :periods="(cal as any).gradingPeriods" />

      <!-- What's Different This Year -->
      <div id="year-comparison" class="scroll-mt-24 space-y-8">
        <DistrictYearDiff v-if="!hiddenSections.has('whatsDifferent')" :cal="cal!" :prev-cal="prevCal ?? undefined" />
        <DistrictCustomSections :sections="customSections" position="afterYearDiff" />
      </div>

      <!-- Year Switcher -->
      <div v-if="availableYears.length > 1" class="flex items-center gap-2 flex-wrap">
        <span class="text-sm text-gray-500">Previous / next calendars:</span>
        <NuxtLink
          v-for="y in availableYears"
          :key="y"
          :to="yearLink(y)"
          class="text-sm px-3 py-1 rounded-full border transition-colors"
          :class="y === year ? 'border-blue-200 bg-blue-50 text-blue-700 font-medium' : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'"
        >
          {{ y }}
        </NuxtLink>
      </div>

      <!-- Calendar Context + About -->
      <DistrictCalendarAbout v-if="!hiddenSections.has('about')" :cal="cal!" :district="district!" />

      <!-- Custom Sections: afterAbout (default position) -->
      <DistrictCustomSections :sections="customSections" position="afterAbout" />

      <!-- FAQ -->
      <DistrictFaq :cal="cal!" :district="district!" :faqs="faqs" />

      <!-- Custom Sections: afterFaq -->
      <DistrictCustomSections :sections="customSections" position="afterFaq" />

      <!-- Compare with Nearby Districts -->
      <DistrictComparison v-if="!hiddenSections.has('comparison')" :cal="cal!" :district="district!" :related-cals="relatedCals ?? []" :all-districts="allDistricts ?? []" :year="year" />
      <DistrictCustomSections :sections="customSections" position="afterComparison" />

      <!-- Planning Tips -->
      <DistrictPlanningTips
        id="planning-tips"
        v-if="!hiddenSections.has('planningTips') && (district as any).planningTips?.content?.length"
        :name="district!.shortName || district!.name"
        :tips="(district as any).planningTips.content"
        :title="(district as any).planningTips.title"
        :links="(district as any).planningTips.links"
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
        :title="(district as any).profileTitle ?? (district as any).meta?.profileTitle"
      />

      <!-- Related Districts -->
      <DistrictRelatedDistricts
        v-if="!hiddenSections.has('relatedDistricts') && (district as any).relatedDistricts?.length"
        :related-districts="(district as any).relatedDistricts"
        :state-name="district!.state"
        :title="(district as any).relatedDistrictsTitle"
        :description="(district as any).relatedDistrictsDescription"
      />

      <section v-if="!hiddenSections.has('nationalTrends')" class="rounded-xl border border-gray-200 bg-white p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ district!.shortName || district!.name }} in National Calendar Trends</h2>
        <p class="text-sm leading-relaxed text-gray-600">
          To compare this district calendar with broader U.S. start-date, break, and end-date patterns, see the
          <NuxtLink to="/school-calendar-trends/2026-2027-report" class="font-semibold text-blue-600 hover:underline">
            2026-2027 School Calendar Trends Report
          </NuxtLink>.
        </p>
      </section>

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
