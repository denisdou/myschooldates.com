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
    totalSchoolDays: c.totalSchoolDays,
    sourceUrl: c.sourceUrl,
    sourcePdfUrl: c.sourcePdfUrl,
    sourceVersion: c.sourceVersion,
    comparisonSourceUrl: c.comparisonSourceUrl ?? c.meta?.comparisonSourceUrl,
    comparisonSourceLabel: c.comparisonSourceLabel ?? c.meta?.comparisonSourceLabel,
    comparisonExtraSourceUrl: c.comparisonExtraSourceUrl ?? c.meta?.comparisonExtraSourceUrl,
    comparisonExtraSourceLabel: c.comparisonExtraSourceLabel ?? c.meta?.comparisonExtraSourceLabel,
    events: (c.events ?? [])
      .filter((e: any) => e.type === 'break_start' || e.type === 'break_end')
      .map((e: any) => ({ name: e.name, date: e.date, type: e.type })),
  }
}

function toStateSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-')
}

// Load the route target first. State pages and district pages need different
// supporting data, so avoid serializing the full district index into every page.
const [{ data: district }, { data: statePageData }] = await Promise.all([
  useAsyncData(`district:${slug}`, () =>
    queryCollection('districts').where('slug', '=', slug).first()
  ),
  useAsyncData(`state:${slug}`, () => queryCollection('states').where('stateSlug', '=', slug).first()),
])

const matchedStateName = statePageData.value?.stateName ?? null
const isStatePage = Boolean(matchedStateName && !district.value)

const { data: stateDistrictsData } = await useAsyncData(`state-districts:${slug}`, async () => {
  if (!matchedStateName) return []
  return (await queryCollection('districts').where('state', '=', matchedStateName).order('name', 'ASC').all()).map(toDistrictSummary)
})
const stateDistricts = stateDistrictsData.value ?? []

const { data: allCals } = await useAsyncData(`cals:${slug}`, async () => {
  if (!district.value) return []
  const calendars = await queryCollection('calendars').where('institutionId', '=', district.value.institutionId).order('schoolYear', 'DESC').all()
  return (calendars ?? []).map((calendar: any) =>
    calendar.schoolYear === district.value!.currentSchoolYear ? calendar : toComparisonCalendarSummary(calendar)
  )
})

const { data: relatedDistricts } = await useAsyncData(`related-districts:${slug}`, async () => {
  if (isStatePage || !district.value?.relatedDistricts?.length) return []
  const relatedSlugs = new Set((district.value.relatedDistricts as { slug: string }[]).map(rd => rd.slug))
  const districts = await queryCollection('districts').order('name', 'ASC').all()
  return (districts ?? [])
    .filter(d => relatedSlugs.has(d.slug))
    .map(toDistrictSummary)
})

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
  const hasStateContent = !!statePageData.value
  const stateTitle = hasStateContent
    ? (statePageData.value.seoTitle ?? `${matchedStateName} School Calendar ${stateCurrentYear} | Holidays, Breaks & District Dates | MySchoolDates`)
    : `${matchedStateName} School Calendars ${stateCurrentYear} | MySchoolDates`
  const stateDesc = hasStateContent
    ? (statePageData.value.seoDescription ?? `Find ${matchedStateName} public school calendar dates for ${stateCurrentYear}, including start dates, holidays, breaks, district schedules, PDFs, and downloads. Verified from official sources.`)
    : `${stateCurrentYear} school calendar dates sourced from official district websites for ${stateDistricts.length} public school district${stateDistricts.length !== 1 ? 's' : ''} in ${matchedStateName}. First day of school, spring break, winter break, and all important dates.`
  const stateUrl = `https://myschooldates.com/${slug}`
  const stateDistrictListEntity = {
    '@context': 'https://schema.org',
    '@id': `${stateUrl}#district-list`,
    '@type': 'ItemList',
    name: stateDistricts.length === 1
      ? `Verified ${matchedStateName} District Calendars — ${stateCurrentYear}`
      : `Verified ${matchedStateName} Public School District Calendars — ${stateCurrentYear}`,
    description: stateDistricts.length === 1
      ? `Verified ${stateCurrentYear} school calendar page currently available for ${stateDistricts[0].name} in ${matchedStateName}. Additional ${matchedStateName} district calendar pages are added after official-source data is verified.`
      : hasStateContent
      ? `${matchedStateName} public school district calendar links for ${stateCurrentYear}, with official-source calendar pages, first day, breaks, holidays, and download options where available.`
      : `${stateCurrentYear} school calendar dates sourced from official district websites for ${stateDistricts.length} public school districts in ${matchedStateName}.`,
    ...(hasStateContent && stateDistricts.length < 2 ? {} : { numberOfItems: stateDistricts.length }),
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
  }
  const stateSchemaGraph: any[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myschooldates.com' },
        { '@type': 'ListItem', position: 2, name: `${matchedStateName} School Calendars`, item: stateUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': ['WebPage', 'CollectionPage'],
      name: `${matchedStateName} School Calendar ${stateCurrentYear}`,
      url: stateUrl,
      description: stateDesc,
      ...(statePageData.value?.lastVerifiedAt ? { dateModified: statePageData.value.lastVerifiedAt } : {}),
      mainEntity: { '@id': `${stateUrl}#district-list` },
      publisher: {
        '@type': 'Organization',
        name: 'MySchoolDates',
        url: 'https://myschooldates.com',
      },
      reviewedBy: {
        '@type': 'Organization',
        name: 'MySchoolDates Calendar Research Team',
        url: 'https://myschooldates.com/calendar-verification-methodology',
      },
      isPartOf: {
        '@type': 'WebSite',
        name: 'MySchoolDates',
        url: 'https://myschooldates.com',
      },
      about: {
        '@type': 'AdministrativeArea',
        name: matchedStateName,
        address: {
          '@type': 'PostalAddress',
          addressRegion: statePageData.value?.stateCode ?? matchedStateName,
          addressCountry: 'US',
        },
      },
    },
    stateDistrictListEntity,
  ]
  if (statePageData.value?.faqs?.length) {
    stateSchemaGraph.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: statePageData.value.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    })
  }
  useSeoMeta({ title: stateTitle, description: stateDesc })
  useHead({
    link: [{ rel: 'canonical', href: stateUrl }],
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify(stateSchemaGraph),
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

const stateDistrictCalendarById = computed(() => {
  const result: Record<string, any> = {}
  for (const c of stateCals.value ?? []) result[c.institutionId] = c
  return result
})

const statePdfSectionId = computed(() =>
  (statePageData.value?.stateSections ?? []).find((section: any) => section.id?.includes('pdf'))?.id ?? null
)

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
  const relatedIds = (relatedDistricts.value ?? [])
    .filter(d => relatedSlugs.has(d.slug))
    .map(d => d.institutionId)
  if (!relatedIds.length) return []
  const all = await queryCollection('calendars').all()
  const year = district.value.currentSchoolYear
  return (all ?? [])
    .filter(c => relatedIds.includes(c.institutionId) && c.schoolYear === year)
    .map(toComparisonCalendarSummary)
})
const relatedYearAvailableSlugs = computed(() => {
  const districts = relatedDistricts.value ?? []
  return (relatedCals.value ?? [])
    .map((relatedCal: any) => districts.find((d: any) => d.institutionId === relatedCal.institutionId)?.slug)
    .filter(Boolean) as string[]
})

// ── District page logic ────────────────────────────────────────────────────
const currentYear = district.value?.currentSchoolYear ?? ''
const cal = allCals.value?.find(y => y.schoolYear === currentYear) ?? null
const meta = district

function removeHiddenCustomSections() {
  if (isStatePage || !district.value || !cal) return
  const hiddenIds = new Set([
    ...(((district.value as any)?.hiddenCustomSectionIds ?? (district.value as any)?.meta?.hiddenCustomSectionIds ?? []) as string[]),
    ...(((cal as any)?.hiddenCustomSectionIds ?? (cal as any)?.meta?.hiddenCustomSectionIds ?? []) as string[]),
  ])
  if (!hiddenIds.size) return
  if ((district.value as any)?.customSections) {
    ;(district.value as any).customSections = ((district.value as any).customSections as DistrictCustomSection[]).filter(section => !hiddenIds.has(section.id))
  }
  if ((district.value as any)?.meta?.customSections) {
    ;(district.value as any).meta.customSections = ((district.value as any).meta.customSections as DistrictCustomSection[]).filter(section => !hiddenIds.has(section.id))
  }
  if ((cal as any)?.customSections) {
    ;(cal as any).customSections = ((cal as any).customSections as DistrictCustomSection[]).filter(section => !hiddenIds.has(section.id))
  }
  if ((cal as any)?.meta?.customSections) {
    ;(cal as any).meta.customSections = ((cal as any).meta.customSections as DistrictCustomSection[]).filter(section => !hiddenIds.has(section.id))
  }
}
removeHiddenCustomSections()

function eventSchemaLocation() {
  return {
    '@type': 'Place',
    name: `${meta.value!.name} districtwide calendar`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: meta.value!.city ?? '',
      addressRegion: (meta.value as any).stateCode ?? meta.value!.state,
      addressCountry: meta.value!.country ?? 'US',
    },
  }
}
const calendarIcsHref = computed(() =>
  district.value && cal
    ? `/calendars/${district.value.slug}-${cal.schoolYear}.ics`
    : ''
)

function resolveCalendarHref(href?: string, url?: string) {
  if (!cal) return ''
  const raw = href ?? url ?? ''
  if (raw === '__sourcePdfUrl') return (cal as any).sourcePdfUrl ?? (cal as any).printablePdfUrl ?? ''
  if (raw === '__icsUrl') return calendarIcsHref.value
  return raw
}

const heroCtas = computed(() => {
  if (!cal || !district.value) return []
  const configured = (((cal as any).heroCtas ?? (cal as any).meta?.heroCtas ?? []) as Array<{
    label?: string
    href?: string
    url?: string
    variant?: 'primary' | 'secondary'
    download?: boolean
    filename?: string
  }>)

  return configured
    .map((cta, index) => {
      const href = resolveCalendarHref(cta.href, cta.url)
      const filename = cta.filename === '__icsFilename'
        ? `${district.value!.slug}-${cal.schoolYear}.ics`
        : cta.filename

      return {
        key: `${cta.label ?? 'hero-cta'}-${index}`,
        label: cta.label ?? '',
        href,
        variant: cta.variant ?? (index === 0 ? 'primary' : 'secondary'),
        download: Boolean(cta.download),
        filename,
      }
    })
    .filter(cta => cta.label && cta.href)
})

const heroLinks = computed(() => {
  if (!cal) return []
  const configured = (((cal as any).heroLinks ?? (cal as any).meta?.heroLinks ?? []) as Array<{ label?: string; href?: string; url?: string }>)
  return configured
    .map((link, index) => {
      const href = resolveCalendarHref(link.href, link.url)
      return {
        key: `${link.label ?? 'hero-link'}-${index}`,
        label: link.label ?? '',
        href,
        isExternal: href.startsWith('http'),
      }
    })
    .filter(link => link.label && link.href)
})

const keyDateShortcuts = computed(() => {
  if (!cal) return []
  const configured = (((cal as any).keyDateShortcuts ?? (cal as any).meta?.keyDateShortcuts ?? []) as Array<{ label?: string; href?: string; url?: string }>)
  return configured
    .map((link, index) => {
      const href = resolveCalendarHref(link.href, link.url)
      return {
        key: `${link.label ?? 'key-date-shortcut'}-${index}`,
        label: link.label ?? '',
        href,
        isExternal: href.startsWith('http'),
      }
    })
    .filter(link => link.label && link.href)
})

const archivedYears = computed(() => {
  const years = (allCals.value ?? []).filter(y => y.schoolYear !== currentYear).map(y => y.schoolYear)
  const sortMode = (cal as any)?.yearSwitcherSort ?? (cal as any)?.meta?.yearSwitcherSort
  if (sortMode === 'asc') return years.sort()
  if (sortMode === 'desc') return years.sort().reverse()
  return years
})
const yearSwitcherPosition = computed(() =>
  (cal as any)?.yearSwitcherPosition ?? (cal as any)?.meta?.yearSwitcherPosition ?? 'default'
)
const showYearSwitcherAfterKeyDates = computed(() => yearSwitcherPosition.value === 'afterKeyDates')
const showYearSwitcherAfterSources = computed(() => yearSwitcherPosition.value === 'afterSources')
const today = new Date(); today.setHours(0, 0, 0, 0)
const breaks = computed(() => getBreaks(cal?.events ?? []))

const keyDateHighlights = computed(() => {
  if (!cal?.events) return []
  const configured = (((cal as any).keyDateSummaryItems ?? (cal as any).meta?.keyDateSummaryItems ?? []) as any[])
  if (configured.length) {
    return configured
      .filter(item => item.date || item.start)
      .map(item => ({
        date: item.date ?? item.start,
        endDate: item.endDate ?? item.end,
        name: item.name,
        displayDate: item.displayDate,
        displayName: item.displayName,
        label: item.label,
        type: item.type ?? 'milestone',
        description: item.description,
        schemaDescription: item.schemaDescription,
        dates: item.dates,
        dateDisplayMode: item.dateDisplayMode,
        dateJoiner: item.dateJoiner,
        repeatMonthInDateList: item.repeatMonthInDateList,
        datePropertyLabel: item.datePropertyLabel,
        schemaAdditionalProperties: item.schemaAdditionalProperties,
        additionalProperties: item.additionalProperties,
      }))
  }
  const HIGHLIGHT_TYPES = new Set(['school_start', 'school_end', 'break_start'])
  return cal.events.filter(e => HIGHLIGHT_TYPES.has(e.type) || (e as any).schemaEvent === true)
})

const itemListEvents = computed(() => {
  if (!cal?.events) return []
  if ((cal as any).itemListMode === 'allImportantDates') {
    return cal.events.filter(event => event.type !== 'break_end')
  }
  return keyDateHighlights.value
})

function keyDateLabel(event: { type: string; label?: string }) {
  if (event.label) return event.label
  if (event.type === 'break_start') return 'Break'
  if (event.type === 'milestone') return 'First Day'
  return eventTypeLabel[event.type]
}

function keyDateDisplayName(event: { name: string; type: string; displayName?: string }) {
  if (event.displayName) return event.displayName
  if (event.type === 'break_start' || event.type === 'break_end') {
    return event.name
      .replace(/\b(Begins|Begin|Starts|Start|Ends|End)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
  }
  return event.name
}
function keyDateSchemaDescription(event: any) {
  if (event.schemaDescription) return event.schemaDescription
  if (event.description) return event.description
  const districtLabel = meta.value!.shortName || meta.value!.name
  const eventName = keyDateDisplayName(event)
  if (event.type === 'school_start') {
    if (/\b(open|opens)\b/i.test(eventName) && /grades?\s*1\s*[–-]\s*12/i.test(eventName)) {
      return 'Schools are open for grades 1–12 beginning this date.'
    }
    return `The first day of classes for ${districtLabel} students in the ${displaySchoolYear.value} school year.`
  }
  if (event.type === 'school_end') {
    return `The last day of classes for ${districtLabel} students in the ${displaySchoolYear.value} school year.`
  }
  if (event.type === 'break_start') {
    const schoolBreak = breaks.value.find((b: any) => b.name === event.name && b.start === event.date)
    if (schoolBreak?.end) {
      const rangeVerb = /\bholidays\b/i.test(eventName) ? 'run' : 'runs'
      return `${districtLabel} ${eventName} ${rangeVerb} ${formatCompactDateRange(event.date, schoolBreak.end)}.`
    }
    return `${districtLabel} ${eventName} in the ${displaySchoolYear.value} school year.`
  }
  return `${eventName} on the ${districtLabel} ${displaySchoolYear.value} calendar.`
}

function compactJoinedDate(startDate: string, endDate: string, joiner: string) {
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    const month = start.toLocaleDateString('en-US', { month: 'short' })
    return `${month} ${start.getDate()} ${joiner} ${end.getDate()}, ${start.getFullYear()}`
  }
  return `${formatShortDate(startDate)} ${joiner} ${formatShortDate(endDate)}`
}

function keyDateListDates(event: any) {
  if (Array.isArray(event.dates) && event.dates.length) return event.dates
  if (event.dateDisplayMode === 'list' && event.endDate) return [event.date, event.endDate]
  return []
}
function keyDateUsesPlainText(event: any) {
  return Boolean(event.displayDate && keyDateListDates(event).length > 1)
}

