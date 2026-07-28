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

const archivedYears = computed(() =>
  (allCals.value ?? []).filter(y => y.schoolYear !== currentYear).map(y => y.schoolYear)
)
const today = new Date(); today.setHours(0, 0, 0, 0)
const breaks = computed(() => getBreaks(cal?.events ?? []))

const keyDateHighlights = computed(() => {
  if (!cal?.events) return []
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

function keyDateLabel(event: { type: string }) {
  if (event.type === 'break_start') return 'Break'
  return eventTypeLabel[event.type]
}

function keyDateDisplayName(event: { name: string; type: string }) {
  if (event.type === 'break_start' || event.type === 'break_end') {
    return event.name
      .replace(/\b(Begins|Begin|Starts|Start|Ends|End)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
  }
  return event.name
}
function keyDateSchemaDescription(event: any) {
  if (event.description) return event.description
  const districtLabel = meta.value!.shortName || meta.value!.name
  const eventName = keyDateDisplayName(event)
  if (event.type === 'school_start') {
    return `The first day of classes for ${districtLabel} students in the ${displaySchoolYear.value} school year.`
  }
  if (event.type === 'school_end') {
    return `The last day of classes for ${districtLabel} students in the ${displaySchoolYear.value} school year.`
  }
  if (event.type === 'break_start') {
    const schoolBreak = breaks.value.find((b: any) => b.name === event.name && b.start === event.date)
    if (schoolBreak?.end) {
      return `${districtLabel} ${eventName} runs ${formatShortDate(event.date)}–${formatShortDate(schoolBreak.end)}.`
    }
    return `${districtLabel} ${eventName} in the ${displaySchoolYear.value} school year.`
  }
  return `${eventName} on the ${districtLabel} ${displaySchoolYear.value} calendar.`
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
  links?: { label: string; to: string; description?: string }[]
  table?: { columns?: string[]; headers?: string[]; rows: string[][] }
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
const customJumpNavigation = computed(() =>
  (((cal as any)?.jumpNavigation ?? (cal as any)?.meta?.jumpNavigation ?? []) as Array<{ label?: string, href?: string, id?: string }>).filter(item => item.label && (item.href || item.id))
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

const dateLegend = computed(() => {
  const hasEventType = (types: string[]) =>
    (cal?.events ?? []).some((event: any) => types.includes(event.type))
  const hasPossibleMakeupDay = (cal?.events ?? []).some((event: any) => {
    const name = String(event.name ?? '').toLowerCase()
    return name.includes('possible') && (name.includes('make-up') || name.includes('makeup'))
  })
  const labelOverrides = ((cal as any)?.dateLegendLabelOverrides ?? (cal as any)?.meta?.dateLegendLabelOverrides ?? (district.value as any)?.dateLegendLabelOverrides ?? (district.value as any)?.meta?.dateLegendLabelOverrides ?? {}) as Record<string, string>
  const items = [
    ...(hasEventType(['break_start']) ? [{ label: 'Breaks', dot: 'bg-purple-400' }] : []),
    ...(hasEventType(['holiday']) ? [{ label: 'Holidays', dot: 'bg-blue-400' }] : []),
    ...(hasEventType(['no_school', 'student_holiday']) ? [{ label: 'No school', dot: 'bg-amber-400' }] : []),
    ...(hasEventType(['teacher_workday', 'teacher_professional_learning']) ? [{ label: 'Staff Days', dot: 'bg-amber-400' }] : []),
    ...(hasEventType(['digital_learning']) ? [{ label: 'Digital learning', dot: 'bg-pink-400' }] : []),
    ...(hasPossibleMakeupDay ? [{ label: 'Possible make-up day', dot: 'bg-orange-400' }] : []),
    ...(hasEventType(['early_dismissal', 'early_release']) ? [{ label: 'Early release', dot: 'bg-orange-400' }] : []),
    ...(hasEventType(['school_resume', 'school_reopen']) ? [{ label: 'School resumes', dot: 'bg-green-400' }] : []),
    ...(hasEventType(['academic', 'quarter_end', 'semester_end']) ? [{ label: 'Academic', dot: 'bg-gray-400' }] : []),
  ]
  return items.map(item => ({ ...item, label: labelOverrides[item.label] ?? item.label }))
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
  const schemaImageUrl = 'https://myschooldates.com/icons/myschooldates-og-img.png'
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
  const pageDatePublished = (cal as any)?.datePublished
  const sourcePdfUrl = (cal as any)?.sourcePdfUrl
  const printablePdfPath = (cal as any)?.printablePdfUrl
  const printablePdfUrl = typeof printablePdfPath === 'string'
    ? printablePdfPath.startsWith('http') ? printablePdfPath : `https://myschooldates.com${printablePdfPath}`
    : ''
  const sourceUrl = (cal as any)?.sourceUrl ?? meta.value!.calendarPage
  const sourcePdfIsArchivedCopy = typeof sourcePdfUrl === 'string' && sourcePdfUrl.includes('assets.myschooldates.com')
  const basedOnUrl = sourcePdfUrl && !sourcePdfIsArchivedCopy ? sourcePdfUrl : sourceUrl
  const sourceCalendarName = (cal as any)?.sourceCalendarName ?? (cal as any)?.meta?.sourceCalendarName
    ?? `${meta.value!.name} ${displayYearText} Calendar ${sourcePdfUrl && !sourcePdfIsArchivedCopy ? 'PDF' : 'Source'}`
  const sourceVersion = (cal as any)?.sourceVersion ?? (cal as any)?.meta?.sourceVersion
  const sourceCitation = basedOnUrl
    ? [{ '@id': `${canonicalUrl}#source-calendar` }]
    : []
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
  const schemaCalendarDownloadDescription = (cal as any)?.schemaCalendarDownloadDescription ?? (cal as any)?.meta?.schemaCalendarDownloadDescription ?? 'Calendar import file generated from district-published dates checked against the official source used for this page.'
  const schemaKeywords = [
    ...(((meta.value as any).schemaKeywords ?? (meta.value as any).meta?.schemaKeywords ?? []) as string[]),
    ...(((cal as any)?.schemaKeywords ?? (cal as any)?.meta?.schemaKeywords ?? []) as string[]),
  ]
  const sourceCalendarEntity = basedOnUrl ? {
    '@type': 'CreativeWork',
    '@id': `${canonicalUrl}#source-calendar`,
    name: sourceCalendarName,
    ...(sourceVersion ? { version: sourceVersion } : {}),
    url: basedOnUrl,
    publisher: { '@id': districtAbout['@id'] },
  } : null
  const calendarIcsUrl = district.value && cal
    ? `https://myschooldates.com/calendars/${district.value.slug}-${cal.schoolYear}.ics`
    : ''
  const hideDatasetSchema = Boolean((cal as any)?.hideDatasetSchema || (cal as any)?.meta?.hideDatasetSchema)
  const spatialCoverageOverride = (cal as any)?.schemaSpatialCoverage ?? (cal as any)?.meta?.schemaSpatialCoverage ?? (meta.value as any)?.schemaSpatialCoverage ?? (meta.value as any)?.meta?.schemaSpatialCoverage
  const spatialCoverageName = typeof spatialCoverageOverride === 'string'
    ? spatialCoverageOverride
    : [meta.value?.county, meta.value?.state].filter(Boolean).join(', ')
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
    license: schemaLicenseUrl,
    usageInfo: schemaLicenseUrl,
    inLanguage: 'en-US',
    ...(pageDateCreated ? { dateCreated: pageDateCreated } : {}),
    ...(pageDateModified ? { dateModified: pageDateModified } : {}),
    temporalCoverage: datasetTemporalCoverage,
    ...(spatialCoverageName ? {
      spatialCoverage: typeof spatialCoverageOverride === 'object'
        ? spatialCoverageOverride
        : {
            '@type': 'Place',
            name: spatialCoverageName,
          },
    } : {}),
    audience: {
      '@type': 'Audience',
      audienceType: 'Parents and Families',
    },
    creator: { '@id': 'https://myschooldates.com/#organization' },
    publisher: { '@id': 'https://myschooldates.com/#organization' },
    isBasedOn: basedOnUrl ? { '@id': `${canonicalUrl}#source-calendar` } : undefined,
    distribution: [
      calendarIcsUrl ? {
        '@type': 'DataDownload',
        name: schemaCalendarDownloadName,
        description: schemaCalendarDownloadDescription,
        encodingFormat: 'text/calendar',
        contentUrl: calendarIcsUrl,
      } : null,
      printablePdfUrl ? {
        '@type': 'DataDownload',
        name: `${schemaCalendarName} printable PDF`,
        description: `Printable PDF generated from ${meta.value!.shortName ?? meta.value!.name} dates checked against the public official district source used for this page.`,
        encodingFormat: 'application/pdf',
        contentUrl: printablePdfUrl,
      } : null,
    ].filter(Boolean),
  }
  const yearPageLinks = (allCals.value ?? [])
    .filter(y => y.schoolYear !== currentYear)
    .map(y => `https://myschooldates.com/${slug}/${y.schoolYear}`)
  const schemaReviewedBySetting = (cal as any)?.schemaReviewedBy ?? (cal as any)?.meta?.schemaReviewedBy ?? (meta.value as any)?.schemaReviewedBy ?? (meta.value as any)?.meta?.schemaReviewedBy
  const schemaReviewedById = schemaReviewedBySetting === 'author'
    ? 'https://myschooldates.com/author#person'
    : schemaReviewedBySetting === 'team' || !schemaReviewedBySetting
      ? 'https://myschooldates.com/#education-research-team'
      : String(schemaReviewedBySetting)
  const customSectionSchemaParts = customSections.value
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
  const yearNumbersTitle = (cal as any)?.yearNumbersTitle ?? (cal as any)?.meta?.yearNumbersTitle ?? ''
  const yearNumbersSchemaParts = !hiddenSections.value.has('yearNumbers') && String(yearNumbersTitle).toLowerCase().includes('insights')
    ? [{
      '@type': 'WebPageElement',
      '@id': `${canonicalUrl}#calendar-insights`,
      name: yearNumbersTitle,
    }]
    : []
  const includeArticleSchema = (district.value as any)?.includeArticleSchema !== false && (district.value as any)?.meta?.includeArticleSchema !== false && (cal as any)?.includeArticleSchema !== false && (cal as any)?.meta?.includeArticleSchema !== false
  const webPageParts = [
    ...(includeArticleSchema ? [{ '@id': `${canonicalUrl}#calendar-analysis` }] : []),
    ...(datasetEntity ? [{ '@id': `${canonicalUrl}#calendar-dataset` }] : []),
    ...(faqSchemaItems.value.length ? [{ '@id': `${canonicalUrl}#faq` }] : []),
    ...customSectionSchemaParts,
    ...yearNumbersSchemaParts,
  ]
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
    author: { '@id': 'https://myschooldates.com/author#person' },
    reviewedBy: { '@id': schemaReviewedById },
    audience: {
      '@type': 'Audience',
      audienceType: 'Parents and Families',
    },
    about: { '@id': districtAbout['@id'] },
    ...(datasetEntity
      ? { mainEntity: { '@id': `${canonicalUrl}#calendar-dataset` } }
      : itemListEvents.value.length
        ? { mainEntity: { '@id': `${canonicalUrl}#key-dates` } }
        : {}),
    ...(webPageParts.length ? { hasPart: webPageParts } : {}),
    ...(yearPageLinks.length ? { relatedLink: yearPageLinks } : {}),
    ...(basedOnUrl ? { isBasedOn: { '@id': `${canonicalUrl}#source-calendar` } } : {}),
    ...(sourcePdfIsArchivedCopy ? {
      associatedMedia: {
        '@type': 'MediaObject',
        '@id': `${canonicalUrl}#official-pdf`,
        name: `Archived official ${displayYearText} calendar PDF`,
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
    author: { '@id': 'https://myschooldates.com/author#person' },
    publisher: { '@id': 'https://myschooldates.com/#organization' },
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
  const hideItemListSchema = Boolean((cal as any)?.hideItemListSchema || (cal as any)?.meta?.hideItemListSchema)
  const keyDateItemListEntity = cal && !hideItemListSchema && itemListEvents.value.length ? {
    '@type': 'ItemList',
    '@id': `${canonicalUrl}#key-dates`,
    name: `${meta.value!.shortName || meta.value!.name} ${displayYearText} key school calendar dates`,
    itemListElement: itemListEvents.value.map((event, i) => {
      const range = keyDateRange(event)
      return {
        '@type': 'ListItem',
        position: i + 1,
          item: {
            '@type': 'Thing',
            name: keyDateDisplayName(event),
            description: keyDateSchemaDescription(event),
            additionalProperty: [
              { '@type': 'PropertyValue', name: 'Start date', value: range.start },
              { '@type': 'PropertyValue', name: 'End date', value: range.end },
          ],
        },
      }
    }),
  } : null
  const comparisonItems = cal && district.value
    ? [
        { district: meta.value!, calendar: cal, url: canonicalUrl },
        ...((relatedCals.value ?? []).slice(0, 3).map((relatedCal: any) => {
          const relatedDistrict = (allDistricts.value ?? []).find((d: any) => d.institutionId === relatedCal.institutionId)
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
            {{ matchedStateName }} School Calendar {{ stateCurrentYear }}
          </h1>
          <p class="mt-2 text-sm text-gray-500">
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
              {{ statePageData.officialSourceLabel || 'Official district sources' }}
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
        <nav v-if="statePageData" class="sticky top-2 z-10 -mx-1 overflow-x-auto rounded-full border border-gray-200 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur">
          <div class="flex min-w-max gap-2">
            <a href="#state-quick-answer" class="rounded-full px-3 py-1.5 font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">2026 Dates</a>
            <a href="#state-districts" class="rounded-full px-3 py-1.5 font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">{{ statePageData.collectionNavLabel || 'Districts' }}</a>
            <a v-if="statePdfSectionId" :href="`#${statePdfSectionId}`" class="rounded-full px-3 py-1.5 font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">PDF</a>
            <a href="#state-holidays" class="rounded-full px-3 py-1.5 font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">Holidays</a>
            <a href="#faq" class="rounded-full px-3 py-1.5 font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">FAQ</a>
            <a href="#state-calendar-data" class="rounded-full px-3 py-1.5 font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">Trends</a>
          </div>
        </nav>

        <!-- Quick Answer -->
        <div v-if="statePageData" id="state-quick-answer" class="bg-blue-50 border border-blue-200 rounded-xl p-6 scroll-mt-24">
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

        <!-- State calendar rules -->
        <div v-if="statePageData?.calendarRules?.length" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ matchedStateName }} School Calendar Rules and Terms</h2>
          <p class="text-sm text-gray-500 mb-5">
            {{ statePageData.calendarRulesDescription || `${matchedStateName} district calendars often use state-specific labels for attendance, closure, and planning days. Always confirm final dates with the official district calendar.` }}
          </p>
          <div class="grid gap-3 sm:grid-cols-2">
            <div
              v-for="rule in statePageData.calendarRules"
              :key="rule.label"
              class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
            >
              <div class="text-sm font-medium text-gray-900">{{ rule.label }}</div>
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
            class="bg-white rounded-xl border border-gray-200 p-6 scroll-mt-24"
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
        <div v-if="stateDistricts.length > 1 && Object.keys(stateDistrictStats).length" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">Compare {{ matchedStateName }} Districts at a Glance</h2>
            <p class="text-sm text-gray-500 mt-1">First and last days, major breaks, and days off — side by side.</p>
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
          <div class="px-6 py-3 border-t border-gray-50 text-xs text-gray-600">
            Days off = full student weekdays off (breaks, holidays, no-school days). Click any district for the full calendar.
          </div>
        </div>

        <!-- District Cards -->
        <div id="state-districts" class="scroll-mt-24">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ statePageData?.collectionHeading || `${matchedStateName} School Districts — ${stateCurrentYear}` }}</h2>
          <p class="text-sm text-gray-500 mb-4">{{ statePageData?.collectionDescription || 'Click any district to view the full calendar, add dates to Google Calendar, or download an ICS file.' }}</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NuxtLink
              v-for="d in stateDistricts"
              :key="d.slug"
              :to="`/${d.slug}`"
              class="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
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
        <div v-if="statePageData?.popularDistricts?.length" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ statePageData.popularDistrictsHeading || `Popular ${matchedStateName} District Calendar Searches` }}</h2>
          <p class="text-sm text-gray-500 mb-5">
            {{ statePageData.popularDistrictsDescription || `These are common ${matchedStateName} district calendar searches families use when comparing school-year dates. MySchoolDates links district pages after official calendar data has been verified, so planned districts are listed without inactive links.` }}
          </p>
          <div class="grid gap-3 sm:grid-cols-2">
            <div
              v-for="item in statePageData.popularDistricts"
              :key="item.label"
              class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
            >
              <div class="text-sm font-medium text-gray-900">{{ item.label }}</div>
              <div v-if="item.area" class="mt-0.5 text-xs text-gray-600">{{ item.area }}</div>
              <p v-if="item.note" class="mt-2 text-xs leading-relaxed text-gray-500">{{ item.note }}</p>
            </div>
          </div>
        </div>

        <!-- Common Holidays -->
        <div v-if="statePageData?.commonHolidays?.length" id="state-holidays" class="bg-white rounded-xl border border-gray-200 p-6 scroll-mt-24">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">Common {{ matchedStateName }} School Holidays</h2>
          <p class="text-sm text-gray-500 mb-4">{{ statePageData.commonHolidaysDescription || `Exact dates vary by district. Always verify with your district's official calendar before making plans.` }}</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="holiday in statePageData.commonHolidays"
              :key="holiday"
              class="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700"
            >{{ holiday }}</span>
          </div>
        </div>

        <!-- District clusters -->
        <div v-if="statePageData?.districtClusters?.length" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ statePageData.clustersHeading || `${matchedStateName} District Calendar Clusters` }}</h2>
          <p class="text-sm text-gray-500 mb-5">{{ statePageData.clustersDescription || 'Use these regional links to compare nearby district calendars, spring break weeks, PDF availability, and Google Calendar import options.' }}</p>
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
                  <div class="text-sm font-medium text-gray-900">{{ item.label }}</div>
                  <p v-if="item.note" class="mt-1 text-xs leading-relaxed text-gray-500">{{ item.note }}</p>
                </NuxtLink>
              </div>
            </section>
          </div>
        </div>

        <!-- Planning Tips -->
        <div v-if="statePageData?.planningTips?.length" class="bg-blue-50 border border-blue-200 rounded-xl p-6">
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
        <div v-if="statePageData?.faqs?.length" id="faq" class="bg-white rounded-xl border border-gray-200 p-6 scroll-mt-24">
          <h2 class="text-lg font-semibold text-gray-900 mb-5">Frequently Asked Questions</h2>
          <div class="space-y-5 divide-y divide-gray-100">
            <div v-for="faq in statePageData.faqs" :key="faq.q" class="pt-5 first:pt-0">
              <h3 class="font-medium text-gray-900">{{ faq.q }}</h3>
              <p class="text-gray-600 mt-1.5">{{ faq.a }}</p>
            </div>
          </div>
        </div>

        <!-- Verification methodology -->
        <div v-if="statePageData?.verificationMethodology?.length" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">How We Verify {{ matchedStateName }} School Calendars</h2>
          <ol class="space-y-2">
            <li v-for="(step, index) in statePageData.verificationMethodology" :key="step" class="flex gap-3 text-sm text-gray-700">
              <span class="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">{{ index + 1 }}</span>
              <span>{{ step }}</span>
            </li>
          </ol>
        </div>

        <!-- National calendar data context -->
        <div id="state-calendar-data" class="bg-white rounded-xl border border-gray-200 p-6 scroll-mt-24">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ matchedStateName }} School Calendars in National Context</h2>
          <p class="text-sm text-gray-500 mb-5">
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
            {{ (cal as any).pageHeading || `${district.name} Calendar ${displaySchoolYear}` }}
          </h1>
          <p class="mt-2 text-sm text-gray-500">
            {{ displaySchoolYear }} calendar dates · Based on the official {{ district.shortName || district.name }} calendar ·
            <a href="#add-to-calendar" class="inline-flex min-h-11 items-center underline hover:text-blue-700 transition-colors">Download calendar file</a>
          </p>
          <p class="mt-1 text-xs text-gray-600">
            MySchoolDates is an independent calendar reference and is not affiliated with {{ district.name }}.
          </p>
          <!-- Featured snippet: direct answer for search intent -->
          <p v-if="calendarSummary" class="mt-3 text-sm text-gray-700 leading-relaxed">{{ calendarSummary }}</p>
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
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'"
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
              class="font-medium text-blue-600 hover:underline"
            >
              {{ link.label }}
              <span v-if="link.isExternal" class="sr-only">(opens in a new tab)</span>
            </a>
          </div>
          <div v-if="heroQuickDates.length" id="quick-answer" class="mt-4 rounded-xl border border-gray-200 bg-white p-4 scroll-mt-24">
            <p class="text-sm font-semibold text-gray-900">{{ displaySchoolYear }} Dates at a Glance</p>
            <ul class="mt-2 grid gap-1.5 text-sm text-gray-700 sm:grid-cols-2">
              <li v-for="item in heroQuickDates" :key="`${item.label}-${item.value}`">
                <strong>{{ item.label }}:</strong> {{ item.value }}
              </li>
            </ul>
          </div>
          <p v-if="heroSummaryFacts.length" class="mt-1 text-sm text-gray-500">
            {{ heroSummaryFacts.join(' · ') }}
          </p>
          <dl v-if="!isEstimated && verifiedDate" class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
            <div v-if="!((cal as any).hideHeroReviewedField || (cal as any).meta?.hideHeroReviewedField)">
              <dt class="inline font-semibold uppercase tracking-wide text-gray-600">Reviewed</dt>
              <dd class="ml-1 inline font-medium text-gray-700">{{ verifiedDate }}</dd>
            </div>
            <div>
              <dt class="inline font-semibold uppercase tracking-wide text-gray-600">Reviewed by</dt>
              <dd class="ml-1 inline font-medium">
                <NuxtLink to="/author" class="text-blue-600 hover:underline">{{ editorialAuthorName }}</NuxtLink>
              </dd>
            </div>
            <div v-if="!((cal as any).hideHeroUpdatedField || (cal as any).meta?.hideHeroUpdatedField)">
              <dt class="inline font-semibold uppercase tracking-wide text-gray-600">Updated</dt>
              <dd class="ml-1 inline font-medium text-gray-700">{{ verifiedDate }}</dd>
            </div>
          </dl>
          <!-- Verification badge -->
          <div
            v-if="!((cal as any).hideHeroVerifiedBadge || (cal as any).meta?.hideHeroVerifiedBadge)"
            class="mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
            :class="isEstimated
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-green-50 text-green-700 border border-green-200'"
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
          <details v-if="!isEstimated && verifiedDate && !hideHeroVerificationProcess" class="mt-3 rounded-xl border border-gray-200 bg-white p-3">
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
              <li v-if="!((cal as any).hideHeroVerificationIcs || (cal as any).meta?.hideHeroVerificationIcs)" class="flex items-start gap-1.5">
                <span class="mt-0.5 text-green-700">✓</span>
                <span>ICS file generated from the dates reviewed for this page</span>
              </li>
            </ul>
          </details>
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
          <a v-if="!hiddenSections.has('keyDateCards')" href="#key-dates" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Key Dates</a>
          <a v-if="heroQuickDates.length" href="#quick-answer" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Quick Answer</a>
          <a v-if="summarySectionId" :href="`#${summarySectionId}`" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Summary</a>
          <a v-if="overviewSectionId" :href="`#${overviewSectionId}`" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Overview</a>
          <a v-if="audienceSectionId" :href="`#${audienceSectionId}`" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Who Uses</a>
          <a href="#all-dates" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Dates</a>
          <a v-if="breaks.length && !hiddenSections.has('breaks')" href="#breaks" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Breaks</a>
          <a href="#add-to-calendar" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Download</a>
          <a v-if="downloadGuideSectionId" :href="`#${downloadGuideSectionId}`" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Download Guide</a>
          <a v-if="changesSectionId" :href="`#${changesSectionId}`" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Changes</a>
          <a v-if="highlightsSectionId" :href="`#${highlightsSectionId}`" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Highlights</a>
          <a v-if="termsSectionId" :href="`#${termsSectionId}`" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Terms</a>
          <a v-if="planningSectionId" :href="`#${planningSectionId}`" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Planning</a>
          <a v-if="importantDatesSectionId" :href="`#${importantDatesSectionId}`" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Important Dates</a>
          <a v-if="earlyDismissalSectionId" :href="`#${earlyDismissalSectionId}`" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Early Release</a>
          <a v-if="!hiddenSections.has('comparison')" href="#comparison" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">Comparison</a>
          <a href="#faq" class="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">FAQ</a>
        </nav>

        <DistrictCustomSections :sections="customSections" position="afterVerification" />

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
        <div v-if="!hiddenSections.has('keyDateCards')" id="key-dates" class="scroll-mt-24">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-5">Key Dates</h2>
          <DistrictKeyDateCards :cal="cal" />
        </div>

        <!-- Alternate calendars notice -->
        <div v-if="(cal as any)?.alternateCalendars?.length" class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-amber-800">
            <template v-if="alternateCalendarsNotice">{{ alternateCalendarsNotice }}</template>
            <template v-else>
              This page shows the <strong>Traditional Calendar</strong>, which applies to most {{ district.name }} schools.
              If your child attends a year-round school or specialized program, see
              <a href="#other-calendars" class="underline font-medium">Other Official Calendars</a> below.
            </template>
          </p>
        </div>

        <!-- Key Dates & Holidays Summary -->
        <div
          v-if="!hiddenSections.has('keyDates') && !hiddenSections.has('keyDatesSummary') && keyDateHighlights.length"
          :id="hiddenSections.has('keyDateCards') ? 'key-dates' : undefined"
          class="bg-white rounded-xl border border-gray-200 p-6 scroll-mt-24"
        >
          <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ keyDatesSummaryTitle }}</h2>
          <p class="text-xs text-gray-600 mb-4">{{ keyDatesSummarySubtitle }}</p>
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
                <span class="min-w-0 break-words text-sm text-gray-900">{{ keyDateDisplayName(event) }}</span>
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

        <div v-if="!hiddenSections.has('downloadCta')" class="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-blue-900">
            Download the dates for Google Calendar, Apple Calendar, or Outlook, or view the district's official PDF.
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
        <div v-if="keyDateShortcuts.length" class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
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
        <DistrictCustomSections :sections="customSections" position="afterKeyDates" />

        <!-- Quick Facts (fixed position — moved above Year by Numbers) -->
        <DistrictQuickFacts
          v-if="!hiddenSections.has('quickFacts')"
          :cal="cal"
          :district="district"
          :related-cals="relatedCals ?? []"
          :all-districts="allDistricts ?? []"
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
                :aria-label="district && cal ? `Download ${district.name} ${cal.schoolYear} calendar file` : 'Download calendar file'"
                class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
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
                class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-sm font-medium rounded-lg transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h10M7 11h10M7 15h6M6 3h8l4 4v14H6V3z" />
                </svg>
                {{ (cal as any).sourcePdfUrl ? 'Download PDF' : 'Printable PDF' }}
                <span class="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </template>
        </DistrictTodayStatus>

        <!-- All Dates -->
        <DistrictAllDates
          :events="cal.events"
          :title="allDatesTitle"
          :source-url="(cal?.sourceUrl ?? district.calendarPage) ?? district.officialWebsite"
          :district-name="district.name"
          :verified-date="verifiedDate"
          :legend="dateLegend"
          :mode="allDatesMode"
          :included-dates-in-key-dates="allDatesIncludedDatesInKeyDates"
          :first-day="cal.firstDay"
          :last-day="cal.lastDay"
          :coverage-note="(cal as any).allDatesCoverageNote ?? (cal as any).meta?.allDatesCoverageNote"
        />

        <!-- Break Summary -->
        <div v-if="breaks.length && !hiddenSections.has('breaks')" id="breaks" class="bg-white rounded-xl border border-gray-200 p-6 scroll-mt-24">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ breaksTitle }}</h2>
          <div class="space-y-3">
            <div v-for="b in breaks" :key="b.name" class="flex flex-col items-start gap-2 py-3 border-b border-gray-50 last:border-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div class="font-medium text-gray-900">{{ breakDisplayName(b.name) }}</div>
                <div class="text-sm text-gray-500">{{ formatShortDate(b.start) }} – {{ formatShortDate(b.end) }}</div>
                <p v-if="breakNoteFor(b)" class="mt-1 text-sm text-gray-600">{{ breakNoteFor(b) }}</p>
                <div v-if="todayStr >= b.start && todayStr <= b.end" class="text-xs text-purple-600 mt-0.5 font-medium">
                  In progress
                </div>
              </div>
              <div v-if="!hideBreakDurationBadges" class="self-start text-sm font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full sm:self-auto">{{ breakDurationLabel(b) }}</div>
            </div>
          </div>
        </div>
        <DistrictCustomSections v-if="!hiddenSections.has('breaks')" :sections="customSections" position="afterBreaks" />

        <!-- Add to Calendar + Share -->
        <CalendarExportShare
          :district-name="district.name"
          :year="currentYear"
          :source-url="(cal.sourceUrl ?? district.calendarPage) ?? district.officialWebsite"
          :district="district"
          :cal="cal"
        />
        <DistrictCustomSections :sections="customSections" position="afterCalendarExport" />

        <!-- Other Official Calendars -->
        <DistrictOtherCalendars
          v-if="(cal as any)?.alternateCalendars?.length"
          :alternate-calendars="(cal as any).alternateCalendars"
          :district-name="district.name"
        />
        <DistrictCustomSections :sections="customSections" position="afterOtherCalendars" />

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
                  <div class="font-medium text-gray-900 text-sm">{{ event.name }}</div>
                  <div class="text-xs text-gray-600 mt-0.5">
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
        <div id="year-comparison" class="scroll-mt-24 space-y-8">
          <DistrictYearDiff v-if="!hiddenSections.has('whatsDifferent')" :cal="cal" :prev-cal="prevCal ?? undefined" />
          <DistrictCustomSections :sections="customSections" position="afterYearDiff" />
        </div>

        <!-- Year Switcher -->
        <div v-if="archivedYears.length" class="flex items-center gap-2 flex-wrap">
          <span class="text-sm text-gray-500">Other school years:</span>
          <NuxtLink
            v-for="y in archivedYears"
            :key="y"
            :to="`/${slug}/${y}`"
            class="text-sm px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            {{ displaySchoolYearLabel(y) }}
          </NuxtLink>
        </div>

        <!-- FAQ -->
        <DistrictFaq :cal="cal" :district="district" :faqs="faqs" />

        <!-- Custom Sections: afterFaq -->
        <DistrictCustomSections :sections="customSections" position="afterFaq" />

        <!-- Compare with Nearby Districts -->
        <DistrictComparison v-if="!hiddenSections.has('comparison')" :cal="cal" :district="district" :related-cals="relatedCals ?? []" :all-districts="allDistricts ?? []" :year="currentYear" />
        <DistrictCustomSections :sections="customSections" position="afterComparison" />

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
          v-if="!hiddenSections.has('sources') && (district as any).sources?.length"
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
          v-if="!hiddenSections.has('sources') && !(district as any).sources?.length"
          :cal="cal"
          :district="district"
          :year="currentYear"
        />

        <!-- Related Districts -->
        <DistrictRelatedDistricts
          v-if="!hiddenSections.has('relatedDistricts') && (district as any).relatedDistricts?.length"
          :related-districts="(district as any).relatedDistricts"
          :state-name="district.state"
          :title="(district as any).relatedDistrictsTitle"
          :description="(district as any).relatedDistrictsDescription"
        />

        <section v-if="!hiddenSections.has('nationalTrends')" class="rounded-xl border border-gray-200 bg-white p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ district.shortName || district.name }} in National Calendar Trends</h2>
          <p class="text-sm leading-relaxed text-gray-600">
            To compare this district calendar with broader U.S. start-date, break, and end-date patterns, see the
            <NuxtLink to="/school-calendar-trends/2026-2027-report" class="font-semibold text-blue-600 hover:underline">
              2026-2027 School Calendar Trends Report
            </NuxtLink>.
          </p>
        </section>

      </main>
    </template>
  </div>
</template>