function keyDateListDateParts(event: any) {
  if (event.displayDate && !event.repeatMonthInDateList) {
    return [{ date: event.date, label: event.displayDate, ariaLabel: event.displayDate }]
  }
  const dates = keyDateListDates(event)
  if (!dates.length) return []
  if (dates.length === 2) {
    const start = new Date(dates[0] + 'T00:00:00')
    const end = new Date(dates[1] + 'T00:00:00')
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      const month = start.toLocaleDateString('en-US', { month: 'short' })
      return [
        { date: dates[0], label: `${month} ${start.getDate()}`, ariaLabel: formatDate(dates[0]) },
        { date: dates[1], label: `${event.repeatMonthInDateList ? `${month} ` : ''}${end.getDate()}, ${end.getFullYear()}`, ariaLabel: formatDate(dates[1]) },
      ]
    }
  }
  return dates.map((date: string) => ({ date, label: formatShortDate(date), ariaLabel: formatDate(date) }))
}

function keyDateDisplayDate(event: any) {
  if (event.endDate && event.dateJoiner) return compactJoinedDate(event.date, event.endDate, event.dateJoiner)
  if (event.type !== 'break_start') return formatShortDate(event.date)
  const match = breaks.value.find(b => b.name === event.name && b.start === event.date)
  if (!match) return formatShortDate(event.date)
  return `${formatShortDate(match.start)} – ${formatShortDate(match.end)}`
}

function keyDateRange(event: { date: string; name: string; type: string; endDate?: string }) {
  if (event.endDate) return { start: event.date, end: event.endDate }
  if (event.type !== 'break_start') return { start: event.date, end: event.date }
  const match = breaks.value.find(b => b.name === event.name && b.start === event.date)
  return { start: event.date, end: match?.end ?? event.date }
}

function keyDateSchemaProperties(event: any) {
  const extraProperties = ((event.schemaAdditionalProperties ?? event.additionalProperties ?? []) as any[])
    .filter(prop => prop?.name && prop?.value)
    .map(prop => ({
      '@type': 'PropertyValue',
      name: prop.name,
      value: prop.value,
    }))
  const dates = keyDateListDates(event)
  if (dates.length) {
    if (extraProperties.length && !event.datePropertyLabel) {
      return extraProperties
    }
    return dates.map((date: string) => ({
      '@type': 'PropertyValue',
      name: event.datePropertyLabel ?? 'Opening date',
      value: date,
    })).concat(extraProperties)
  }
  if (extraProperties.length && !event.datePropertyLabel) {
    return extraProperties
  }
  const range = keyDateRange(event)
  if (range.start === range.end) {
    return [
      { '@type': 'PropertyValue', name: 'Date', value: range.start },
      ...extraProperties,
    ]
  }
  return [
    { '@type': 'PropertyValue', name: 'Start date', value: range.start },
    { '@type': 'PropertyValue', name: 'End date', value: range.end },
    ...extraProperties,
  ]
}

const calendarSummary = computed(() => {
  if (!cal || !district.value) return ''
  const customSummary = (cal as any).heroSummary ?? (cal as any).meta?.heroSummary
  if (customSummary) return customSummary
  const springBreak = breaks.value.find(b => b.name.toLowerCase().includes('spring'))
  const schoolEndEvent = cal.events?.find((e: any) => e.type === 'school_end')
  const lastDayNote = schoolEndEvent?.name?.toLowerCase().includes('early')
    ? ', with early release'
    : ''
  const springPart = springBreak
    ? (() => {
      const returnEvent = cal.events?.find((e: any) =>
        ['school_resume', 'school_reopen'].includes(e.type) && e.date > springBreak.end
      )
      const returnPart = returnEvent ? `, with students returning ${formatShortDate(returnEvent.date)}` : ''
      return ` Spring Break runs ${formatShortDate(springBreak.start)}–${formatShortDate(springBreak.end)}${returnPart}.`
    })()
    : ''
  const shortName = district.value.shortName && !district.value.name.includes(district.value.shortName)
    ? `, also known as ${district.value.shortName},`
    : ''
  return `${district.value.name}${shortName} begins the ${currentYear} school year on ${formatDate(cal.firstDay)}. The final day is ${formatDate(cal.lastDay)}${lastDayNote}.${springPart}`
})
const calendarSummaryParagraphs = computed(() =>
  calendarSummary.value
    .split(/\n{2,}/)
    .map(part => part.trim())
    .filter(Boolean)
)

function normalizeFaqQuestion(question: string) {
  return question.trim().toLowerCase().replace(/\s+/g, ' ')
}

function dedupeFaqItems(items: { q: string; a: string }[]) {
  const seen = new Set<string>()
  return items.filter((faq) => {
    const key = normalizeFaqQuestion(faq.q)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function dedupeQuestions(questions: string[]) {
  const seen = new Set<string>()
  return questions.filter((question) => {
    const key = normalizeFaqQuestion(question)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const allFaqs = computed(() => {
  if (!cal || !district.value) return []
  const specificFaqs: { q: string; a: string }[] = (district.value as any).districtFaqs ?? []
  const calendarFaqs: { q: string; a: string }[] = (cal as any).calendarFaqs ?? []
  const prefersCalendarFirst = (cal as any).faqOrderLimit ?? (cal as any).meta?.faqOrderLimit ?? (district.value as any).faqOrderLimit ?? (district.value as any).meta?.faqOrderLimit ?? (cal as any).faqLimit ?? (cal as any).meta?.faqLimit ?? (district.value as any).faqLimit ?? (district.value as any).meta?.faqLimit
  if (typeof prefersCalendarFirst === 'number' && prefersCalendarFirst > 0) {
    return dedupeFaqItems([...calendarFaqs, ...specificFaqs])
  }
  return dedupeFaqItems([...specificFaqs, ...calendarFaqs])
})
const faqs = computed(() => {
  const displayQuestions = dedupeQuestions([
    ...(((district.value as any)?.faqDisplayQuestions ?? (district.value as any)?.meta?.faqDisplayQuestions ?? []) as string[]),
    ...(((cal as any)?.faqDisplayQuestions ?? (cal as any)?.meta?.faqDisplayQuestions ?? []) as string[]),
  ])
  if (displayQuestions.length) {
    return dedupeFaqItems(displayQuestions
      .map(q => allFaqs.value.find(item => normalizeFaqQuestion(item.q) === normalizeFaqQuestion(q)))
      .filter(Boolean) as { q: string; a: string }[])
  }
  const displayLimit = (cal as any)?.faqDisplayLimit ?? (cal as any)?.meta?.faqDisplayLimit ?? (district.value as any)?.faqDisplayLimit ?? (district.value as any)?.meta?.faqDisplayLimit ?? (cal as any)?.faqLimit ?? (cal as any)?.meta?.faqLimit ?? (district.value as any)?.faqLimit ?? (district.value as any)?.meta?.faqLimit
  if (typeof displayLimit === 'number' && displayLimit > 0) {
    return allFaqs.value.slice(0, displayLimit)
  }
  return allFaqs.value
})
const faqSchemaItems = computed(() => {
  if ((cal as any)?.hideFaqSchema || (cal as any)?.meta?.hideFaqSchema || (district.value as any)?.hideFaqSchema || (district.value as any)?.meta?.hideFaqSchema) return []
  const limit = (cal as any)?.faqSchemaLimit ?? (cal as any)?.meta?.faqSchemaLimit ?? (district.value as any)?.faqSchemaLimit ?? (district.value as any)?.meta?.faqSchemaLimit
  const includeQuestions = dedupeQuestions([
    ...(((district.value as any)?.faqSchemaQuestions ?? (district.value as any)?.meta?.faqSchemaQuestions ?? []) as string[]),
    ...(((cal as any)?.faqSchemaQuestions ?? (cal as any)?.meta?.faqSchemaQuestions ?? []) as string[]),
  ])
  const excludes = [
    ...(((district.value as any)?.faqSchemaExclude ?? (district.value as any)?.meta?.faqSchemaExclude ?? []) as string[]),
    ...(((cal as any)?.faqSchemaExclude ?? (cal as any)?.meta?.faqSchemaExclude ?? []) as string[]),
  ].map(item => item.toLowerCase())
  const includedCandidates = includeQuestions.length
    ? faqs.value.filter(item => includeQuestions.some(q => normalizeFaqQuestion(q) === normalizeFaqQuestion(item.q)))
    : allFaqs.value
  const visibleQuestionKeys = new Set(faqs.value.map(item => normalizeFaqQuestion(item.q)))
  const visibleCandidates = dedupeFaqItems(includedCandidates.filter(item => visibleQuestionKeys.has(normalizeFaqQuestion(item.q))))
  const candidates = excludes.length
    ? visibleCandidates.filter(item => !excludes.some(exclude => item.q.toLowerCase().includes(exclude)))
    : visibleCandidates
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

const hiddenSections = computed(() => new Set<string>([
  ...(((district.value as any).hiddenSections ?? []) as string[]),
  ...(((cal as any)?.hiddenSections ?? (cal as any)?.meta?.hiddenSections ?? []) as string[]),
]))
const comparisonBeforeFaq = computed(() =>
  Boolean((cal as any)?.comparisonBeforeFaq ?? (cal as any)?.meta?.comparisonBeforeFaq ?? (district.value as any)?.comparisonBeforeFaq ?? (district.value as any)?.meta?.comparisonBeforeFaq)
)
const sourcesBeforeFaq = computed(() =>
  Boolean((cal as any)?.sourcesBeforeFaq ?? (cal as any)?.meta?.sourcesBeforeFaq ?? (district.value as any)?.sourcesBeforeFaq ?? (district.value as any)?.meta?.sourcesBeforeFaq)
)
const pageSources = computed(() =>
  ((cal as any)?.sources ?? (cal as any)?.meta?.sources ?? (district.value as any)?.sources ?? []) as any[]
)
const displaySchoolYear = computed(() =>
  (cal as any)?.displaySchoolYear ?? (cal as any)?.meta?.displaySchoolYear ?? currentYear
)
function displaySchoolYearLabel(yearValue: string) {
  const match = yearValue.match(/^(\d{4})-(\d{4})$/)
  return match ? `${match[1]}–${match[2]!.slice(2)}` : yearValue
}
const hideHeroVerificationProcess = computed(() =>
  Boolean(slug === 'chicago-public-schools-calendar' || (district.value as any).hideHeroVerificationProcess || (meta.value as any).hideHeroVerificationProcess || (cal as any)?.hideHeroVerificationProcess || (cal as any)?.meta?.hideHeroVerificationProcess)
)
const verificationBadgeText = computed(() =>
  (cal as any)?.verificationBadgeText ?? (cal as any)?.meta?.verificationBadgeText ?? (district.value as any)?.verificationBadgeText ?? (district.value as any)?.meta?.verificationBadgeText ?? null
)
type DistrictCustomSection = {
  id: string
  label: string
  content: string
  position?: string
  collapsible?: boolean
  defaultOpen?: boolean
  image?: { src: string; alt: string; caption?: string; width?: number; height?: number }
  groups?: { label: string; items: string[] }[]
  definitions?: { term: string; description: string }[]
  links?: { label: string; to: string; description?: string }[]
  table?: { caption?: string; columns?: string[]; headers?: string[]; rows: string[][]; footnote?: string }
}
const customSections = computed(() => {
  const hiddenIds = new Set([
    ...(((district.value as any).hiddenCustomSectionIds ?? (district.value as any).meta?.hiddenCustomSectionIds ?? []) as string[]),
    ...(((cal as any)?.hiddenCustomSectionIds ?? (cal as any)?.meta?.hiddenCustomSectionIds ?? []) as string[]),
  ])
  return [
    ...(((district.value as any).customSections ?? []) as DistrictCustomSection[]),
    ...(((cal as any)?.customSections ?? []) as DistrictCustomSection[]),
    ...(((cal as any)?.meta?.customSections ?? []) as DistrictCustomSection[]),
  ].filter(section => !hiddenIds.has(section.id))
})
const hasYearComparisonContent = computed(() =>
  !hiddenSections.value.has('whatsDifferent') ||
  customSections.value.some(section => section.position === 'afterYearDiff')
)
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
const audienceSectionId = computed(() => {
  const section = customSections.value.find(s => {
    const text = `${s.id} ${s.label}`.toLowerCase()
    return text.includes('who-uses') || text.includes('who uses') || text.includes('applies to')
  })
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
const highlightsSectionId = computed(() => {
  const section = customSections.value.find(s => {
    const text = `${s.id} ${s.label}`.toLowerCase()
    return text.includes('highlight')
  })
  return section?.id
})
const termsSectionId = computed(() => {
  const section = customSections.value.find(s => {
    const text = `${s.id} ${s.label}`.toLowerCase()
    return text.includes('term') || text.includes('glossary')
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
  if (hiddenSections.value.has('planningTips')) return undefined
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
const calendarTrackHelpId = computed(() => {
  const section = customSections.value.find(s =>
    s.id.toLowerCase().includes('calendar-track') ||
    s.label.toLowerCase().includes('calendar track') ||
    s.label.toLowerCase().includes('calendar type')
  )
  return section?.id || (((cal as any)?.alternateCalendars?.length) ? 'other-calendars' : 'sources')
})
const hasCalendarTrackCaution = computed(() => {
  if ((cal as any)?.hideCalendarTrackCaution || (cal as any)?.meta?.hideCalendarTrackCaution) return false
  const text = `${(cal as any)?.calendarNotes ?? ''} ${(district.value as any)?.districtFact ?? ''}`.toLowerCase()
  return text.includes('track') || text.includes('modified traditional') || text.includes('year-round')
})
const calendarTrackLabel = computed(() => {
  const type = String((cal as any)?.calendarType ?? '').replace(/[_-]+/g, ' ')
  return type ? type.replace(/\b\w/g, c => c.toUpperCase()) : 'Student'
})
const calendarShownLabel = computed(() =>
  String((cal as any)?.calendarShownLabel ?? (cal as any)?.meta?.calendarShownLabel ?? `${district.value?.shortName || district.value?.name} ${calendarTrackLabel.value} Calendar`)
)
const calendarShownDescription = computed(() =>
  String((cal as any)?.calendarShownDescription ?? (cal as any)?.meta?.calendarShownDescription ?? 'Other calendar tracks or specialized programs may use different dates. Check your school\'s assigned calendar before making plans.')
)
const calendarSelectorGroups = computed(() =>
  (((cal as any)?.calendarSelectorGroups ?? (cal as any)?.meta?.calendarSelectorGroups ?? []) as Array<{ label?: string, items?: string[] }>).filter(group => group.label && Array.isArray(group.items) && group.items.length)
)
const alternateCalendarsNotice = computed(() =>
  String((cal as any)?.alternateCalendarsNotice ?? (cal as any)?.meta?.alternateCalendarsNotice ?? '')
)
const alternateCalendarsNoticeLinkLabel = computed(() =>
  String((cal as any)?.alternateCalendarsNoticeLinkLabel ?? (cal as any)?.meta?.alternateCalendarsNoticeLinkLabel ?? '')
)
const alternateCalendarsNoticeLinkHref = computed(() =>
  String((cal as any)?.alternateCalendarsNoticeLinkHref ?? (cal as any)?.meta?.alternateCalendarsNoticeLinkHref ?? '#other-calendars')
)
const alternateCalendarsNoticeLinks = computed(() =>
  (((cal as any)?.alternateCalendarsNoticeLinks ?? (cal as any)?.meta?.alternateCalendarsNoticeLinks ?? []) as Array<{ label?: string; href?: string; url?: string }>)
    .map(link => ({ label: String(link.label ?? ''), href: String(link.href ?? link.url ?? '') }))
    .filter(link => link.label && link.href)
)
const hideAlternateCalendarsNotice = computed(() =>
  Boolean((cal as any)?.hideAlternateCalendarsNotice ?? (cal as any)?.meta?.hideAlternateCalendarsNotice)
)
const customJumpNavigation = computed(() =>
  (((cal as any)?.jumpNavigation ?? (cal as any)?.meta?.jumpNavigation ?? []) as Array<{ label?: string, href?: string, id?: string }>).filter(item => item.label && (item.href || item.id))
)
const yearSwitcherLabel = computed(() =>
  String((cal as any)?.yearSwitcherLabel ?? (cal as any)?.meta?.yearSwitcherLabel ?? 'Other school years:')
)
const otherCalendarsAfterKeyDates = computed(() =>
  ((cal as any)?.otherCalendarsPosition ?? (cal as any)?.meta?.otherCalendarsPosition) === 'afterKeyDates'
)
const otherCalendarsAfterFaq = computed(() =>
  ((cal as any)?.otherCalendarsPosition ?? (cal as any)?.meta?.otherCalendarsPosition) === 'afterFaq'
)
const otherCalendarsBeforeCalendarExport = computed(() =>
  ((cal as any)?.otherCalendarsPosition ?? (cal as any)?.meta?.otherCalendarsPosition) === 'beforeCalendarExport'
)

const secondSemStart = computed(() => cal ? getSecondSemesterStart(cal.events) : '')
const showSemesterCount = computed(() => (cal as any)?.hideSemesterCount !== true && typeof (cal as any)?.semesters === 'number')
const hideSecondSemesterStartSummary = computed(() =>
  (cal as any)?.hideSecondSemesterStartSummary === true ||
  (cal as any)?.meta?.hideSecondSemesterStartSummary === true
)
const heroFactChips = computed(() =>
  (((cal as any)?.heroFactChips ?? (cal as any)?.meta?.heroFactChips ?? []) as string[]).filter(Boolean)
)
const heroQuickDates = computed(() =>
  (((cal as any)?.heroQuickDates ?? (cal as any)?.meta?.heroQuickDates ?? []) as Array<{ label?: string, value?: string }>).filter(item => item.label && item.value)
)
const breaksTitle = computed(() =>
  (cal as any)?.breaksTitle ?? (cal as any)?.meta?.breaksTitle ?? 'Major School Breaks'
)
const hideBreakDurationBadges = computed(() =>
  Boolean((cal as any)?.hideBreakDurationBadges ?? (cal as any)?.meta?.hideBreakDurationBadges)
)
const breakNotes = computed<Record<string, string>>(() =>
  ((cal as any)?.breakNotes ?? (cal as any)?.meta?.breakNotes ?? {}) as Record<string, string>
)
const breakDurationLabels = computed<Record<string, string>>(() =>
  ((cal as any)?.breakDurationLabels ?? (cal as any)?.meta?.breakDurationLabels ?? {}) as Record<string, string>
)
const winterBreakLabel = computed(() => {
  const isLateDecemberBreak = (schoolBreak: { name: string; start?: string; end?: string }) => {
    const lower = schoolBreak.name.toLowerCase()
    const startMonth = schoolBreak.start ? new Date(`${schoolBreak.start}T00:00:00`).getMonth() : -1
    const endMonth = schoolBreak.end ? new Date(`${schoolBreak.end}T00:00:00`).getMonth() : -1
    const isDecemberWindow = startMonth === 11 || endMonth === 0
    return lower.includes('winter') ||
      lower.includes('christmas') ||
      lower.includes('december') ||
      (lower.includes('holiday') && isDecemberWindow)
  }
  const winterBreak = breaks.value.find(b =>
    isLateDecemberBreak(b)
  )
  return winterBreak
    ? winterBreak.name.replace(/\b(Begins|Starts|Begin|Start)\b/gi, '').replace(/\s+/g, ' ').trim()
    : 'Winter Break'
})

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
  const customLabel = breakDurationLabels.value[b.name] ?? breakDurationLabels.value[breakDisplayName(b.name)] ?? breakDurationLabels.value[b.start]
  if (customLabel) return customLabel
  const weekdays = countWeekdays(b.start, b.end)
  if (weekdays === b.days) {
    return `${weekdays} weekday${weekdays !== 1 ? 's' : ''} without school`
  }
  return `${weekdays} weekday${weekdays !== 1 ? 's' : ''} without school · ${b.days} calendar day${b.days !== 1 ? 's' : ''} total`
}

function breakDisplayName(name: string) {
  return name
    .replace(/\b(Begins|Starts|Begin|Start|Ends|End)\b/gi, '')
    .replace(/\s*-\s*(Schools and Offices Closed|Good Friday|New Year's Day)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}
function breakNoteFor(b: { name: string; start: string; end: string }) {
  return breakNotes.value[b.name] ?? breakNotes.value[breakDisplayName(b.name)] ?? breakNotes.value[b.start] ?? ''
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
type MidSection = 'about' | 'upcoming'
const midSectionOrder = computed((): MidSection[] => {
  // Upcoming Dates removed — covered by AllDates table below, reduces date repetition
  return ['about']
})

// Data quality: estimated when no lastVerifiedAt is set
const isEstimated = computed(() => !cal?.lastVerifiedAt)
const verifiedDate = computed(() => {
  if (!cal?.lastVerifiedAt) return null
  return new Date(cal.lastVerifiedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
})
const updatedDate = computed(() => {
  const date = (cal as any)?.dateModified ?? cal?.lastVerifiedAt
  if (!date) return null
  return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
})
function formatCompactDateRange(start: string, end: string) {
  const startDate = new Date(start + 'T00:00:00')
  const endDate = new Date(end + 'T00:00:00')
  const sameYear = startDate.getFullYear() === endDate.getFullYear()
  const sameMonth = sameYear && startDate.getMonth() === endDate.getMonth()
  if (sameMonth) {
    return `${startDate.toLocaleString('en-US', { month: 'short' })} ${startDate.getDate()}–${endDate.getDate()}, ${endDate.getFullYear()}`
  }
  if (sameYear) {
    return `${startDate.toLocaleString('en-US', { month: 'short' })} ${startDate.getDate()}–${endDate.toLocaleString('en-US', { month: 'short' })} ${endDate.getDate()}, ${endDate.getFullYear()}`
  }
  return `${formatShortDate(start)}–${formatShortDate(end)}`
}
const editorialAuthorName = 'Denis Dou'

const prevYear = computed(() => {
  const [y1, y2] = currentYear.split('-').map(Number)
  return `${y1 - 1}-${y2 - 1}`
})
const prevCal = computed(() => allCals.value?.find(c => c.schoolYear === prevYear.value) ?? null)

const allDatesMode = computed(() => {
  const mode = (cal as any)?.allDatesMode ?? (cal as any)?.meta?.allDatesMode ?? (district.value as any)?.allDatesMode
  return (mode === 'keyDates' ? 'keyDates' : 'all') as 'all' | 'keyDates'
})
const allDatesSourceLinks = computed(() =>
  (((cal as any)?.allDatesSourceLinks ?? (cal as any)?.meta?.allDatesSourceLinks ?? []) as { label: string; url: string }[])
    .filter(source => source?.label && source?.url)
)
const allDatesIncludedDatesInKeyDates = computed(() =>
  (((cal as any)?.allDatesIncludedDatesInKeyDates ?? (cal as any)?.meta?.allDatesIncludedDatesInKeyDates ?? []) as string[])
)
const allDatesTitle = computed(() =>
  (cal as any)?.allDatesTitle ?? (cal as any)?.meta?.allDatesTitle ?? (district.value as any)?.allDatesTitle ?? (district.value as any)?.meta?.allDatesTitle ?? (
    allDatesMode.value === 'keyDates'
    ? `Major Student Calendar Dates — ${displaySchoolYear.value}`
    : `All Important Dates — ${displaySchoolYear.value}`
  )
)
const keyDatesSummaryTitle = computed(() =>
  (cal as any)?.keyDatesSummaryTitle ?? (cal as any)?.meta?.keyDatesSummaryTitle ?? `${displaySchoolYear.value} Key Dates & Holidays`
)
const keyDatesSummarySubtitle = computed(() =>
  (cal as any)?.keyDatesSummarySubtitle ?? (cal as any)?.meta?.keyDatesSummarySubtitle ?? 'First day, last day, school holidays, and major break ranges'
)

const dateLabelOverrides = computed(() =>
  ((cal as any)?.dateLegendLabelOverrides ?? (cal as any)?.meta?.dateLegendLabelOverrides ?? (district.value as any)?.dateLegendLabelOverrides ?? (district.value as any)?.meta?.dateLegendLabelOverrides ?? {}) as Record<string, string>
)
const dateLegendExtraItems = computed(() =>
  (((cal as any)?.dateLegendExtraItems ?? (cal as any)?.meta?.dateLegendExtraItems ?? []) as Array<{ label?: string, dot?: string }>)
    .filter(item => item.label && item.dot) as Array<{ label: string, dot: string }>
)
const configuredDateLegendItems = computed(() =>
  (((cal as any)?.dateLegendItems ?? (cal as any)?.meta?.dateLegendItems ?? []) as Array<{ label?: string, dot?: string }>)
    .filter(item => item.label && item.dot) as Array<{ label: string, dot: string }>
)
const dateLegend = computed(() => {
  if ((cal as any)?.hideDateLegend === true || (cal as any)?.meta?.hideDateLegend === true) return []
  if (configuredDateLegendItems.value.length) return configuredDateLegendItems.value
  const legendTypes = new Set((cal?.events ?? []).map((event: any) => event.labelType ?? event.type))
  const hasEventType = (types: string[]) =>
    types.some(type => legendTypes.has(type))
  const hasPossibleMakeupDay = (cal?.events ?? []).some((event: any) => {
    const name = String(event.name ?? '').toLowerCase()
    return name.includes('possible') && (name.includes('make-up') || name.includes('makeup'))
  })
  const items = [
    ...(hasEventType(['schools_offices_closed']) ? [{ label: 'Schools & Offices Closed', dot: 'bg-red-400' }] : []),
    ...(hasEventType(['schools_closed']) ? [{ label: 'Schools Closed', dot: 'bg-red-300' }] : []),
    ...(hasEventType(['holiday']) ? [{ label: 'Holiday', dot: 'bg-teal-400' }] : []),
    ...(hasEventType(['no_school', 'student_holiday', 'teacher_workday', 'teacher_professional_learning']) ? [{ label: 'No School for Students', dot: 'bg-amber-400' }] : []),
    ...(hasEventType(['partial_closure']) ? [{ label: 'Some Students Off', dot: 'bg-pink-400' }] : []),
    ...(hasEventType(['half_day_high_school', 'half_day_dismissal']) ? [{ label: 'Half-Day Dismissal', dot: 'bg-orange-300' }] : []),
    ...(hasEventType(['early_dismissal', 'early_release']) ? [{ label: 'Early Release', dot: 'bg-orange-400' }] : []),
    ...(hasEventType(['makeup_day', 'weather_day', 'inclement_weather_day']) ? [{ label: 'Reserved Weather Day', dot: 'bg-orange-300' }] : []),
    ...(hasEventType(['break_start']) || hasPossibleMakeupDay ? [{ label: 'Break', dot: 'bg-purple-400' }] : []),
    ...(hasEventType(['observance']) ? [{ label: 'Observance', dot: 'bg-teal-400' }] : []),
    ...dateLegendExtraItems.value,
  ]
  const seen = new Set<string>()
  return items
    .map(item => ({ ...item, label: dateLabelOverrides.value[item.label] ?? item.label }))
    .filter((item) => {
      if (seen.has(item.label)) return false
      seen.add(item.label)
      return true
    })
})

const moveCalendarExportBeforeAllDates = computed(() =>
  (cal as any)?.moveCalendarExportBeforeAllDates === true || (cal as any)?.meta?.moveCalendarExportBeforeAllDates === true
)

const breaksBeforeAllDates = computed(() =>
  (cal as any)?.breaksBeforeAllDates === true || (cal as any)?.meta?.breaksBeforeAllDates === true
)

const resolvedJumpNavigation = computed(() => {
  if ((cal as any)?.preserveJumpNavigationOrder === true || (cal as any)?.meta?.preserveJumpNavigationOrder === true) {
    return customJumpNavigation.value
  }
  const afterAllDatesTargets = customSections.value
    .filter(section => section.position === 'afterAllDates')
    .map(section => `#${section.id}`)
  const targets = [
    '#key-dates',
    ...(breaksBeforeAllDates.value ? ['#breaks'] : []),
    ...(moveCalendarExportBeforeAllDates.value ? ['#add-to-calendar'] : []),
    '#all-dates',
    ...afterAllDatesTargets,
    ...(!breaksBeforeAllDates.value ? ['#breaks'] : []),
    ...(!moveCalendarExportBeforeAllDates.value ? ['#add-to-calendar'] : []),
    '#year-comparison',
    ...(comparisonBeforeFaq.value ? ['#comparison'] : []),
    ...(sourcesBeforeFaq.value ? ['#sources'] : []),
    '#faq',
    ...(!comparisonBeforeFaq.value ? ['#comparison'] : []),
    ...(!sourcesBeforeFaq.value ? ['#sources'] : []),
  ]
  return resolveJumpNavigation(customJumpNavigation.value, targets)
})

const instructionalDaysLine = computed(() => {
  if ((cal as any)?.hideInstructionalDaysSummary === true || (cal as any)?.meta?.hideInstructionalDaysSummary === true) {
    return ''
  }
  const days = cal?.totalSchoolDays ?? 180
  const description = String((cal as any)?.instructionalDaysDescription ?? (cal as any)?.meta?.instructionalDaysDescription ?? '').toLowerCase()
  const label = String((cal as any)?.instructionalDaysLabel ?? (cal as any)?.meta?.instructionalDaysLabel ?? '').toLowerCase()
  if (description.includes('attendance-day count') || description.includes('exact attendance')) {
    return `School year span: ${formatShortDate(cal!.firstDay)} - ${formatShortDate(cal!.lastDay)}`
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
const heroSummaryFacts = computed(() => {
  const facts: string[] = []
  if (instructionalDaysLine.value) facts.push(instructionalDaysLine.value)
  if (showSemesterCount.value) facts.push(`${cal!.semesters ?? 2} semesters`)
  facts.push(...heroFactChips.value)
  if (!hideSecondSemesterStartSummary.value && secondSemStart.value) facts.push(`Students return from ${winterBreakLabel.value} on ${formatShortDate(secondSemStart.value)}`)
  return facts
})

if (!isStatePage && district.value) {
  const canonicalUrl = `https://myschooldates.com/${slug}`
  const displayYearText = displaySchoolYear.value
  const _dn = meta.value!.name
  const _sn = (meta.value as any).shortName || _dn
  const _titleSuffix = cal?.sourcePdfUrl ? ': PDF & Holidays' : ': Holidays & Key Dates'
  const _slug = meta.value!.slug
  const _fd = cal ? formatShortDate(cal.firstDay) : ''
  const _ld = cal ? formatShortDate(cal.lastDay) : ''
  const _hasSpring = breaks.value.some((b: any) => b.name.toLowerCase().includes('spring'))
  const _descTemplates = [
    // A — PDF + key dates (~130 chars)
    `${_sn} Calendar ${displayYearText} with holidays${_hasSpring ? ', spring break' : ''} and key dates. Download the official PDF or calendar import file.`,
    // B — verified + download (~125 chars)
    `${_sn} Calendar ${displayYearText}: first day ${_fd}, last day ${_ld}${_hasSpring ? ', spring break' : ''}. Checked against district source. Download the PDF or .ics calendar file.`,
    // C — user benefit (~135 chars)
    `${_sn} Calendar ${displayYearText} — verified holidays${_hasSpring ? ', spring break' : ''}, key dates, and official PDF download. Works with Google Calendar.`,
    // D — ICS/sync (~130 chars)
    `${_sn} ${displayYearText} calendar dates sourced from official district calendars, with holidays${_hasSpring ? ', spring break' : ''} and winter break. Download PDF or importable .ics file.`,
    // E — verified dates (~130 chars)
    `${_sn} ${displayYearText}: first day ${_fd}, last day ${_ld}. Holidays${_hasSpring ? ', spring break' : ''}, official PDF, and calendar import file.`,
  ]
  const _idxDesc = cal
    ? _descTemplates[simpleHash(_slug + currentYear) % _descTemplates.length]
    : `${_dn} ${displayYearText} school calendar with all holidays, breaks, and key dates.`
  const _replacePlaceholders = (s: string) =>
    s.replace(/\{year\}/g, displayYearText).replace(/\{shortName\}/g, _sn).replace(/\{name\}/g, _dn)
  const _calTitle = cal ? (cal as any).seoTitle : undefined
  const _calDesc = cal ? (cal as any).seoDescription : undefined
  const _districtTitle = (meta.value as any).seoTitle ? _replacePlaceholders((meta.value as any).seoTitle) : undefined
  const _districtDesc = (meta.value as any).seoDescription ? _replacePlaceholders((meta.value as any).seoDescription) : undefined
  const _pageTitle = _calTitle ?? _districtTitle ?? `${_dn} Calendar ${displayYearText}${_titleSuffix}`
  const _pageDesc = _calDesc ?? _districtDesc ?? _idxDesc
  const schemaLogoUrl = 'https://myschooldates.com/icons/icon-512.png'
  const schemaLicenseUrl = 'https://myschooldates.com/data-license'
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
    logo: {
      '@type': 'ImageObject',
      url: schemaLogoUrl,
      width: 512,
      height: 512,
    },
  }
  const reviewTeamEntity = {
    '@type': 'Organization',
    '@id': 'https://myschooldates.com/#education-research-team',
    name: 'MySchoolDates Calendar Data Team',
    url: 'https://myschooldates.com/calendar-verification-methodology',
    parentOrganization: { '@id': 'https://myschooldates.com/#organization' },
  }
  const authorPersonEntity = {
    '@type': 'Person',
    '@id': 'https://myschooldates.com/author#person',
    name: editorialAuthorName,
    jobTitle: 'Founder & Education Data Research Lead',
    url: 'https://myschooldates.com/author',
    image: 'https://myschooldates.com/images/denis-dou.png',
    sameAs: ['https://www.linkedin.com/in/denis-dou/'],
    worksFor: { '@id': 'https://myschooldates.com/#organization' },
    knowsAbout: [
      'school calendar data',
      'K-12 education data',
      'district calendar verification',
      'structured calendar datasets',
      'official source verification',
      'parent-facing planning resources',
    ],
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
    ...(meta.value!.shortName && meta.value!.shortName !== meta.value!.name ? { alternateName: meta.value!.shortName } : {}),
    url: meta.value!.officialWebsite || canonicalUrl,
  }
  const pageDateCreated = (cal as any)?.dateCreated
  const pageDateModified = (cal as any)?.dateModified ?? cal?.lastVerifiedAt
  const pageLastReviewed = (cal as any)?.lastReviewedAt ?? (cal as any)?.lastReviewed ?? cal?.lastVerifiedAt
  const pageDatePublished = (cal as any)?.datePublished
  const sourcePdfUrl = (cal as any)?.sourcePdfUrl
  const printablePdfPath = (cal as any)?.printablePdfUrl
  const printablePdfUrl = typeof printablePdfPath === 'string'
    ? printablePdfPath.startsWith('http') ? printablePdfPath : `https://myschooldates.com${printablePdfPath}`
    : ''
  const includePrintablePdfInDatasetDistribution = Boolean(printablePdfUrl) &&
    !((cal as any)?.excludePrintablePdfFromDatasetDistribution || (cal as any)?.meta?.excludePrintablePdfFromDatasetDistribution)
  const sourceUrl = (cal as any)?.sourceUrl ?? meta.value!.calendarPage
  const sourcePdfIsArchivedCopy = typeof sourcePdfUrl === 'string' && sourcePdfUrl.includes('assets.myschooldates.com')
  const basedOnUrl = sourcePdfUrl && !sourcePdfIsArchivedCopy ? sourcePdfUrl : sourceUrl
  const sourceCalendarName = (cal as any)?.sourceCalendarName ?? (cal as any)?.meta?.sourceCalendarName
    ?? `${meta.value!.name} ${displayYearText} Calendar ${sourcePdfUrl && !sourcePdfIsArchivedCopy ? 'PDF' : 'Source'}`
  const sourceVersion = (cal as any)?.sourceVersion ?? (cal as any)?.meta?.sourceVersion
  const sourceCalendarDateCreated = (cal as any)?.sourceCalendarDateCreated ?? (cal as any)?.meta?.sourceCalendarDateCreated
  const sourceCalendarDateModified = (cal as any)?.sourceCalendarDateModified ?? (cal as any)?.meta?.sourceCalendarDateModified
  const sourcePdfSameAs = (cal as any)?.sourcePdfSameAs ?? (cal as any)?.meta?.sourcePdfSameAs
  const sourcePageCitationUrl = sourceUrl && sourceUrl !== basedOnUrl ? sourceUrl : ''
  const sourceCitation = [
    ...(basedOnUrl ? [{ '@id': `${canonicalUrl}#source-calendar` }] : []),
    ...(sourcePageCitationUrl ? [{ '@id': `${canonicalUrl}#source-calendar-page` }] : []),
  ]
  const calendarTypeName = cal
    ? String((cal as any)?.calendarType ?? '').replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : ''
  const schemaCalendarName = (cal as any)?.schemaCalendarName ?? (cal as any)?.meta?.schemaCalendarName ?? (calendarTypeName
    ? `${meta.value!.name} ${calendarTypeName} Calendar ${displayYearText}`
    : `${meta.value!.name} Calendar ${displayYearText}`)
  const schemaDatasetName = (cal as any)?.schemaDatasetName ?? (cal as any)?.meta?.schemaDatasetName ?? `${schemaCalendarName} Dataset`
  const datasetDescription = (cal as any)?.schemaDatasetDescription ?? (cal as any)?.meta?.schemaDatasetDescription ?? (calendarTypeName
    ? `Major ${calendarTypeName} Calendar dates for ${meta.value!.name} in ${displayYearText}, including school-year boundaries, major holidays, break ranges, and school resume dates.`
    : `Major calendar dates for ${meta.value!.name} in ${displayYearText}, including school-year boundaries, major holidays, break ranges, and school resume dates.`)
  const schemaCalendarDownloadName = (cal as any)?.schemaCalendarDownloadName ?? (cal as any)?.meta?.schemaCalendarDownloadName ?? `${schemaCalendarName} calendar file`
  const schemaCalendarDownloadDescription = (cal as any)?.schemaCalendarDownloadDescription ?? (cal as any)?.meta?.schemaCalendarDownloadDescription ?? 'Calendar import file generated from district-published dates checked against the official sources used for this page.'
  const schemaKeywords = [
    ...(((meta.value as any).schemaKeywords ?? (meta.value as any).meta?.schemaKeywords ?? []) as string[]),
    ...(((cal as any)?.schemaKeywords ?? (cal as any)?.meta?.schemaKeywords ?? []) as string[]),
  ]
  const schemaIsAccessibleForFree = (cal as any)?.schemaIsAccessibleForFree ?? (cal as any)?.meta?.schemaIsAccessibleForFree ?? (meta.value as any)?.schemaIsAccessibleForFree ?? (meta.value as any)?.meta?.schemaIsAccessibleForFree
  const schemaDatasetVersion = (cal as any)?.schemaDatasetVersion ?? (cal as any)?.meta?.schemaDatasetVersion
  const sourceCalendarEntity = basedOnUrl ? {
    '@type': 'CreativeWork',
    '@id': `${canonicalUrl}#source-calendar`,
    name: sourceCalendarName,
    ...(sourceVersion ? { version: sourceVersion } : {}),
    ...(sourceCalendarDateCreated ? { dateCreated: sourceCalendarDateCreated } : {}),
    ...(sourceCalendarDateModified ? { dateModified: sourceCalendarDateModified } : {}),
    ...(sourcePdfSameAs ? { sameAs: sourcePdfSameAs } : {}),
    url: basedOnUrl,
    publisher: { '@id': districtAbout['@id'] },
  } : null
  const additionalSourceCalendarEntities = (((cal as any)?.schemaAdditionalSourceCalendars ?? (cal as any)?.meta?.schemaAdditionalSourceCalendars ?? []) as any[])
    .filter(source => source?.url && source?.name)
    .map((source, index) => ({
      '@type': source.type ?? 'CreativeWork',
      '@id': source.id ? `${canonicalUrl}#${source.id}` : `${canonicalUrl}#source-calendar-${index + 2}`,
      name: source.name,
      ...(source.version ? { version: source.version } : {}),
      ...(source.dateCreated ? { dateCreated: source.dateCreated } : {}),
      ...(source.dateModified ? { dateModified: source.dateModified } : {}),
      ...(source.datePublished ? { datePublished: source.datePublished } : {}),
      ...(source.sameAs ? { sameAs: source.sameAs } : {}),
      url: source.url,
      publisher: source.publisherName ? {
        '@type': 'EducationalOrganization',
        name: source.publisherName,
        ...(source.publisherUrl ? { url: source.publisherUrl } : {}),
      } : { '@id': districtAbout['@id'] },
    }))
  const sourceCalendarPageEntity = sourcePageCitationUrl ? {
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#source-calendar-page`,
    name: `${meta.value!.name} calendar page`,
    url: sourcePageCitationUrl,
    publisher: { '@id': districtAbout['@id'] },
  } : null
  const sourceBasedOnRefs = [
    ...(basedOnUrl ? [{ '@id': `${canonicalUrl}#source-calendar` }] : []),
    ...(sourcePageCitationUrl ? [{ '@id': `${canonicalUrl}#source-calendar-page` }] : []),
    ...additionalSourceCalendarEntities.map(source => ({ '@id': source['@id'] })),
  ]
  const sourceBasedOnValue = sourceBasedOnRefs.length === 1 ? sourceBasedOnRefs[0] : sourceBasedOnRefs
  const datasetSourceCalendarIds = (((cal as any)?.schemaDatasetSourceCalendarIds ?? (cal as any)?.meta?.schemaDatasetSourceCalendarIds) as string[] | undefined)
  const datasetBasedOnRefs = Array.isArray(datasetSourceCalendarIds)
    ? datasetSourceCalendarIds
        .map(id => {
          if (id === 'source-calendar' && basedOnUrl) return { '@id': `${canonicalUrl}#source-calendar` }
          if (id === 'source-calendar-page' && sourcePageCitationUrl) return { '@id': `${canonicalUrl}#source-calendar-page` }
          if (id && additionalSourceCalendarEntities.some(source => source['@id'] === `${canonicalUrl}#${id}`)) return { '@id': `${canonicalUrl}#${id}` }
          return null
        })
        .filter(Boolean)
    : sourceBasedOnRefs
  const datasetBasedOnValue = datasetBasedOnRefs.length === 1 ? datasetBasedOnRefs[0] : datasetBasedOnRefs
  const calendarIcsUrl = district.value && cal
    ? `https://myschooldates.com/calendars/${district.value.slug}-${cal.schoolYear}.ics`
    : ''
  const hideDatasetSchema = Boolean((cal as any)?.hideDatasetSchema || (cal as any)?.meta?.hideDatasetSchema)
  const spatialCoverageOverride = (cal as any)?.schemaSpatialCoverage ?? (cal as any)?.meta?.schemaSpatialCoverage ?? (meta.value as any)?.schemaSpatialCoverage ?? (meta.value as any)?.meta?.schemaSpatialCoverage
  const spatialCoverageValue = Array.isArray(spatialCoverageOverride)
    ? spatialCoverageOverride
        .map(area => typeof area === 'string' ? { '@type': 'AdministrativeArea', name: area } : area)
        .filter(area => area?.name)
    : typeof spatialCoverageOverride === 'string'
      ? spatialCoverageOverride
      : spatialCoverageOverride?.name
        ? spatialCoverageOverride
        : [meta.value?.county, meta.value?.state].filter(Boolean).join(', ')
  const hasSpatialCoverage = Array.isArray(spatialCoverageValue)
    ? spatialCoverageValue.length > 0
    : Boolean(spatialCoverageValue)
  const datasetTemporalCoverage = cal
    ? `${(cal as any)?.temporalCoverageStart || cal.firstDay}/${(cal as any)?.temporalCoverageEnd || cal.lastDay}`
    : undefined
  const datasetEntity = hideDatasetSchema ? null : {
    '@type': 'Dataset',
    '@id': `${canonicalUrl}#calendar-dataset`,
    name: schemaDatasetName,
    description: datasetDescription,
    url: canonicalUrl,
    ...(schemaKeywords.length ? { keywords: schemaKeywords } : {}),
    ...(typeof schemaIsAccessibleForFree === 'boolean' ? { isAccessibleForFree: schemaIsAccessibleForFree } : {}),
    ...(schemaDatasetVersion ? { version: schemaDatasetVersion } : {}),
    license: schemaLicenseUrl,
    usageInfo: schemaLicenseUrl,
    inLanguage: 'en-US',
    ...(pageDateCreated ? { dateCreated: pageDateCreated } : {}),
    ...(pageDateModified ? { dateModified: pageDateModified } : {}),
    temporalCoverage: datasetTemporalCoverage,
    ...(hasSpatialCoverage ? {
      spatialCoverage: spatialCoverageValue,
    } : {}),
    audience: {
      '@type': 'Audience',
      audienceType: 'Parents and Families',
    },
    creator: { '@id': 'https://myschooldates.com/#organization' },
    publisher: { '@id': 'https://myschooldates.com/#organization' },
    ...(datasetBasedOnRefs.length ? { isBasedOn: datasetBasedOnValue } : {}),
    distribution: [
      calendarIcsUrl ? {
        '@type': 'DataDownload',
        name: schemaCalendarDownloadName,
        description: schemaCalendarDownloadDescription,
        encodingFormat: 'text/calendar',
        contentUrl: calendarIcsUrl,
      } : null,
      includePrintablePdfInDatasetDistribution ? {
        '@type': 'DataDownload',
        name: `${schemaCalendarName} printable PDF`,
        description: `Printable PDF generated from ${meta.value!.shortName ?? meta.value!.name} dates checked against the public official district source used for this page.`,
        encodingFormat: 'application/pdf',
        contentUrl: printablePdfUrl,
      } : null,
    ].filter(Boolean),
  }
  const yearPageLinks = archivedYears.value
    .map(y => `https://myschooldates.com/${slug}/${y}`)
  const schemaReviewedBySetting = (cal as any)?.schemaReviewedBy ?? (cal as any)?.meta?.schemaReviewedBy ?? (meta.value as any)?.schemaReviewedBy ?? (meta.value as any)?.meta?.schemaReviewedBy
  const schemaReviewedById = schemaReviewedBySetting === 'author' || !schemaReviewedBySetting
    ? 'https://myschooldates.com/author#person'
    : schemaReviewedBySetting === 'team'
      ? 'https://myschooldates.com/#education-research-team'
      : String(schemaReviewedBySetting)
  const customSectionSchemaParts = customSections.value
    .filter((section) => {
      if ((section as any).schemaHasPart === false || (section as any).schema?.hasPart === false) return false
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
    .map((section) => {
      const sectionBasedOn = (section as any).schema?.isBasedOn ?? (section as any).isBasedOn
      const sectionBasedOnId = typeof sectionBasedOn === 'string'
        ? sectionBasedOn.startsWith('http')
          ? sectionBasedOn
          : `${canonicalUrl}#${sectionBasedOn.replace(/^#/, '')}`
        : ''
      return {
        '@type': 'WebPageElement',
        '@id': `${canonicalUrl}#${section.id}`,
        name: section.label,
        ...(sectionBasedOnId ? { isBasedOn: { '@id': sectionBasedOnId } } : {}),
      }
    })
  const yearNumbersTitle = (cal as any)?.yearNumbersTitle ?? (cal as any)?.meta?.yearNumbersTitle ?? ''
  const yearNumbersSchemaParts = !hiddenSections.value.has('yearNumbers') && String(yearNumbersTitle).toLowerCase().includes('insights')
    ? [{
      '@type': 'WebPageElement',
      '@id': `${canonicalUrl}#calendar-insights`,
      name: yearNumbersTitle,
    }]
    : []
  const includeArticleSchema = (district.value as any)?.includeArticleSchema !== false && (district.value as any)?.meta?.includeArticleSchema !== false && (cal as any)?.includeArticleSchema !== false && (cal as any)?.meta?.includeArticleSchema !== false
  const hideItemListSchema = Boolean((cal as any)?.hideItemListSchema || (cal as any)?.meta?.hideItemListSchema)
  const splitCalendarDateItemListSchema = Boolean(
    (cal as any)?.splitCalendarDateItemListSchema || (cal as any)?.meta?.splitCalendarDateItemListSchema,
  )
  const summaryItemListEvents = splitCalendarDateItemListSchema ? keyDateHighlights.value : itemListEvents.value
  const calendarDateItemListEvents = splitCalendarDateItemListSchema ? itemListEvents.value : []
  const webPageParts = [
    ...(includeArticleSchema ? [{ '@id': `${canonicalUrl}#calendar-analysis` }] : []),
    ...(datasetEntity ? [{ '@id': `${canonicalUrl}#calendar-dataset` }] : []),
    ...(!hideItemListSchema && summaryItemListEvents.length ? [{ '@id': `${canonicalUrl}#key-dates` }] : []),
    ...(!hideItemListSchema && calendarDateItemListEvents.length ? [{ '@id': `${canonicalUrl}#calendar-dates` }] : []),
    ...(faqSchemaItems.value.length ? [{ '@id': `${canonicalUrl}#faq` }] : []),
    ...customSectionSchemaParts,
    ...yearNumbersSchemaParts,
  ]
  const webPageMainEntityMode = (cal as any)?.webPageMainEntity ?? (cal as any)?.meta?.webPageMainEntity ?? (district.value as any)?.webPageMainEntity ?? (district.value as any)?.meta?.webPageMainEntity
  const webPageMainEntity = webPageMainEntityMode === 'none'
    ? null
    : webPageMainEntityMode === 'keyDates'
      ? (!hideItemListSchema && summaryItemListEvents.length ? { '@id': `${canonicalUrl}#key-dates` } : null)
      : webPageMainEntityMode === 'dataset'
        ? (datasetEntity ? { '@id': `${canonicalUrl}#calendar-dataset` } : null)
        : datasetEntity
          ? { '@id': `${canonicalUrl}#calendar-dataset` }
          : !hideItemListSchema && summaryItemListEvents.length
            ? { '@id': `${canonicalUrl}#key-dates` }
            : null
  const webPageEntity = {
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    name: _pageTitle,
    description: _pageDesc,
    url: canonicalUrl,
    inLanguage: 'en-US',
    ...(pageDateCreated ? { dateCreated: pageDateCreated } : {}),
    ...(pageDateModified ? { dateModified: pageDateModified } : {}),
    ...(pageLastReviewed ? { lastReviewed: pageLastReviewed } : {}),
    ...(pageDatePublished ? { datePublished: pageDatePublished } : {}),
    publisher: { '@id': 'https://myschooldates.com/#organization' },
    author: { '@id': 'https://myschooldates.com/author#person' },
    reviewedBy: { '@id': schemaReviewedById },
    audience: {
      '@type': 'Audience',
      audienceType: 'Parents and Families',
    },
    about: { '@id': districtAbout['@id'] },
    ...(webPageMainEntity ? { mainEntity: webPageMainEntity } : {}),
    ...(webPageParts.length ? { hasPart: webPageParts } : {}),
    ...(yearPageLinks.length ? { relatedLink: yearPageLinks } : {}),
    ...(sourceBasedOnRefs.length ? { isBasedOn: sourceBasedOnValue } : {}),
    ...(sourcePdfIsArchivedCopy ? {
      associatedMedia: {
        '@type': 'MediaObject',
        '@id': `${canonicalUrl}#official-pdf`,
        name: `Archived official ${displayYearText} calendar PDF`,
        contentUrl: sourcePdfUrl,
        encodingFormat: 'application/pdf',
      },
    } : {}),
    ...(additionalSourceCalendarEntities.length ? {
      citation: [
        ...sourceCitation,
        ...additionalSourceCalendarEntities.map(source => ({ '@id': source['@id'] })),
      ],
    } : sourceCitation.length ? { citation: sourceCitation } : {}),
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
    author: { '@id': 'https://myschooldates.com/author#person' },
    publisher: { '@id': 'https://myschooldates.com/#organization' },
    about: { '@id': districtAbout['@id'] },
    isPartOf: { '@id': `${canonicalUrl}#webpage` },
    ...(datasetEntity ? { mainEntity: { '@id': `${canonicalUrl}#calendar-dataset` } } : {}),
    ...(sourceBasedOnRefs.length ? { isBasedOn: sourceBasedOnValue } : {}),
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
  const keyDateItemListName = (cal as any)?.schemaKeyDateItemListName ?? (cal as any)?.meta?.schemaKeyDateItemListName ?? `${meta.value!.shortName || meta.value!.name} ${displayYearText} key school calendar dates`
  const calendarDateItemListName = (cal as any)?.schemaCalendarDateItemListName ?? (cal as any)?.meta?.schemaCalendarDateItemListName ?? `${meta.value!.shortName || meta.value!.name} ${displayYearText} student calendar dates`
  const keyDateItemListEntity = cal && !hideItemListSchema && summaryItemListEvents.length ? {
    '@type': 'ItemList',
    '@id': `${canonicalUrl}#key-dates`,
    name: keyDateItemListName,
    itemListElement: summaryItemListEvents.map((event, i) => {
      return {
        '@type': 'ListItem',
        position: i + 1,
          item: {
            '@type': 'Thing',
            name: keyDateDisplayName(event),
            description: keyDateSchemaDescription(event),
            additionalProperty: keyDateSchemaProperties(event),
        },
      }
    }),
  } : null
  const calendarDateItemListEntity = cal && !hideItemListSchema && calendarDateItemListEvents.length ? {
    '@type': 'ItemList',
    '@id': `${canonicalUrl}#calendar-dates`,
    name: calendarDateItemListName,
    itemListElement: calendarDateItemListEvents.map((event, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Thing',
        name: keyDateDisplayName(event),
        description: keyDateSchemaDescription(event),
        additionalProperty: keyDateSchemaProperties(event),
      },
    })),
  } : null
  const comparisonItems = cal && district.value
    ? [
        { district: meta.value!, calendar: cal, url: canonicalUrl },
        ...((relatedCals.value ?? []).slice(0, 3).map((relatedCal: any) => {
          const relatedDistrict = (relatedDistricts.value ?? []).find((d: any) => d.institutionId === relatedCal.institutionId)
          return relatedDistrict ? { district: relatedDistrict, calendar: relatedCal, url: `https://myschooldates.com/${relatedDistrict.slug}` } : null
        }).filter(Boolean)),
      ]
    : []
  const includeComparisonSchema = (district.value as any)?.includeComparisonSchema !== false && (cal as any)?.includeComparisonSchema !== false
  const comparisonItemListEntity = includeComparisonSchema && comparisonItems.length > 1 ? {
    '@type': 'ItemList',
    '@id': `${canonicalUrl}#nearby-calendar-comparison`,
    name: `${meta.value!.name} nearby district calendar comparison`,
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
          ...(schemaReviewedById === 'https://myschooldates.com/#education-research-team' ? [reviewTeamEntity] : []),
          authorPersonEntity,
          siteEntity,
          districtAbout,
          ...(sourceCalendarEntity ? [sourceCalendarEntity] : []),
          ...additionalSourceCalendarEntities,
          ...(sourceCalendarPageEntity ? [sourceCalendarPageEntity] : []),
          ...(datasetEntity ? [datasetEntity] : []),
          ...(includeArticleSchema ? [articleEntity] : []),
          webPageEntity,
          ...(keyDateItemListEntity ? [keyDateItemListEntity] : []),
          ...(calendarDateItemListEntity ? [calendarDateItemListEntity] : []),
          ...(comparisonItemListEntity ? [comparisonItemListEntity] : []),
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
  <!-- ── State Page ─────────────────────────────────────────────────────── -->
  <template v-if="isStatePage">
      <main class="site-page-shell py-8 space-y-8">

        <!-- Breadcrumb -->
        <Breadcrumb :items="[{ label: 'Home', href: '/' }, { label: matchedStateName! }]" />

        <!-- Hero -->
        <div>
          <h1 class="text-3xl font-semibold tracking-tight text-[#1f2933]">
            {{ matchedStateName }} School Calendar {{ stateCurrentYear }}
          </h1>
          <p class="mt-2 text-sm text-[#7b756d]">
            <template v-if="statePageData">
              {{ statePageData.heroDescription || `${stateCurrentYear} school calendar dates, holidays, breaks, district schedules, PDFs, and calendar downloads · Sourced from official district websites` }}
            </template>
            <template v-else>
              {{ stateCurrentYear }} school calendar dates · {{ stateDistricts.length }} public school district{{ stateDistricts.length !== 1 ? 's' : '' }} · Sourced from official district websites
            </template>
          </p>
          <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            <span class="flex items-center gap-1.5 text-sm text-gray-700">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
              <template v-if="statePageData">{{ statePageData.browseLabel || 'Browse district calendars' }}</template>
              <template v-else>{{ stateDistricts.length }} districts covered</template>
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
              {{ statePageData?.officialSourceLabel || 'Official district sources' }}
            </span>
            <span v-if="statePageData?.lastVerifiedAt" class="flex items-center gap-1.5 text-sm text-gray-700">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
              Last verified {{ new Date(statePageData.lastVerifiedAt + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}
            </span>
            <span class="flex items-center gap-1.5 text-sm text-gray-700">
              <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
              Verified by MySchoolDates Calendar Research Team
            </span>
          </div>
        </div>

        <!-- Jump navigation -->
        <nav v-if="statePageData" class="sticky top-2 z-10 -mx-1 overflow-x-auto rounded-lg border border-gray-200 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur">
          <div class="flex min-w-max gap-2">
            <a href="#state-quick-answer" class="rounded-lg px-3 py-1.5 font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">2026 Dates</a>
            <a href="#state-districts" class="rounded-lg px-3 py-1.5 font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">{{ statePageData.collectionNavLabel || 'Districts' }}</a>
            <a v-if="statePdfSectionId" :href="`#${statePdfSectionId}`" class="rounded-lg px-3 py-1.5 font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">PDF</a>
            <a href="#state-holidays" class="rounded-lg px-3 py-1.5 font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">Holidays</a>
            <a href="#faq" class="rounded-lg px-3 py-1.5 font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">FAQ</a>
            <a href="#state-calendar-data" class="rounded-lg px-3 py-1.5 font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">Trends</a>
          </div>
        </nav>

        <!-- Quick Answer -->
        <div v-if="statePageData" id="state-quick-answer" class="bg-blue-50 border border-blue-200 rounded-lg p-6 scroll-mt-24">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ statePageData.quickAnswerTitle ?? `Quick Answer: ${matchedStateName} School Calendar ${stateCurrentYear}` }}</h2>
          <p class="text-sm leading-relaxed text-gray-700">
            {{ statePageData.quickAnswer ?? `${matchedStateName} public school calendars are set by local districts, so first day of school, holidays, winter break, spring break, staff-only days, and make-up days vary by district. Families can use this page to find ${matchedStateName} district calendar links, compare key dates when available, and verify schedules against official school sources.` }}
          </p>
          <div v-if="statePageData.quickAnswerItems?.length" class="mt-4 overflow-x-auto rounded-lg border border-blue-100 bg-white">
            <table class="min-w-full divide-y divide-blue-100 text-sm">
              <tbody class="divide-y divide-blue-50">
                <tr v-for="item in statePageData.quickAnswerItems" :key="item.label">
                  <th scope="row" class="w-40 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-blue-700">{{ item.label }}</th>
                  <td class="px-4 py-2 text-gray-700">{{ item.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Quick Facts from state data -->
        <div v-if="statePageData?.quickFacts?.length" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div v-for="fact in statePageData.quickFacts" :key="fact.label" class="bg-rds-surface-panel rounded-lg border border-rds-hairline p-4 text-center">
            <div class="text-lg font-bold text-gray-900">{{ fact.value }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ fact.label }}</div>
          </div>
        </div>

        <!-- About section -->
        <div v-if="statePageData?.about" class="bg-rds-surface-panel rounded-lg border border-rds-hairline p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">About {{ matchedStateName }} School Calendars</h2>
          <div class="text-gray-600 leading-relaxed space-y-3">
            <p v-for="(para, i) in statePageData.about.split('\n\n')" :key="i">{{ para }}</p>
          </div>
        </div>

        <!-- State calendar rules -->
        <div v-if="statePageData?.calendarRules?.length" class="bg-rds-surface-panel rounded-lg border border-rds-hairline p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ matchedStateName }} School Calendar Rules and Terms</h2>
          <p class="text-sm text-[#7b756d] mb-5">
            {{ statePageData.calendarRulesDescription || `${matchedStateName} district calendars often use state-specific labels for attendance, closure, and planning days. Always confirm final dates with the official district calendar.` }}
          </p>
          <div class="grid gap-3 sm:grid-cols-2">
            <div
              v-for="rule in statePageData.calendarRules"
              :key="rule.label"
              class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
            >
              <div class="text-sm font-medium text-[#1f2933]">{{ rule.label }}</div>
              <p v-if="rule.description" class="mt-1.5 text-xs leading-relaxed text-gray-500">{{ rule.description }}</p>
            </div>
          </div>
        </div>

        <!-- State-specific sections -->
        <div v-if="statePageData?.stateSections?.length" class="space-y-6">
          <section
            v-for="section in statePageData.stateSections"
            :id="section.id"
            :key="section.id"
            class="bg-rds-surface-panel rounded-lg border border-rds-hairline p-6 scroll-mt-24"
          >
            <h2 class="text-lg font-semibold text-gray-900 mb-3">{{ section.label }}</h2>
            <div v-if="section.content" class="text-sm text-gray-600 leading-relaxed space-y-3">
              <p v-for="(para, i) in section.content.split('\n\n')" :key="i">{{ para }}</p>
            </div>
            <div v-if="section.table?.columns?.length && section.table?.rows?.length" class="mt-4 overflow-x-auto rounded-lg border border-gray-200">
              <table class="min-w-full divide-y divide-gray-200 text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      v-for="column in section.table.columns"
                      :key="column"
                      scope="col"
                      class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {{ column }}
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                  <tr v-for="(row, rowIndex) in section.table.rows" :key="rowIndex">
                    <td
                      v-for="(cell, cellIndex) in row"
                      :key="`${rowIndex}-${cellIndex}`"
                      class="px-4 py-2 text-gray-700"
                    >
                      {{ cell }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <!-- District Comparison Table -->
        <div v-if="stateDistricts.length > 1 && Object.keys(stateDistrictStats).length" class="bg-rds-surface-panel rounded-lg border border-rds-hairline overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">Compare {{ matchedStateName }} Districts at a Glance</h2>
            <p class="text-sm text-[#7b756d] mt-1">First and last days, major breaks, and days off — side by side.</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
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
                    <NuxtLink :to="`/${d.slug}`" class="font-medium text-[#1f2933] hover:text-blue-600 transition-colors whitespace-nowrap">
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
          <div class="px-6 py-3 border-t border-gray-50 text-xs text-gray-600">
            Days off = full student weekdays off (breaks, holidays, no-school days). Click any district for the full calendar.
          </div>
        </div>

        <!-- District Cards -->
        <div id="state-districts" class="scroll-mt-24">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ statePageData?.collectionHeading || `${matchedStateName} School Districts — ${stateCurrentYear}` }}</h2>
          <p class="text-sm text-[#7b756d] mb-4">{{ statePageData?.collectionDescription || 'Click any district to view the full calendar, add dates to Google Calendar, or download an ICS file.' }}</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NuxtLink
              v-for="d in stateDistricts"
              :key="d.slug"
              :to="`/${d.slug}`"
              class="bg-rds-surface-panel rounded-lg border border-rds-hairline p-5 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div class="font-semibold text-gray-900 leading-snug">{{ d.name }}</div>
              <div class="text-xs text-gray-600 mt-0.5">{{ d.city ? `${d.city}, ` : '' }}{{ (d as any).stateCode ?? d.state }}</div>
              <template v-if="stateDistrictStats[d.institutionId]">
                <div class="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div>
                    <div class="text-xs text-gray-600">First day</div>
                    <div class="text-sm font-medium text-gray-800">{{ formatMonthDay(stateDistrictStats[d.institutionId].firstDay) }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-600">Last day</div>
                    <div class="text-sm font-medium text-gray-800">{{ formatMonthDay(stateDistrictStats[d.institutionId].lastDay) }}</div>
                  </div>
                  <div v-if="stateDistrictStats[d.institutionId].winterBreak">
                    <div class="text-xs text-gray-600">Winter break</div>
                    <div class="text-sm font-medium text-gray-800">
                      {{ formatMonthDay(stateDistrictStats[d.institutionId].winterBreak!.start) }} – {{ formatMonthDay(stateDistrictStats[d.institutionId].winterBreak!.end) }}
                    </div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-600">Days off</div>
                    <div class="text-sm font-medium text-gray-800">{{ stateDistrictStats[d.institutionId].daysOff }} days</div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="mt-3 text-xs text-gray-600">{{ d.currentSchoolYear }}</div>
              </template>
              <div class="mt-3 pt-3 border-t border-gray-100">
                <div v-if="stateDistrictCalendarById[d.institutionId]" class="mb-2 space-y-1 text-xs text-gray-500">
                  <div>
                    <span class="text-gray-600">Official source:</span>
                    {{ d.name }}
                  </div>
                  <div v-if="stateDistrictCalendarById[d.institutionId].lastVerifiedAt">
                    <span class="text-gray-600">Last checked:</span>
                    {{ new Date(stateDistrictCalendarById[d.institutionId].lastVerifiedAt + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}
                  </div>
                </div>
                <div class="flex items-center justify-between">
                <span class="text-xs text-gray-600">{{ d.currentSchoolYear }}</span>
                <span class="text-xs font-medium text-blue-600">View calendar →</span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Popular district searches -->
        <div v-if="statePageData?.popularDistricts?.length" class="bg-rds-surface-panel rounded-lg border border-rds-hairline p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ statePageData.popularDistrictsHeading || `Popular ${matchedStateName} District Calendar Searches` }}</h2>
          <p class="text-sm text-[#7b756d] mb-5">
            {{ statePageData.popularDistrictsDescription || `These are common ${matchedStateName} district calendar searches families use when comparing school-year dates. MySchoolDates links district pages after official calendar data has been verified, so planned districts are listed without inactive links.` }}
          </p>
          <div class="grid gap-3 sm:grid-cols-2">
            <div
              v-for="item in statePageData.popularDistricts"
              :key="item.label"
              class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
            >
              <div class="text-sm font-medium text-[#1f2933]">{{ item.label }}</div>
              <div v-if="item.area" class="mt-0.5 text-xs text-gray-600">{{ item.area }}</div>
              <p v-if="item.note" class="mt-2 text-xs leading-relaxed text-gray-500">{{ item.note }}</p>
            </div>
          </div>
        </div>

        <!-- Common Holidays -->
        <div v-if="statePageData?.commonHolidays?.length" id="state-holidays" class="bg-rds-surface-panel rounded-lg border border-rds-hairline p-6 scroll-mt-24">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">Common {{ matchedStateName }} School Holidays</h2>
          <p class="text-sm text-[#7b756d] mb-4">{{ statePageData.commonHolidaysDescription || `Exact dates vary by district. Always verify with your district's official calendar before making plans.` }}</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="holiday in statePageData.commonHolidays"
              :key="holiday"
              class="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700"
            >{{ holiday }}</span>
          </div>
        </div>

        <!-- District clusters -->
        <div v-if="statePageData?.districtClusters?.length" class="bg-rds-surface-panel rounded-lg border border-rds-hairline p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ statePageData.clustersHeading || `${matchedStateName} District Calendar Clusters` }}</h2>
          <p class="text-sm text-[#7b756d] mb-5">{{ statePageData.clustersDescription || 'Use these regional links to compare nearby district calendars, spring break weeks, PDF availability, and Google Calendar import options.' }}</p>
          <div class="space-y-5">
            <section v-for="cluster in statePageData.districtClusters" :key="cluster.label">
              <h3 class="text-sm font-semibold text-gray-900">{{ cluster.label }}</h3>
              <p v-if="cluster.description" class="text-sm text-gray-600 mt-1">{{ cluster.description }}</p>
              <div class="mt-3 grid gap-3 sm:grid-cols-2">
                <NuxtLink
                  v-for="item in cluster.districts"
                  :key="`${cluster.label}-${item.slug}`"
                  :to="`/${item.slug}`"
                  class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div class="text-sm font-medium text-[#1f2933]">{{ item.label }}</div>
                  <p v-if="item.note" class="mt-1 text-xs leading-relaxed text-gray-500">{{ item.note }}</p>
                </NuxtLink>
              </div>
            </section>
          </div>
        </div>

        <!-- Planning Tips -->
        <div v-if="statePageData?.planningTips?.length" class="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Planning Tips for {{ matchedStateName }} Families</h2>
          <ul class="space-y-3">
            <li v-for="tip in statePageData.planningTips" :key="tip" class="flex items-start gap-2 text-sm text-gray-700">
              <svg class="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ tip }}
            </li>
          </ul>
        </div>

        <!-- FAQ -->
        <div v-if="statePageData?.faqs?.length" id="faq" class="bg-rds-surface-panel rounded-lg border border-rds-hairline p-6 scroll-mt-24">
          <h2 class="text-lg font-semibold text-gray-900 mb-5">Frequently Asked Questions</h2>
          <div class="space-y-5 divide-y divide-gray-100">
            <div v-for="faq in statePageData.faqs" :key="faq.q" class="pt-5 first:pt-0">
              <h3 class="font-medium text-[#1f2933]">{{ faq.q }}</h3>
              <p class="text-gray-600 mt-1.5">{{ faq.a }}</p>
            </div>
          </div>
        </div>

        <!-- Verification methodology -->
        <div v-if="statePageData?.verificationMethodology?.length" class="bg-rds-surface-panel rounded-lg border border-rds-hairline p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">How We Verify {{ matchedStateName }} School Calendars</h2>
          <ol class="space-y-2">
            <li v-for="(step, index) in statePageData.verificationMethodology" :key="step" class="flex gap-3 text-sm text-gray-700">
              <span class="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-semibold text-blue-700">{{ index + 1 }}</span>
              <span>{{ step }}</span>
            </li>
          </ol>
        </div>

        <!-- National calendar data context -->
        <div id="state-calendar-data" class="bg-rds-surface-panel rounded-lg border border-rds-hairline p-6 scroll-mt-24">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ matchedStateName }} School Calendars in National Context</h2>
          <p class="text-sm text-[#7b756d] mb-5">
            Use these research pages to compare {{ matchedStateName }} district calendars with broader U.S. school calendar patterns.
          </p>
          <div class="grid gap-3 sm:grid-cols-2">
            <NuxtLink
              to="/school-calendar-trends"
              class="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-200 hover:bg-blue-50 transition-colors"
            >
              <div class="text-sm font-semibold text-gray-900">School Calendar Trends Hub</div>
              <p class="mt-1 text-xs leading-relaxed text-gray-500">
                Browse school calendar data releases, trend reports, charts, and archive planning.
              </p>
            </NuxtLink>
            <NuxtLink
              to="/school-calendar-trends/2026-2027-report"
              class="rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-blue-200 hover:bg-blue-50 transition-colors"
            >
              <div class="text-sm font-semibold text-gray-900">2026-2027 School Calendar Trends Report</div>
              <p class="mt-1 text-xs leading-relaxed text-gray-500">
                See start dates, break patterns, end dates, and planning trends from reviewed U.S. district calendars.
              </p>
            </NuxtLink>
          </div>
        </div>

        <!-- Related States -->
        <div v-if="statePageData?.relatedStates?.length" class="bg-rds-surface-panel rounded-lg border border-rds-hairline overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">Compare Nearby States</h2>
            <p class="text-sm text-[#7b756d] mt-1">School start dates, spring break, and holiday schedules vary significantly between states — even for neighboring districts across state lines.</p>
          </div>
          <div class="divide-y divide-gray-50">
            <NuxtLink
              v-for="rs in statePageData.relatedStates"
              :key="rs.slug"
              :to="`/${rs.slug}`"
              class="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div class="font-medium text-[#1f2933]">{{ rs.name }} School Calendars</div>
              <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </div>

        <!-- SEO footer note -->
        <p class="text-xs text-gray-600 text-center">
          All calendar data is sourced from official {{ matchedStateName }} school district websites.
          Districts may revise calendars after publication — always verify with your district before making plans.
        </p>

      </main>
  </template>

  <!-- ── District Page ──────────────────────────────────────────────────── -->
  <template v-else-if="district && cal">
      <main class="py-8">

        <section class="district-page-section">
          <div class="district-page-inner space-y-8">
            <!-- Breadcrumb -->
            <Breadcrumb :items="[
              { label: 'Home', href: '/' },
              { label: district.state, href: `/${toStateSlug(district.state)}` },
              { label: district.name },
            ]" />

            <!-- Title -->
            <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ (cal as any).pageHeading || `${district.name} Calendar ${displaySchoolYear}` }}
          </h1>
          <p class="mt-2 text-sm text-[#7b756d]">
            {{ (cal as any).heroSourceLine ?? (cal as any).meta?.heroSourceLine ?? `${displaySchoolYear} calendar dates · Based on the official ${district.shortName || district.name} calendar` }}
            <template v-if="!((cal as any).hideHeroDownloadLink || (cal as any).meta?.hideHeroDownloadLink)">
              ·
              <a
                :href="(cal as any).heroDownloadHref ?? (cal as any).meta?.heroDownloadHref ?? '#add-to-calendar'"
                :target="((cal as any).heroDownloadHref ?? (cal as any).meta?.heroDownloadHref) ? '_blank' : undefined"
                :rel="((cal as any).heroDownloadHref ?? (cal as any).meta?.heroDownloadHref) ? 'noopener' : undefined"
                class="inline-flex min-h-11 items-center underline hover:text-[#0f5d6b] transition-colors"
              >
                {{ (cal as any).heroDownloadLabel ?? (cal as any).meta?.heroDownloadLabel ?? (cal as any).icsButtonLabel ?? (cal as any).meta?.icsButtonLabel ?? 'Download calendar file' }}
                <span v-if="(cal as any).heroDownloadHref ?? (cal as any).meta?.heroDownloadHref" class="sr-only">(opens in a new tab)</span>
              </a>
            </template>
          </p>
          <p class="mt-2 text-xs text-[#6b645c]">
            MySchoolDates is an independent calendar reference and is not affiliated with {{ district.name }}.
          </p>
          <!-- Featured snippet: direct answer for search intent -->
          <div v-if="calendarSummaryParagraphs.length" class="mt-5 space-y-2 text-sm text-[hsl(var(--rds-ink-muted)/1)] leading-relaxed">
            <p v-for="(paragraph, i) in calendarSummaryParagraphs" :key="i">{{ paragraph }}</p>
          </div>
          <div v-if="heroCtas.length" class="mt-4 flex flex-wrap gap-2">
            <a
              v-for="cta in heroCtas"
              :key="cta.key"
              :href="cta.href"
              :download="cta.download ? (cta.filename || '') : undefined"
              :target="cta.download ? undefined : '_blank'"
              :rel="cta.download ? undefined : 'noopener'"
              class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
              :class="cta.variant === 'primary'
                ? 'bg-[#0f5d6b] text-white hover:bg-[#0b4c58]'
                : 'border border-[#d9d2c7] bg-[#fbfaf7] text-[#4f5b5f] hover:bg-[#f3f0e8]'"
            >
              {{ cta.label }}
            </a>
          </div>
          <div v-if="heroLinks.length" class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
            <a
              v-for="link in heroLinks"
              :key="link.key"
              :href="link.href"
              :target="link.isExternal ? '_blank' : undefined"
              :rel="link.isExternal ? 'noopener' : undefined"
              class="font-medium text-[#0f5d6b] hover:underline"
            >
              {{ link.label }}
              <span v-if="link.isExternal" class="sr-only">(opens in a new tab)</span>
            </a>
          </div>
          <div v-if="heroQuickDates.length" id="quick-answer" class="mt-4 rounded-lg border border-rds-hairline bg-rds-surface-panel p-4 scroll-mt-24">
            <p class="text-sm font-semibold text-[#1f2933]">{{ displaySchoolYear }} Dates at a Glance</p>
            <ul class="mt-2 grid gap-1.5 text-sm text-[#4f5b5f] sm:grid-cols-2">
              <li v-for="item in heroQuickDates" :key="`${item.label}-${item.value}`">
                <strong>{{ item.label }}:</strong> {{ item.value }}
              </li>
            </ul>
          </div>
          <p v-if="heroSummaryFacts.length" class="mt-3 text-sm text-[#7b756d]">
            {{ heroSummaryFacts.join(' · ') }}
          </p>
          <dl
            v-if="!isEstimated && verifiedDate && (!((cal as any).hideHeroReviewedField || (cal as any).meta?.hideHeroReviewedField) || !((cal as any).hideHeroReviewedByField || (cal as any).meta?.hideHeroReviewedByField) || !((cal as any).hideHeroUpdatedField || (cal as any).meta?.hideHeroUpdatedField))"
            class="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#7b756d]"
          >
            <div v-if="!((cal as any).hideHeroReviewedField || (cal as any).meta?.hideHeroReviewedField)">
              <dt class="inline font-semibold uppercase tracking-wide text-[#6b645c]">Reviewed</dt>
              <dd class="ml-1 inline font-medium text-[#4f5b5f]">{{ verifiedDate }}</dd>
            </div>
              <div v-if="!((cal as any).hideHeroReviewedByField || (cal as any).meta?.hideHeroReviewedByField)">
                <dt class="inline font-semibold uppercase tracking-wide text-[#6b645c]">Reviewed by</dt>
                <dd class="ml-1 inline font-medium">
                  <NuxtLink to="/author" class="text-[#0f5d6b] hover:underline">{{ editorialAuthorName }}</NuxtLink>
              </dd>
            </div>
            <div v-if="!((cal as any).hideHeroUpdatedField || (cal as any).meta?.hideHeroUpdatedField)">
              <dt class="inline font-semibold uppercase tracking-wide text-[#6b645c]">Updated</dt>
              <dd class="ml-1 inline font-medium text-[#4f5b5f]">{{ updatedDate }}</dd>
            </div>
          </dl>
          <!-- Verification badge -->
          <div
            v-if="!((cal as any).hideHeroVerifiedBadge || (cal as any).meta?.hideHeroVerifiedBadge)"
            class="mt-5 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
            :class="isEstimated
              ? 'bg-[#f3ead7] text-[#74552a] border border-[#e5d5b8]'
              : 'bg-[#e7efe5] text-[#315b39] border border-[#cfdfcc]'"
          >
            <svg v-if="!isEstimated" class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" focusable="false">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span v-if="!isEstimated">{{ verificationBadgeText || `Checked against the official ${district.shortName || meta.name} calendar on ${verifiedDate}.` }}</span>
            <span v-else>Based on official district website · Not yet human-verified</span>
          </div>
          <details v-if="!isEstimated && verifiedDate && !hideHeroVerificationProcess" class="mt-5 rounded-lg border border-rds-hairline bg-rds-surface-panel p-3">
            <summary class="cursor-pointer text-xs font-semibold uppercase tracking-wide text-[#7b756d]">How verified</summary>
            <ul class="mt-2 grid gap-1.5 text-xs text-[#6b645c] sm:grid-cols-3">
              <li class="flex items-start gap-1.5">
                <span class="mt-0.5 text-[#315b39]">✓</span>
                <span>Official district source checked</span>
              </li>
              <li class="flex items-start gap-1.5">
                <span class="mt-0.5 text-[#315b39]">✓</span>
                <span>Key dates compared against source</span>
              </li>
              <li v-if="!((cal as any).hideHeroVerificationIcs || (cal as any).meta?.hideHeroVerificationIcs)" class="flex items-start gap-1.5">
                <span class="mt-0.5 text-[#315b39]">✓</span>
                <span>ICS file generated from the dates reviewed for this page</span>
              </li>
            </ul>
          </details>
            </div>
          </div>
        </section>

        <nav v-if="resolvedJumpNavigation.length" aria-label="Page sections" class="sticky top-0 z-20 my-8 border-y border-[#ddd7cc] bg-[#f7f5f0]/95 backdrop-blur">
          <div class="district-page-inner flex items-center gap-7 overflow-x-auto py-4 text-sm">
            <span class="flex-shrink-0 font-semibold text-[#7b756d]">On this page</span>
            <a
              v-for="item in resolvedJumpNavigation"
              :key="item.label"
              :href="item.href || `#${item.id}`"
              class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors"
            >{{ item.label }}</a>
          </div>
        </nav>
        <nav v-else aria-label="Page sections" class="sticky top-0 z-20 my-8 border-y border-[#ddd7cc] bg-[#f7f5f0]/95 backdrop-blur">
          <div class="district-page-inner flex items-center gap-7 overflow-x-auto py-4 text-sm">
            <span class="flex-shrink-0 font-semibold text-[#7b756d]">On this page</span>
            <a v-if="!hiddenSections.has('keyDateCards')" href="#key-dates" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Key Dates</a>
            <a v-if="heroQuickDates.length" href="#quick-answer" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Quick Answer</a>
            <a v-if="summarySectionId" :href="`#${summarySectionId}`" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Summary</a>
            <a v-if="overviewSectionId" :href="`#${overviewSectionId}`" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Overview</a>
            <a v-if="audienceSectionId" :href="`#${audienceSectionId}`" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Who Uses</a>
            <a href="#all-dates" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Dates</a>
            <a v-if="breaks.length && !hiddenSections.has('breaks')" href="#breaks" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Breaks</a>
            <a href="#add-to-calendar" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Download</a>
            <a v-if="downloadGuideSectionId" :href="`#${downloadGuideSectionId}`" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Download Guide</a>
            <a v-if="changesSectionId" :href="`#${changesSectionId}`" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Changes</a>
            <a v-if="highlightsSectionId" :href="`#${highlightsSectionId}`" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Highlights</a>
            <a v-if="termsSectionId" :href="`#${termsSectionId}`" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Terms</a>
            <a v-if="planningSectionId" :href="`#${planningSectionId}`" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Planning</a>
            <a v-if="importantDatesSectionId" :href="`#${importantDatesSectionId}`" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Important Dates</a>
            <a v-if="earlyDismissalSectionId" :href="`#${earlyDismissalSectionId}`" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Early Dismissal</a>
            <a v-if="!hiddenSections.has('comparison')" href="#comparison" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Comparison</a>
            <a v-if="!hiddenSections.has('faq')" href="#faq" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">FAQ</a>
          </div>
        </nav>

        <div class="district-page-content">
        <DistrictCustomSections :sections="customSections" position="afterVerification" />

        <!-- Calendar track notice -->
        <div v-if="hasCalendarTrackCaution" class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
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
        <div v-if="!hiddenSections.has('keyDateCards')" id="key-dates" class="scroll-mt-24">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Key Dates</h2>
          <DistrictKeyDateCards :cal="cal" />
        </div>

        <!-- Alternate calendars notice -->
        <div v-if="(cal as any)?.alternateCalendars?.length && !hideAlternateCalendarsNotice" class="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
          <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-amber-800">
            <template v-if="alternateCalendarsNotice">
              {{ alternateCalendarsNotice }}
              <template v-if="alternateCalendarsNoticeLinks.length">
                <template v-for="(link, index) in alternateCalendarsNoticeLinks" :key="link.href">
                  <template v-if="index"> or </template>
                  <a :href="link.href" target="_blank" rel="noopener" class="underline font-medium">{{ link.label }}<span class="sr-only">(opens in a new tab)</span></a>
                </template>
              </template>
              <a
                v-else-if="alternateCalendarsNoticeLinkLabel"
                :href="alternateCalendarsNoticeLinkHref"
                class="underline font-medium"
              >{{ alternateCalendarsNoticeLinkLabel }}</a>
            </template>
            <template v-else>
              This page shows the <strong>Traditional Calendar</strong>, which applies to most {{ district.name }} schools.
              If your child attends a year-round school or specialized program, see
              <a href="#other-calendars" class="underline font-medium">Other Official Calendars</a> below.
            </template>
          </p>
        </div>

        <DistrictOtherCalendars
          v-if="otherCalendarsAfterKeyDates && (cal as any)?.alternateCalendars?.length && !hiddenSections.has('otherCalendars')"
          :alternate-calendars="(cal as any).alternateCalendars"
          :district-name="district.name"
          :title="(cal as any).alternateCalendarsTitle ?? (cal as any).meta?.alternateCalendarsTitle"
          :description="(cal as any).alternateCalendarsDescription ?? (cal as any).meta?.alternateCalendarsDescription"
          :button-label="(cal as any).alternateCalendarsButtonLabel ?? (cal as any).meta?.alternateCalendarsButtonLabel"
          :collapsible="(cal as any).alternateCalendarsCollapsible ?? (cal as any).meta?.alternateCalendarsCollapsible"
          :summary-label="(cal as any).alternateCalendarsSummaryLabel ?? (cal as any).meta?.alternateCalendarsSummaryLabel"
        />
        <DistrictCustomSections :sections="customSections" position="afterAlternateCalendarsNotice" />

        <!-- Key Dates & Holidays Summary -->
        <div
          v-if="!hiddenSections.has('keyDates') && !hiddenSections.has('keyDatesSummary') && keyDateHighlights.length"
          :id="hiddenSections.has('keyDateCards') ? 'key-dates' : undefined"
          class="bg-rds-surface-panel rounded-lg border border-rds-hairline p-6 scroll-mt-24"
        >
          <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ keyDatesSummaryTitle }}</h2>
          <p v-if="keyDatesSummarySubtitle" class="text-xs text-gray-600 mb-4">{{ keyDatesSummarySubtitle }}</p>
          <div class="divide-y divide-gray-100">
            <div
              v-for="event in keyDateHighlights"
              :key="event.date + event.name"
              class="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
            >
              <div class="flex items-start gap-2.5 min-w-0">
                <span
                  class="mt-0.5 text-xs font-medium px-2 py-0.5 rounded-lg whitespace-nowrap flex-shrink-0"
                  :class="eventTypeColor[event.type]"
                >{{ keyDateLabel(event) }}</span>
                <span class="min-w-0">
                  <span class="block break-words text-sm text-gray-900">{{ keyDateDisplayName(event) }}</span>
                  <span v-if="event.description" class="mt-0.5 block text-xs leading-relaxed text-gray-500">{{ event.description }}</span>
                </span>
              </div>
              <span class="text-sm text-[#7b756d] tabular-nums ml-4 flex-shrink-0">
                <span v-if="keyDateUsesPlainText(event)">{{ event.displayDate }}</span>
                <template v-else-if="keyDateListDateParts(event).length">
                  <template
                    v-for="(part, index) in keyDateListDateParts(event)"
                    :key="part.date"
                  >
                    <span v-if="index > 0">&nbsp;{{ event.dateJoiner ?? 'and' }}&nbsp;</span>
                    <time :datetime="part.date" :aria-label="part.ariaLabel">{{ part.label }}</time>
                  </template>
                </template>
                <template v-else>
                  <time :datetime="keyDateRange(event).start">{{ event.type === 'break_start' ? formatShortDate(keyDateRange(event).start) : keyDateDisplayDate(event) }}</time>
                  <template v-if="keyDateRange(event).end !== keyDateRange(event).start && !event.dateJoiner">
                    <span> – </span>
                    <time :datetime="keyDateRange(event).end">{{ formatShortDate(keyDateRange(event).end) }}</time>
                  </template>
                </template>
              </span>
            </div>
          </div>
        </div>

        <div v-if="!hiddenSections.has('downloadCta')" class="rounded-lg border border-[#d9d2c7] bg-[#f3f0e8] px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-[#4f5b5f]">
            Download the dates for Google Calendar, Apple Calendar, or Outlook, or view the district's official PDF.
          </p>
          <div class="flex flex-wrap gap-2">
            <a
              href="#add-to-calendar"
              class="inline-flex items-center justify-center rounded-lg bg-[#0f5d6b] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0b4c58] transition-colors"
            >
              Calendar Downloads
            </a>
            <a
              v-if="(cal as any).sourcePdfUrl || (cal as any).printablePdfUrl"
              :href="(cal as any).sourcePdfUrl || (cal as any).printablePdfUrl"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              {{ (cal as any).pdfButtonLabel ?? (cal as any).meta?.pdfButtonLabel ?? ((cal as any).sourcePdfUrl ? 'View Official PDF' : 'Download Printable PDF') }}
              <span class="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
        <div v-if="keyDateShortcuts.length" class="rounded-lg border border-rds-hairline bg-rds-surface-panel px-4 py-3 text-sm text-gray-600">
          <a
            v-for="link in keyDateShortcuts"
            :key="link.key"
            :href="link.href"
            :target="link.isExternal ? '_blank' : undefined"
            :rel="link.isExternal ? 'noopener' : undefined"
            class="font-semibold text-blue-600 hover:underline"
          >
            {{ link.label }} →
            <span v-if="link.isExternal" class="sr-only">(opens in a new tab)</span>
          </a>
        </div>

        <!-- Custom Sections: afterKeyDates -->
        <div v-if="showYearSwitcherAfterKeyDates && archivedYears.length" class="flex items-center gap-2 flex-wrap">
          <span class="text-sm text-[#7b756d]">{{ yearSwitcherLabel }}</span>
          <NuxtLink
            v-for="y in archivedYears"
            :key="y"
            :to="`/${slug}/${y}`"
            class="text-sm px-3 py-1 rounded-lg border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            {{ displaySchoolYearLabel(y) }}
          </NuxtLink>
        </div>
        <DistrictCustomSections :sections="customSections" position="afterKeyDates" />

        <!-- Quick Facts (fixed position — moved above Year by Numbers) -->
        <DistrictQuickFacts
          v-if="!hiddenSections.has('quickFacts')"
          :cal="cal"
          :district="district"
          :related-cals="relatedCals ?? []"
          :all-districts="relatedDistricts ?? []"
          :prev-cal="prevCal ?? undefined"
        />
        <DistrictCustomSections :sections="customSections" position="afterQuickFacts" />

        <!-- Today Status -->
        <DistrictTodayStatus v-if="!hiddenSections.has('todayStatus')" :cal="cal">
          <template #cta>
            <div class="mt-4 flex flex-col sm:flex-row gap-2">
              <a
                :href="calendarIcsHref"
                :download="district && cal ? `${district.slug}-${cal.schoolYear}.ics` : undefined"
                :aria-label="(cal as any)?.icsAriaLabel ?? (cal as any)?.meta?.icsAriaLabel ?? (district && cal ? `Download ${district.name} ${cal.schoolYear} calendar file` : 'Download calendar file')"
                class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0f5d6b] hover:bg-[#0b4c58] text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Add school dates
              </a>
              <a
                v-if="(cal as any).sourcePdfUrl || (cal as any).printablePdfUrl"
                :href="(cal as any).sourcePdfUrl || (cal as any).printablePdfUrl"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#fbfaf7] hover:bg-[#f3f0e8] text-[#4f5b5f] border border-[#d9d2c7] text-sm font-medium rounded-lg transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h10M7 11h10M7 15h6M6 3h8l4 4v14H6V3z" />
                </svg>
                {{ (cal as any).pdfButtonLabel ?? (cal as any).meta?.pdfButtonLabel ?? ((cal as any).sourcePdfUrl ? 'View Official PDF' : 'Printable PDF') }}
                <span class="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </template>
        </DistrictTodayStatus>

        <!-- Break Summary (optional early position) -->
        <template v-if="breaksBeforeAllDates">
          <div v-if="breaks.length && !hiddenSections.has('breaks')" id="breaks" class="bg-rds-surface-panel rounded-lg border border-rds-hairline p-6 scroll-mt-24">
            <h2 class="text-lg font-semibold text-[#1f2933] mb-4">{{ breaksTitle }}</h2>
            <div class="space-y-3">
              <div v-for="b in breaks" :key="b.name" class="flex flex-col items-start gap-2 py-3 border-b border-[#eee9df] last:border-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div class="font-medium text-[#1f2933]">{{ breakDisplayName(b.name) }}</div>
                  <div class="text-sm text-[#7b756d]">{{ formatCompactDateRange(b.start, b.end) }}</div>
                  <p v-if="breakNoteFor(b)" class="mt-1 text-sm text-[#6b645c]">{{ breakNoteFor(b) }}</p>
                  <div v-if="todayStr >= b.start && todayStr <= b.end" class="text-xs text-[#5b4b6f] mt-0.5 font-medium">
                    In progress
                  </div>
                </div>
                <div v-if="!hideBreakDurationBadges" class="self-start text-sm font-semibold text-[#5b4b6f] bg-[#eee9f3] px-3 py-1 rounded-lg sm:self-auto">{{ breakDurationLabel(b) }}</div>
              </div>
            </div>
          </div>
          <DistrictCustomSections v-if="!hiddenSections.has('breaks')" :sections="customSections" position="afterBreaks" />
        </template>

        <!-- Add to Calendar + Share (optional early position) -->
        <template v-if="moveCalendarExportBeforeAllDates">
          <CalendarExportShare
            :district-name="district.name"
            :year="currentYear"
            :source-url="(cal.sourceUrl ?? district.calendarPage) ?? district.officialWebsite"
            :district="district"
            :cal="cal"
          />
          <DistrictCustomSections :sections="customSections" position="afterCalendarExport" />
        </template>

        <!-- All Dates -->
        <DistrictAllDates
          :events="cal.events"
          :title="allDatesTitle"
          :source-url="(cal as any).allDatesSourceUrl ?? (cal as any).meta?.allDatesSourceUrl ?? (cal?.sourceUrl ?? district.calendarPage) ?? district.officialWebsite"
          :source-label="(cal as any).allDatesSourceLabel ?? (cal as any).meta?.allDatesSourceLabel"
          :source-suffix="(cal as any).allDatesSourceSuffix ?? (cal as any).meta?.allDatesSourceSuffix"
          :source-links="allDatesSourceLinks"
          :correction-source-url="(cal as any).allDatesCorrectionSourceUrl ?? (cal as any).meta?.allDatesCorrectionSourceUrl"
          :correction-source-label="(cal as any).allDatesCorrectionSourceLabel ?? (cal as any).meta?.allDatesCorrectionSourceLabel"
          :district-name="district.name"
          :verified-date="verifiedDate"
          :legend="dateLegend"
          :legend-title="(cal as any).dateLegendTitle ?? (cal as any).meta?.dateLegendTitle"
          :label-overrides="dateLabelOverrides"
          :mode="allDatesMode"
          :footer-mode="(cal as any).allDatesFooterMode ?? (cal as any).meta?.allDatesFooterMode"
          :included-dates-in-key-dates="allDatesIncludedDatesInKeyDates"
          :first-day="cal.firstDay"
          :last-day="cal.lastDay"
          :coverage-note="(cal as any).allDatesCoverageNote ?? (cal as any).meta?.allDatesCoverageNote"
          :coverage-note-position="(cal as any).allDatesCoverageNotePosition ?? (cal as any).meta?.allDatesCoverageNotePosition"
          :covered-break-dates-note="(cal as any).allDatesCoveredBreakDatesNote ?? (cal as any).meta?.allDatesCoveredBreakDatesNote"
          :derived-date-note="(cal as any).allDatesDerivedDateNote ?? (cal as any).meta?.allDatesDerivedDateNote"
          :legend-style="(cal as any).dateLegendStyle ?? (cal as any).meta?.dateLegendStyle"
          :month-notes="(cal as any).allDatesMonthNotes ?? (cal as any).meta?.allDatesMonthNotes"
        />
        <DistrictCustomSections :sections="customSections" position="afterAllDates" />

        <!-- Break Summary -->
        <div v-if="!breaksBeforeAllDates && breaks.length && !hiddenSections.has('breaks')" id="breaks" class="bg-rds-surface-panel rounded-lg border border-rds-hairline p-6 scroll-mt-24">
          <h2 class="text-lg font-semibold text-[#1f2933] mb-4">{{ breaksTitle }}</h2>
          <div class="space-y-3">
            <div v-for="b in breaks" :key="b.name" class="flex flex-col items-start gap-2 py-3 border-b border-[#eee9df] last:border-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div class="font-medium text-[#1f2933]">{{ breakDisplayName(b.name) }}</div>
                <div class="text-sm text-[#7b756d]">{{ formatCompactDateRange(b.start, b.end) }}</div>
                <p v-if="breakNoteFor(b)" class="mt-1 text-sm text-[#6b645c]">{{ breakNoteFor(b) }}</p>
                <div v-if="todayStr >= b.start && todayStr <= b.end" class="text-xs text-[#5b4b6f] mt-0.5 font-medium">
                  In progress
                </div>
              </div>
              <div v-if="!hideBreakDurationBadges" class="self-start text-sm font-semibold text-[#5b4b6f] bg-[#eee9f3] px-3 py-1 rounded-lg sm:self-auto">{{ breakDurationLabel(b) }}</div>
            </div>
          </div>
        </div>
        <DistrictCustomSections v-if="!breaksBeforeAllDates && !hiddenSections.has('breaks')" :sections="customSections" position="afterBreaks" />

        <!-- Other Official Calendars (optional position before the one-time calendar import) -->
        <DistrictOtherCalendars
          v-if="otherCalendarsBeforeCalendarExport && (cal as any)?.alternateCalendars?.length && !hiddenSections.has('otherCalendars')"
          :alternate-calendars="(cal as any).alternateCalendars"
          :district-name="district.name"
          :title="(cal as any).alternateCalendarsTitle ?? (cal as any).meta?.alternateCalendarsTitle"
          :description="(cal as any).alternateCalendarsDescription ?? (cal as any).meta?.alternateCalendarsDescription"
          :button-label="(cal as any).alternateCalendarsButtonLabel ?? (cal as any).meta?.alternateCalendarsButtonLabel"
          :collapsible="(cal as any).alternateCalendarsCollapsible ?? (cal as any).meta?.alternateCalendarsCollapsible"
          :summary-label="(cal as any).alternateCalendarsSummaryLabel ?? (cal as any).meta?.alternateCalendarsSummaryLabel"
          :footer-title="(cal as any).alternateCalendarsFooterTitle ?? (cal as any).meta?.alternateCalendarsFooterTitle"
          :footer-description="(cal as any).alternateCalendarsFooterDescription ?? (cal as any).meta?.alternateCalendarsFooterDescription"
          :footer-link-label="(cal as any).alternateCalendarsFooterLinkLabel ?? (cal as any).meta?.alternateCalendarsFooterLinkLabel"
          :footer-link-url="(cal as any).alternateCalendarsFooterLinkUrl ?? (cal as any).meta?.alternateCalendarsFooterLinkUrl"
        />
        <DistrictCustomSections v-if="otherCalendarsBeforeCalendarExport" :sections="customSections" position="afterOtherCalendars" />

        <!-- Add to Calendar + Share -->
        <template v-if="!moveCalendarExportBeforeAllDates">
          <CalendarExportShare
            :district-name="district.name"
            :year="currentYear"
            :source-url="(cal.sourceUrl ?? district.calendarPage) ?? district.officialWebsite"
            :district="district"
            :cal="cal"
          />
          <DistrictCustomSections :sections="customSections" position="afterCalendarExport" />
        </template>

        <!-- Other Official Calendars -->
        <DistrictOtherCalendars
          v-if="!otherCalendarsAfterKeyDates && !otherCalendarsAfterFaq && !otherCalendarsBeforeCalendarExport && (cal as any)?.alternateCalendars?.length && !hiddenSections.has('otherCalendars')"
          :alternate-calendars="(cal as any).alternateCalendars"
          :district-name="district.name"
          :title="(cal as any).alternateCalendarsTitle ?? (cal as any).meta?.alternateCalendarsTitle"
          :description="(cal as any).alternateCalendarsDescription ?? (cal as any).meta?.alternateCalendarsDescription"
          :button-label="(cal as any).alternateCalendarsButtonLabel ?? (cal as any).meta?.alternateCalendarsButtonLabel"
          :collapsible="(cal as any).alternateCalendarsCollapsible ?? (cal as any).meta?.alternateCalendarsCollapsible"
          :summary-label="(cal as any).alternateCalendarsSummaryLabel ?? (cal as any).meta?.alternateCalendarsSummaryLabel"
          :footer-title="(cal as any).alternateCalendarsFooterTitle ?? (cal as any).meta?.alternateCalendarsFooterTitle"
          :footer-description="(cal as any).alternateCalendarsFooterDescription ?? (cal as any).meta?.alternateCalendarsFooterDescription"
          :footer-link-label="(cal as any).alternateCalendarsFooterLinkLabel ?? (cal as any).meta?.alternateCalendarsFooterLinkLabel"
          :footer-link-url="(cal as any).alternateCalendarsFooterLinkUrl ?? (cal as any).meta?.alternateCalendarsFooterLinkUrl"
        />
        <DistrictCustomSections v-if="!otherCalendarsBeforeCalendarExport" :sections="customSections" position="afterOtherCalendars" />

        <!-- Dynamic mid sections: order varies by time context -->
        <template v-for="section in midSectionOrder" :key="section">

          <!-- About / Calendar Context -->
          <div v-if="section === 'about' && !hiddenSections.has('about')" class="text-gray-600 leading-relaxed space-y-3 text-sm">
            <template v-if="cal.calendarNotes">
              <p v-for="(para, i) in cal.calendarNotes.split('\n\n')" :key="i">{{ para }}</p>
            </template>
            <template v-else>
              <p>
                The {{ displaySchoolYear }} academic year for {{ district.name }} runs from
                <strong>{{ formatDate(cal.firstDay) }}</strong> to
                <strong>{{ formatDate(cal.lastDay) }}</strong><template v-if="instructionalDaysLine">, with {{ instructionalDaysLine }}</template>.
                <span v-if="secondSemStart && !hideSecondSemesterStartSummary">
                  Students return after {{ winterBreakLabel }} on {{ formatShortDate(secondSemStart) }}.
                </span>
              </p>
              <p v-if="breaks.length">
                Students have {{ breaks.length }} major school break{{ breaks.length !== 1 ? 's' : '' }} throughout the year —
                {{ breaks.map(b => breakDisplayName(b.name)).join(', ') }} — plus district-observed holidays and additional no-school days.
              </p>
            </template>
            <template v-if="(district as any).about?.length">
              <div v-for="card in (district as any).about" :key="card.title" class="bg-rds-surface-panel rounded-lg border border-rds-hairline p-5">
                <h3 class="text-sm font-semibold text-gray-900 mb-2">{{ card.title }}</h3>
                <p class="text-sm text-gray-600 leading-relaxed">{{ card.content }}</p>
              </div>
            </template>
          </div>

          <!-- Upcoming Events — timeline of next 6 events -->
          <div v-else-if="section === 'upcoming' && upcomingEvents.length" class="bg-rds-surface-panel rounded-lg border border-rds-hairline overflow-hidden">
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
                  <div class="text-xs font-semibold text-gray-600 uppercase">
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
                  <div class="font-medium text-[#1f2933] text-sm">{{ event.name }}</div>
                  <div class="text-xs text-gray-600 mt-0.5">
                    {{ new Date(event.date + 'T00:00:00').toLocaleString('en-US', { weekday: 'long' }) }}
                  </div>
                </div>
                <!-- Badge -->
                <span class="text-xs font-medium px-2 py-0.5 rounded-lg flex-shrink-0" :class="eventTypeColor[event.type]">
                  {{ eventTypeLabel[event.type] }}
                </span>
              </div>
            </div>
          </div>
        </template>

        <!-- Custom Sections: afterAbout (default position) -->
        <DistrictCustomSections :sections="customSections" position="afterAbout" />

        <!-- Year by the Numbers -->
        <div v-if="!hiddenSections.has('yearNumbers')" id="calendar-insights" class="scroll-mt-24">
          <DistrictYearNumbers :cal="cal" :school-year="currentYear" />
        </div>

        <!-- Grading Periods -->
        <DistrictGradingPeriods :periods="(cal as any).gradingPeriods" />

        <!-- What's Different This Year -->
        <div v-if="hasYearComparisonContent" id="year-comparison" class="scroll-mt-24 space-y-8">
          <DistrictYearDiff v-if="!hiddenSections.has('whatsDifferent')" :cal="cal" :prev-cal="prevCal ?? undefined" />
          <DistrictCustomSections :sections="customSections" position="afterYearDiff" />
        </div>

        <!-- Year Switcher -->
        <div v-if="!showYearSwitcherAfterKeyDates && !showYearSwitcherAfterSources && archivedYears.length" class="flex items-center gap-2 flex-wrap">
          <span class="text-sm text-[#7b756d]">{{ yearSwitcherLabel }}</span>
          <NuxtLink
            v-for="y in archivedYears"
            :key="y"
            :to="`/${slug}/${y}`"
            class="text-sm px-3 py-1 rounded-lg border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            {{ displaySchoolYearLabel(y) }}
          </NuxtLink>
        </div>

        <!-- Compare with Nearby Districts -->
        <template v-if="comparisonBeforeFaq">
          <DistrictComparison v-if="!hiddenSections.has('comparison')" :cal="cal" :district="district" :related-cals="relatedCals ?? []" :all-districts="relatedDistricts ?? []" :year="currentYear" />
          <DistrictCustomSections :sections="customSections" position="afterComparison" />
        </template>

        <!-- Sources & Verification: optional position before FAQ -->
        <DistrictSources
          v-if="sourcesBeforeFaq && !hiddenSections.has('sources') && pageSources.length"
          :sources="pageSources"
          :district-name="district.name"
          :short-name="(district as any).shortName || district.name"
          :year="currentYear"
          :verified-date="verifiedDate"
          :source-version="(cal as any).sourceVersion"
          :source-version-label="(cal as any).sourceVersionLabel ?? (cal as any).meta?.sourceVersionLabel"
          :source-version-display="(cal as any).sourceVersionDisplay ?? (cal as any).meta?.sourceVersionDisplay"
          :hide-source-version-display="(cal as any).hideSourceVersionDisplay ?? (cal as any).meta?.hideSourceVersionDisplay"
          :source-pdf-url="(cal as any).sourcePdfUrl"
          :review-summary="(cal as any).sourceReviewSummary ?? (cal as any).meta?.sourceReviewSummary"
          :review-details="(cal as any).sourceReviewDetails ?? (cal as any).meta?.sourceReviewDetails"
          :review-details-title="(cal as any).sourceReviewDetailsTitle ?? (cal as any).meta?.sourceReviewDetailsTitle"
          :maintainer-text="(cal as any).sourceMaintainerText ?? (cal as any).meta?.sourceMaintainerText"
          :next-review-text="(cal as any).sourceNextReviewText ?? (cal as any).meta?.sourceNextReviewText"
          :hide-review-date="Boolean((cal as any).hideSourceReviewDate ?? (cal as any).meta?.hideSourceReviewDate)"
          :review-date-label="(cal as any).sourceReviewDateLabel ?? (cal as any).meta?.sourceReviewDateLabel"
        />

        <!-- FAQ -->
        <DistrictFaq v-if="!hiddenSections.has('faq')" :cal="cal" :district="district" :faqs="faqs" />

        <!-- Custom Sections: afterFaq -->
        <DistrictCustomSections :sections="customSections" position="afterFaq" />

        <DistrictOtherCalendars
          v-if="otherCalendarsAfterFaq && (cal as any)?.alternateCalendars?.length && !hiddenSections.has('otherCalendars')"
          :alternate-calendars="(cal as any).alternateCalendars"
          :district-name="district.name"
          :title="(cal as any).alternateCalendarsTitle ?? (cal as any).meta?.alternateCalendarsTitle"
          :description="(cal as any).alternateCalendarsDescription ?? (cal as any).meta?.alternateCalendarsDescription"
         :button-label="(cal as any).alternateCalendarsButtonLabel ?? (cal as any).meta?.alternateCalendarsButtonLabel"
          :collapsible="(cal as any).alternateCalendarsCollapsible ?? (cal as any).meta?.alternateCalendarsCollapsible"
          :summary-label="(cal as any).alternateCalendarsSummaryLabel ?? (cal as any).meta?.alternateCalendarsSummaryLabel"
         :footer-title="(cal as any).alternateCalendarsFooterTitle ?? (cal as any).meta?.alternateCalendarsFooterTitle"
          :footer-description="(cal as any).alternateCalendarsFooterDescription ?? (cal as any).meta?.alternateCalendarsFooterDescription"
          :footer-link-label="(cal as any).alternateCalendarsFooterLinkLabel ?? (cal as any).meta?.alternateCalendarsFooterLinkLabel"
          :footer-link-url="(cal as any).alternateCalendarsFooterLinkUrl ?? (cal as any).meta?.alternateCalendarsFooterLinkUrl"
        />

        <!-- Compare with Nearby Districts -->
        <template v-if="!comparisonBeforeFaq">
          <DistrictComparison v-if="!hiddenSections.has('comparison')" :cal="cal" :district="district" :related-cals="relatedCals ?? []" :all-districts="relatedDistricts ?? []" :year="currentYear" />
          <DistrictCustomSections :sections="customSections" position="afterComparison" />
        </template>

        <!-- Planning Tips -->
        <DistrictPlanningTips
          id="planning-tips"
          v-if="!hiddenSections.has('planningTips') && (district as any).planningTips?.content?.length"
          :name="district.shortName || district.name"
          :tips="(district as any).planningTips.content"
          :title="(district as any).planningTips.title"
          :links="(district as any).planningTips.links"
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
          :title="(district as any).profileTitle ?? (district as any).meta?.profileTitle"
        />

        <!-- Living Here -->
        <DistrictLivingHere
          v-if="!hiddenSections.has('livingHere') && (district as any).livingHere?.highlights?.length"
          :city="district.city || district.name"
          :intro="(district as any).livingHere.intro"
          :highlights="(district as any).livingHere.highlights"
        />

        <!-- Custom Sections: beforeSources -->
        <DistrictCustomSections :sections="customSections" position="beforeSources" />

        <!-- Sources & Verification -->
        <DistrictSources
          v-if="!sourcesBeforeFaq && !hiddenSections.has('sources') && pageSources.length"
          :sources="pageSources"
          :district-name="district.name"
          :short-name="(district as any).shortName || district.name"
          :year="currentYear"
          :verified-date="verifiedDate"
          :source-version="(cal as any).sourceVersion"
          :source-version-label="(cal as any).sourceVersionLabel ?? (cal as any).meta?.sourceVersionLabel"
          :source-version-display="(cal as any).sourceVersionDisplay ?? (cal as any).meta?.sourceVersionDisplay"
          :hide-source-version-display="(cal as any).hideSourceVersionDisplay ?? (cal as any).meta?.hideSourceVersionDisplay"
          :source-pdf-url="(cal as any).sourcePdfUrl"
          :review-summary="(cal as any).sourceReviewSummary ?? (cal as any).meta?.sourceReviewSummary"
          :review-details="(cal as any).sourceReviewDetails ?? (cal as any).meta?.sourceReviewDetails"
          :review-details-title="(cal as any).sourceReviewDetailsTitle ?? (cal as any).meta?.sourceReviewDetailsTitle"
          :maintainer-text="(cal as any).sourceMaintainerText ?? (cal as any).meta?.sourceMaintainerText"
          :next-review-text="(cal as any).sourceNextReviewText ?? (cal as any).meta?.sourceNextReviewText"
          :review-date-label="(cal as any).sourceReviewDateLabel ?? (cal as any).meta?.sourceReviewDateLabel"
          :hide-review-date="Boolean((cal as any).hideSourceReviewDate ?? (cal as any).meta?.hideSourceReviewDate)"
        />

        <!-- Year Switcher: after Sources -->
        <div v-if="showYearSwitcherAfterSources && archivedYears.length" class="flex items-center gap-2 flex-wrap">
          <span class="text-sm text-[#7b756d]">{{ yearSwitcherLabel }}</span>
          <NuxtLink
            v-for="y in archivedYears"
            :key="y"
            :to="`/${slug}/${y}`"
            class="text-sm px-3 py-1 rounded-lg border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            {{ displaySchoolYearLabel(y) }}
          </NuxtLink>
        </div>

        <!-- Data quality notice -->
        <DistrictDataQuality
          v-if="!hiddenSections.has('sources') && !pageSources.length"
          :cal="cal"
          :district="district"
          :year="currentYear"
        />

        <!-- Related Districts -->
        <DistrictRelatedDistricts
          v-if="!hiddenSections.has('relatedDistricts') && (district as any).relatedDistricts?.length"
          :related-districts="(district as any).relatedDistricts"
          :state-name="district.state"
          :title="(cal as any)?.relatedDistrictsTitle ?? (cal as any)?.meta?.relatedDistrictsTitle ?? (district as any).relatedDistrictsTitle"
          :description="(cal as any)?.relatedDistrictsDescription ?? (cal as any)?.meta?.relatedDistrictsDescription ?? (district as any).relatedDistrictsDescription"
          :hide-descriptions="Boolean((cal as any)?.hideRelatedDistrictDescriptions ?? (cal as any)?.meta?.hideRelatedDistrictDescriptions ?? (district as any).hideRelatedDistrictDescriptions ?? (district as any).meta?.hideRelatedDistrictDescriptions)"
          :year="currentYear"
          :year-available-slugs="relatedYearAvailableSlugs"
          :force-year-links="Boolean((cal as any)?.forceRelatedDistrictYearLinks ?? (cal as any)?.meta?.forceRelatedDistrictYearLinks)"
        />

        <section v-if="!hiddenSections.has('nationalTrends')" class="rounded-lg border border-rds-hairline bg-rds-surface-panel p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ district.shortName || district.name }} in National Calendar Trends</h2>
          <p class="text-sm leading-relaxed text-gray-600">
            To compare this district calendar with broader U.S. start-date, break, and end-date patterns, see the
            <NuxtLink to="/school-calendar-trends/2026-2027-report" class="font-semibold text-blue-600 hover:underline">
              2026-2027 School Calendar Trends Report
            </NuxtLink>.
          </p>
        </section>
        </div>

      </main>
  </template>
</template>
