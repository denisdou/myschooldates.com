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
  const configuredComparisonSlugs = [
    ...(((district.value as any)?.relatedDistricts ?? []) as { slug: string }[]).map(rd => rd.slug),
    ...(((cal.value as any)?.comparisonDistrictSlugs ?? (cal.value as any)?.meta?.comparisonDistrictSlugs ?? []) as string[]),
  ].filter(Boolean)
  if (!configuredComparisonSlugs.length) return []
  const relatedSlugs = new Set(configuredComparisonSlugs)
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

function removeHiddenCustomSections() {
  const hiddenIds = new Set([
    ...(((district.value as any)?.hiddenCustomSectionIds ?? (district.value as any)?.meta?.hiddenCustomSectionIds ?? []) as string[]),
    ...(((cal.value as any)?.hiddenCustomSectionIds ?? (cal.value as any)?.meta?.hiddenCustomSectionIds ?? []) as string[]),
  ])
  if (!hiddenIds.size) return
  if ((district.value as any)?.customSections) {
    ;(district.value as any).customSections = ((district.value as any).customSections as DistrictCustomSection[]).filter(section => !hiddenIds.has(section.id))
  }
  if ((district.value as any)?.meta?.customSections) {
    ;(district.value as any).meta.customSections = ((district.value as any).meta.customSections as DistrictCustomSection[]).filter(section => !hiddenIds.has(section.id))
  }
  if ((cal.value as any)?.customSections) {
    ;(cal.value as any).customSections = ((cal.value as any).customSections as DistrictCustomSection[]).filter(section => !hiddenIds.has(section.id))
  }
  if ((cal.value as any)?.meta?.customSections) {
    ;(cal.value as any).meta.customSections = ((cal.value as any).meta.customSections as DistrictCustomSection[]).filter(section => !hiddenIds.has(section.id))
  }
}
removeHiddenCustomSections()

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
const showSemesterCount = computed(() => (cal.value as any)?.hideSemesterCount !== true && typeof (cal.value as any)?.semesters === 'number')
const hideSecondSemesterStartSummary = computed(() =>
  (cal.value as any)?.hideSecondSemesterStartSummary === true ||
  (cal.value as any)?.meta?.hideSecondSemesterStartSummary === true
)
const heroFactChips = computed(() =>
  (((cal.value as any)?.heroFactChips ?? (cal.value as any)?.meta?.heroFactChips ?? []) as string[]).filter(Boolean)
)
const breaksTitle = computed(() =>
  (cal.value as any)?.breaksTitle ?? (cal.value as any)?.meta?.breaksTitle ?? 'Major School Breaks'
)
const hideBreakDurationBadges = computed(() =>
  Boolean((cal.value as any)?.hideBreakDurationBadges ?? (cal.value as any)?.meta?.hideBreakDurationBadges)
)
const breakNotes = computed<Record<string, string>>(() =>
  ((cal.value as any)?.breakNotes ?? (cal.value as any)?.meta?.breakNotes ?? {}) as Record<string, string>
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

const hiddenSections = computed(() => new Set<string>([
  ...(((district.value as any).hiddenSections ?? []) as string[]),
  ...(((cal.value as any)?.hiddenSections ?? (cal.value as any)?.meta?.hiddenSections ?? []) as string[]),
]))
const comparisonBeforeFaq = computed(() =>
  Boolean((cal.value as any)?.comparisonBeforeFaq ?? (cal.value as any)?.meta?.comparisonBeforeFaq ?? (district.value as any)?.comparisonBeforeFaq ?? (district.value as any)?.meta?.comparisonBeforeFaq)
)
const displaySchoolYear = computed(() =>
  (cal.value as any)?.displaySchoolYear ?? (cal.value as any)?.meta?.displaySchoolYear ?? year
)
function displaySchoolYearLabel(yearValue: string) {
  const match = yearValue.match(/^(\d{4})-(\d{4})$/)
  return match ? `${match[1]}–${match[2]!.slice(2)}` : yearValue
}
const hideHeroVerificationProcess = computed(() =>
  Boolean(slug === 'chicago-public-schools-calendar' || (district.value as any).hideHeroVerificationProcess || (cal.value as any)?.hideHeroVerificationProcess || (cal.value as any)?.meta?.hideHeroVerificationProcess)
)
const verificationBadgeText = computed(() =>
  (cal.value as any)?.verificationBadgeText ?? (cal.value as any)?.meta?.verificationBadgeText ?? (district.value as any)?.verificationBadgeText ?? (district.value as any)?.meta?.verificationBadgeText ?? null
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
const hideAlternateCalendarsNotice = computed(() =>
  Boolean((cal.value as any)?.hideAlternateCalendarsNotice ?? (cal.value as any)?.meta?.hideAlternateCalendarsNotice)
)
const customJumpNavigation = computed(() =>
  (((cal.value as any)?.jumpNavigation ?? (cal.value as any)?.meta?.jumpNavigation ?? []) as Array<{ label?: string, href?: string, id?: string }>).filter(item => item.label && (item.href || item.id))
)

const instructionalDaysLine = computed(() => {
  if ((cal.value as any)?.hideInstructionalDaysSummary === true || (cal.value as any)?.meta?.hideInstructionalDaysSummary === true) {
    return ''
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
const heroSummaryFacts = computed(() => {
  const facts: string[] = []
  if (instructionalDaysLine.value) facts.push(instructionalDaysLine.value)
  if (showSemesterCount.value) facts.push(`${cal.value!.semesters ?? 2} semesters`)
  facts.push(...heroFactChips.value)
  if (!hideSecondSemesterStartSummary.value && secondSemStart.value) facts.push(`Students return from ${winterBreakLabel.value} on ${formatShortDate(secondSemStart.value)}`)
  return facts
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
const customSections = computed(() => {
  const hiddenIds = new Set([
    ...(((district.value as any).hiddenCustomSectionIds ?? (district.value as any).meta?.hiddenCustomSectionIds ?? []) as string[]),
    ...(((cal.value as any)?.hiddenCustomSectionIds ?? (cal.value as any)?.meta?.hiddenCustomSectionIds ?? []) as string[]),
  ])
  return [
    ...(((district.value as any).customSections ?? []) as DistrictCustomSection[]),
    ...(((cal.value as any)?.customSections ?? []) as DistrictCustomSection[]),
    ...(((cal.value as any)?.meta?.customSections ?? []) as DistrictCustomSection[]),
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
const hasBreaksSection = computed(() => breaks.value.length > 0 || customSections.value.some(s => s.position === 'afterBreaks'))
const calendarTrackHelpId = computed(() => {
  const section = customSections.value.find(s =>
    s.id.toLowerCase().includes('calendar-track') ||
    s.label.toLowerCase().includes('calendar track') ||
    s.label.toLowerCase().includes('calendar type')
  )
  return section?.id || (((cal.value as any)?.alternateCalendars?.length) ? 'other-calendars' : 'sources')
})
const allDatesMode = computed(() => {
  const mode = (cal.value as any)?.allDatesMode ?? (cal.value as any)?.meta?.allDatesMode ?? (district.value as any)?.allDatesMode
  return (mode === 'keyDates' ? 'keyDates' : 'all') as 'all' | 'keyDates'
})
const allDatesIncludedDatesInKeyDates = computed(() =>
  (((cal.value as any)?.allDatesIncludedDatesInKeyDates ?? (cal.value as any)?.meta?.allDatesIncludedDatesInKeyDates ?? []) as string[])
)
const allDatesTitle = computed(() =>
  (cal.value as any)?.allDatesTitle ?? (cal.value as any)?.meta?.allDatesTitle ?? (district.value as any)?.allDatesTitle ?? (district.value as any)?.meta?.allDatesTitle ?? (
    allDatesMode.value === 'keyDates'
    ? `Major Student Calendar Dates — ${displaySchoolYear.value}`
    : `All Important Dates — ${displaySchoolYear.value}`
  )
)
const dateLabelOverrides = computed(() =>
  ((cal.value as any)?.dateLegendLabelOverrides ?? (cal.value as any)?.meta?.dateLegendLabelOverrides ?? (district.value as any)?.dateLegendLabelOverrides ?? (district.value as any)?.meta?.dateLegendLabelOverrides ?? {}) as Record<string, string>
)
const dateLegend = computed(() => {
  const legendTypes = new Set((cal.value?.events ?? []).map((event: any) => event.labelType ?? event.type))
  const hasEventType = (types: string[]) =>
    types.some(type => legendTypes.has(type))
  const hasPossibleMakeupDay = (cal.value?.events ?? []).some((event: any) => {
    const name = String(event.name ?? '').toLowerCase()
    return name.includes('possible') && (name.includes('make-up') || name.includes('makeup'))
  })
  const items = [
    ...(hasEventType(['holiday', 'schools_closed', 'schools_offices_closed']) ? [{ label: 'School Closure', dot: 'bg-red-400' }] : []),
    ...(hasEventType(['no_school', 'student_holiday', 'teacher_workday', 'teacher_professional_learning']) ? [{ label: 'No School for Students', dot: 'bg-amber-400' }] : []),
    ...(hasEventType(['partial_closure']) ? [{ label: 'Some Students Off', dot: 'bg-pink-400' }] : []),
    ...(hasEventType(['half_day_high_school', 'half_day_dismissal']) ? [{ label: 'Half-Day Dismissal', dot: 'bg-orange-300' }] : []),
    ...(hasEventType(['early_dismissal', 'early_release']) ? [{ label: 'Early Release', dot: 'bg-orange-400' }] : []),
    ...(hasEventType(['break_start']) || hasPossibleMakeupDay ? [{ label: 'Break', dot: 'bg-purple-400' }] : []),
    ...(hasEventType(['observance']) ? [{ label: 'Observance', dot: 'bg-teal-400' }] : []),
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
  if (!district.value || !cal.value) return []
  const specificFaqs: { q: string; a: string }[] = (district.value as any).districtFaqs ?? []
  const calendarFaqs: { q: string; a: string }[] = (cal.value as any).calendarFaqs ?? []
  const prefersCalendarFirst = (cal.value as any).faqOrderLimit ?? (cal.value as any).meta?.faqOrderLimit ?? (district.value as any).faqOrderLimit ?? (district.value as any).meta?.faqOrderLimit ?? (cal.value as any).faqLimit ?? (cal.value as any).meta?.faqLimit ?? (district.value as any).faqLimit ?? (district.value as any).meta?.faqLimit
  if (typeof prefersCalendarFirst === 'number' && prefersCalendarFirst > 0) {
    return dedupeFaqItems([...calendarFaqs, ...specificFaqs])
  }
  return dedupeFaqItems([...specificFaqs, ...calendarFaqs])
})
const faqs = computed(() => {
  const displayQuestions = dedupeQuestions([
    ...(((district.value as any)?.faqDisplayQuestions ?? (district.value as any)?.meta?.faqDisplayQuestions ?? []) as string[]),
    ...(((cal.value as any)?.faqDisplayQuestions ?? (cal.value as any)?.meta?.faqDisplayQuestions ?? []) as string[]),
  ])
  if (displayQuestions.length) {
    return dedupeFaqItems(displayQuestions
      .map(q => allFaqs.value.find(item => normalizeFaqQuestion(item.q) === normalizeFaqQuestion(q)))
      .filter(Boolean) as { q: string; a: string }[])
  }
  const displayLimit = (cal.value as any)?.faqDisplayLimit ?? (cal.value as any)?.meta?.faqDisplayLimit ?? (district.value as any)?.faqDisplayLimit ?? (district.value as any)?.meta?.faqDisplayLimit ?? (cal.value as any)?.faqLimit ?? (cal.value as any)?.meta?.faqLimit ?? (district.value as any)?.faqLimit ?? (district.value as any)?.meta?.faqLimit
  if (typeof displayLimit === 'number' && displayLimit > 0) {
    return allFaqs.value.slice(0, displayLimit)
  }
  return allFaqs.value
})
const faqSchemaItems = computed(() => {
  if ((cal.value as any).hideFaqSchema || (cal.value as any).meta?.hideFaqSchema || (district.value as any).hideFaqSchema || (district.value as any).meta?.hideFaqSchema) return []
  const limit = (cal.value as any).faqSchemaLimit ?? (cal.value as any).meta?.faqSchemaLimit ?? (district.value as any).faqSchemaLimit ?? (district.value as any).meta?.faqSchemaLimit
  const includeQuestions = dedupeQuestions([
    ...(((district.value as any).faqSchemaQuestions ?? (district.value as any).meta?.faqSchemaQuestions ?? []) as string[]),
    ...(((cal.value as any).faqSchemaQuestions ?? (cal.value as any).meta?.faqSchemaQuestions ?? []) as string[]),
  ])
  const excludes = [
    ...(((district.value as any).faqSchemaExclude ?? (district.value as any).meta?.faqSchemaExclude ?? []) as string[]),
    ...(((cal.value as any).faqSchemaExclude ?? (cal.value as any).meta?.faqSchemaExclude ?? []) as string[]),
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
const schemaLicenseUrl = 'https://myschooldates.com/data-license'

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
const authorPersonEntity = {
  '@type': 'Person',
  '@id': 'https://myschooldates.com/author#person',
  name: editorialAuthorName,
  url: 'https://myschooldates.com/author',
  worksFor: { '@id': 'https://myschooldates.com/#organization' },
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
}
const pageDateCreated = (cal.value as any).dateCreated
const pageDateModified = (cal.value as any).dateModified ?? (cal.value as any).lastVerifiedAt
const pageLastReviewed = (cal.value as any).lastReviewedAt ?? (cal.value as any).lastReviewed ?? (cal.value as any).lastVerifiedAt
const pageDatePublished = (cal.value as any).datePublished
const sourcePdfUrl = (cal.value as any).sourcePdfUrl
const printablePdfPath = (cal.value as any).printablePdfUrl
const printablePdfUrl = typeof printablePdfPath === 'string'
  ? printablePdfPath.startsWith('http') ? printablePdfPath : `https://myschooldates.com${printablePdfPath}`
  : ''
const includePrintablePdfInDatasetDistribution = Boolean(printablePdfUrl) &&
  !((cal.value as any)?.excludePrintablePdfFromDatasetDistribution || (cal.value as any)?.meta?.excludePrintablePdfFromDatasetDistribution)
const sourceUrl = (cal.value as any).sourceUrl ?? district.value.calendarPage
const sourcePdfIsArchivedCopy = typeof sourcePdfUrl === 'string' && sourcePdfUrl.includes('assets.myschooldates.com')
const basedOnUrl = sourcePdfUrl && !sourcePdfIsArchivedCopy ? sourcePdfUrl : sourceUrl
const sourceCalendarName = (cal.value as any).sourceCalendarName ?? (cal.value as any).meta?.sourceCalendarName
  ?? `${district.value.name} ${year} Calendar ${sourcePdfUrl && !sourcePdfIsArchivedCopy ? 'PDF' : 'Source'}`
const sourceVersion = (cal.value as any).sourceVersion ?? (cal.value as any).meta?.sourceVersion
const sourcePageCitationUrl = sourceUrl && sourceUrl !== basedOnUrl ? sourceUrl : ''
const sourceCitation = [
  ...(basedOnUrl ? [{ '@id': `${canonicalUrl}#source-calendar` }] : []),
  ...(sourcePageCitationUrl ? [{ '@id': `${canonicalUrl}#source-calendar-page` }] : []),
]
const calendarTypeName = String((cal.value as any)?.calendarType ?? '').replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
const schemaCalendarName = (cal.value as any)?.schemaCalendarName ?? (cal.value as any)?.meta?.schemaCalendarName ?? (calendarTypeName
  ? `${district.value.name} ${calendarTypeName} Calendar ${year}`
  : `${district.value.name} Calendar ${year}`)
const schemaDatasetName = (cal.value as any)?.schemaDatasetName ?? (cal.value as any)?.meta?.schemaDatasetName ?? `${schemaCalendarName} Dataset`
const datasetDescription = (cal.value as any)?.schemaDatasetDescription ?? (cal.value as any)?.meta?.schemaDatasetDescription ?? (calendarTypeName
  ? `Major ${calendarTypeName} Calendar dates for ${district.value.name} in ${year}, including school-year boundaries, major holidays, break ranges, and school resume dates.`
  : `Major calendar dates for ${district.value.name} in ${year}, including school-year boundaries, major holidays, break ranges, and school resume dates.`)
const schemaCalendarDownloadName = (cal.value as any)?.schemaCalendarDownloadName ?? (cal.value as any)?.meta?.schemaCalendarDownloadName ?? `${schemaCalendarName} calendar file`
const schemaCalendarDownloadDescription = (cal.value as any)?.schemaCalendarDownloadDescription ?? (cal.value as any)?.meta?.schemaCalendarDownloadDescription ?? 'Calendar import file generated from district-published dates checked against the official source used for this page.'
const schemaKeywords = [
  ...(((district.value as any).schemaKeywords ?? (district.value as any).meta?.schemaKeywords ?? []) as string[]),
  ...(((cal.value as any)?.schemaKeywords ?? (cal.value as any)?.meta?.schemaKeywords ?? []) as string[]),
]
const schemaVariableMeasured = (((cal.value as any)?.schemaVariableMeasured ?? (cal.value as any)?.meta?.schemaVariableMeasured ?? []) as string[])
const sourceCalendarEntity = basedOnUrl ? {
  '@type': 'CreativeWork',
  '@id': `${canonicalUrl}#source-calendar`,
  name: sourceCalendarName,
  ...(sourceVersion ? { version: sourceVersion } : {}),
  url: basedOnUrl,
  publisher: { '@id': districtAbout['@id'] },
} : null
const sourceCalendarPageEntity = sourcePageCitationUrl ? {
  '@type': 'WebPage',
  '@id': `${canonicalUrl}#source-calendar-page`,
  name: `${district.value.name} calendar page`,
  url: sourcePageCitationUrl,
  publisher: { '@id': districtAbout['@id'] },
} : null
const calendarIcsUrl = `https://myschooldates.com/calendars/${district.value.slug}-${cal.value.schoolYear}.ics`
const hideDatasetSchema = computed(() => Boolean((cal.value as any)?.hideDatasetSchema || (cal.value as any)?.meta?.hideDatasetSchema))
const spatialCoverageOverride = (cal.value as any)?.schemaSpatialCoverage ?? (cal.value as any)?.meta?.schemaSpatialCoverage ?? (district.value as any)?.schemaSpatialCoverage ?? (district.value as any)?.meta?.schemaSpatialCoverage
const spatialCoverageName = typeof spatialCoverageOverride === 'string'
  ? spatialCoverageOverride
  : spatialCoverageOverride?.name
    ? spatialCoverageOverride.name
  : [district.value.county, district.value.state].filter(Boolean).join(', ')
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
  ...(schemaVariableMeasured.length ? { variableMeasured: schemaVariableMeasured } : {}),
  license: schemaLicenseUrl,
  usageInfo: schemaLicenseUrl,
  inLanguage: 'en-US',
  ...(pageDateCreated ? { dateCreated: pageDateCreated } : {}),
  ...(pageDateModified ? { dateModified: pageDateModified } : {}),
  temporalCoverage: datasetTemporalCoverage.value,
  ...(spatialCoverageName ? {
    spatialCoverage: spatialCoverageName,
  } : {}),
  audience: {
    '@type': 'Audience',
    audienceType: 'Parents and Families',
  },
  creator: { '@id': 'https://myschooldates.com/#organization' },
  publisher: { '@id': 'https://myschooldates.com/#organization' },
  isBasedOn: basedOnUrl ? { '@id': `${canonicalUrl}#source-calendar` } : undefined,
  distribution: [
    {
      '@type': 'DataDownload',
      name: schemaCalendarDownloadName,
      description: schemaCalendarDownloadDescription,
      encodingFormat: 'text/calendar',
      contentUrl: calendarIcsUrl,
    },
    includePrintablePdfInDatasetDistribution ? {
      '@type': 'DataDownload',
      name: `${schemaCalendarName} printable PDF`,
      description: `Printable PDF generated by MySchoolDates from the reviewed ${district.value.shortName ?? district.value.name} ${year} calendar records.`,
      encodingFormat: 'application/pdf',
      contentUrl: printablePdfUrl,
    } : null,
  ].filter(Boolean),
}
const schemaReviewedBySetting = (cal.value as any)?.schemaReviewedBy ?? (cal.value as any)?.meta?.schemaReviewedBy ?? (district.value as any)?.schemaReviewedBy ?? (district.value as any)?.meta?.schemaReviewedBy
const schemaReviewedById = schemaReviewedBySetting === 'author' || !schemaReviewedBySetting
  ? 'https://myschooldates.com/author#person'
  : schemaReviewedBySetting === 'team'
    ? 'https://myschooldates.com/#education-research-team'
    : String(schemaReviewedBySetting)
const siblingYearLinks = availableYears.value
  .filter(y => y !== year)
  .map(y => y === district.value!.currentSchoolYear ? hubUrl : `${hubUrl}/${y}`)
const configuredKeyDateSummaryItems = computed(() =>
  (((cal.value as any)?.keyDateSummaryItems ?? (cal.value as any)?.meta?.keyDateSummaryItems ?? []) as any[])
    .filter(item => item.date || item.start)
    .map(item => ({
      date: item.date ?? item.start,
      endDate: item.endDate ?? item.end,
      name: item.name,
      displayName: item.displayName,
      label: item.label,
      type: item.type ?? 'milestone',
      description: item.description,
      schemaDescription: item.schemaDescription,
    }))
)
const keyDateItemListEvents = computed(() => {
  if (configuredKeyDateSummaryItems.value.length) {
    return configuredKeyDateSummaryItems.value
  }
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
const includeArticleSchema = (district.value as any)?.includeArticleSchema !== false && (district.value as any)?.meta?.includeArticleSchema !== false && (cal.value as any)?.includeArticleSchema !== false && (cal.value as any)?.meta?.includeArticleSchema !== false
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
  ...(datasetEntity
    ? { mainEntity: { '@id': `${canonicalUrl}#calendar-dataset` } }
    : keyDateItemListEvents.value.length
      ? { mainEntity: { '@id': `${canonicalUrl}#key-dates` } }
      : {}),
  ...((datasetEntity || faqSchemaItems.value.length || customSectionSchemaParts.value.length || yearNumbersSchemaParts.value.length)
    ? { hasPart: [
      ...(includeArticleSchema ? [{ '@id': `${canonicalUrl}#calendar-analysis` }] : []),
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
const hideItemListSchema = computed(() => Boolean((cal.value as any)?.hideItemListSchema || (cal.value as any)?.meta?.hideItemListSchema))
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
  const districtLabel = district.value.shortName || district.value.name
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
const keyDateItemListEntity = !hideItemListSchema.value && keyDateItemListEvents.value.length ? {
  '@type': 'ItemList',
  '@id': `${canonicalUrl}#key-dates`,
  name: `${district.value.shortName || district.value.name} ${year} key school calendar dates`,
  itemListElement: keyDateItemListEvents.value.map((event: any, i: number) => {
    const range = event.endDate
      ? { start: event.date, end: event.endDate }
      : event.type === 'break_start'
      ? { start: event.date, end: breaks.value.find((b: any) => b.name === event.name && b.start === event.date)?.end ?? event.date }
      : { start: event.date, end: event.date }
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
const comparisonItems = [
  { district: district.value, calendar: cal.value, url: canonicalUrl },
  ...((relatedCals.value ?? []).slice(0, 3).map((relatedCal: any) => {
    const relatedDistrict = (allDistricts.value ?? []).find((d: any) => d.institutionId === relatedCal.institutionId)
    return relatedDistrict ? { district: relatedDistrict, calendar: relatedCal, url: `https://myschooldates.com/${relatedDistrict.slug}` } : null
  }).filter(Boolean)),
]
const includeComparisonSchema = (district.value as any)?.includeComparisonSchema !== false && (cal.value as any)?.includeComparisonSchema !== false
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
        ...(schemaReviewedById === 'https://myschooldates.com/#education-research-team' ? [reviewTeamEntity] : []),
        authorPersonEntity,
        siteEntity,
        districtAbout,
        ...(sourceCalendarEntity ? [sourceCalendarEntity] : []),
        ...(sourceCalendarPageEntity ? [sourceCalendarPageEntity] : []),
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
  <main class="py-8">

      <section class="district-page-section">
        <div class="district-page-inner space-y-8">
          <!-- Breadcrumb -->
          <Breadcrumb :items="[
            { label: 'Home', href: '/' },
            { label: district!.state, href: `/${district!.state.toLowerCase().replace(/\s+/g, '-')}` },
            { label: district!.name, href: `/${slug}` },
            { label: year },
          ]" />

          <!-- Notice for non-current year (past or future) -->
          <div v-if="!isCurrentYear" class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <svg class="w-5 h-5 text-blue-700 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p class="text-sm text-blue-700">
              You're viewing the <strong>{{ isFutureYear ? 'upcoming' : 'archived' }} {{ year }}</strong> calendar.
              <NuxtLink :to="`/${slug}`" class="underline font-medium">View the current {{ district!.currentSchoolYear }} calendar →</NuxtLink>
            </p>
          </div>

          <!-- Title -->
          <div>
        <h1 class="text-3xl font-bold text-gray-900">
          {{ (cal as any).pageHeading || `${district!.name} Calendar ${displaySchoolYear}` }}
        </h1>
        <p class="mt-2 text-sm text-[#7b756d]">
          {{ (cal as any).heroSourceLine ?? (cal as any).meta?.heroSourceLine ?? `${displaySchoolYear} calendar dates · Based on the official ${district!.shortName || district!.name} calendar` }} ·
          <a href="#add-to-calendar" class="inline-flex min-h-11 items-center underline hover:text-[#0f5d6b] transition-colors">Download calendar file</a>
        </p>
        <div class="mt-3 text-[hsl(var(--rds-ink-muted)/1)] leading-relaxed space-y-2">
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
          <div v-if="heroQuickDates.length" class="mt-4 rounded-lg border border-rds-hairline bg-rds-surface-panel p-4">
            <p class="text-sm font-semibold text-gray-900">{{ displaySchoolYear }} Dates at a Glance</p>
            <ul class="mt-2 grid gap-1.5 text-sm text-gray-700 sm:grid-cols-2">
              <li v-for="item in heroQuickDates" :key="`${item.label}-${item.value}`">
                <strong>{{ item.label }}:</strong> {{ item.value }}
              </li>
            </ul>
          </div>
          <p v-if="heroSummaryFacts.length" class="mt-3 text-sm text-[#7b756d]">
            {{ heroSummaryFacts.join(' · ') }}
          </p>
          <p class="mt-2 text-xs text-gray-600">
            MySchoolDates is an independent calendar reference and is not affiliated with {{ district!.name }}.
          </p>
          <dl
            v-if="verifiedDate && (!((cal as any).hideHeroReviewedField || (cal as any).meta?.hideHeroReviewedField) || !((cal as any).hideHeroReviewedByField || (cal as any).meta?.hideHeroReviewedByField) || !((cal as any).hideHeroUpdatedField || (cal as any).meta?.hideHeroUpdatedField))"
            class="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500"
          >
            <div v-if="!((cal as any).hideHeroReviewedField || (cal as any).meta?.hideHeroReviewedField)">
              <dt class="inline font-semibold uppercase tracking-wide text-gray-600">Reviewed</dt>
              <dd class="ml-1 inline font-medium text-gray-700">{{ verifiedDate }}</dd>
            </div>
            <div v-if="!((cal as any).hideHeroReviewedByField || (cal as any).meta?.hideHeroReviewedByField)">
              <dt class="inline font-semibold uppercase tracking-wide text-gray-600">Reviewed by</dt>
              <dd class="ml-1 inline font-medium">
                <NuxtLink to="/author" class="text-[#0f5d6b] hover:underline">{{ editorialAuthorName }}</NuxtLink>
              </dd>
            </div>
            <div v-if="!((cal as any).hideHeroUpdatedField || (cal as any).meta?.hideHeroUpdatedField)">
              <dt class="inline font-semibold uppercase tracking-wide text-gray-600">Updated</dt>
              <dd class="ml-1 inline font-medium text-gray-700">{{ verifiedDate }}</dd>
            </div>
          </dl>
          <div v-if="verifiedDate && !((cal as any).hideHeroVerifiedBadge || (cal as any).meta?.hideHeroVerifiedBadge)" class="mt-5 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200">
            <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" focusable="false">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span>{{ verificationBadgeText || `Checked against the official ${district.shortName || district.name} calendar on ${verifiedDate}.` }}</span>
          </div>
          <details v-if="verifiedDate && !hideHeroVerificationProcess" class="mt-5 rounded-lg border border-rds-hairline bg-rds-surface-panel p-3">
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
          </div>
        </div>
      </section>

      <nav v-if="customJumpNavigation.length" aria-label="Page sections" class="sticky top-0 z-20 my-8 border-y border-[#ddd7cc] bg-[#f7f5f0]/95 backdrop-blur">
        <div class="district-page-inner flex items-center gap-7 overflow-x-auto py-4 text-sm">
          <span class="flex-shrink-0 font-semibold text-[#7b756d]">On this page</span>
          <a
            v-for="item in customJumpNavigation"
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
          <a v-if="summarySectionId" :href="`#${summarySectionId}`" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Summary</a>
          <a v-if="overviewSectionId" :href="`#${overviewSectionId}`" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Overview</a>
          <a href="#add-to-calendar" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">PDF &amp; Calendar</a>
          <a v-if="downloadGuideSectionId" :href="`#${downloadGuideSectionId}`" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Download Guide</a>
          <a href="#all-dates" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Dates</a>
          <a v-if="hasBreaksSection" href="#breaks" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Breaks</a>
          <a v-if="changesSectionId" :href="`#${changesSectionId}`" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Changes</a>
          <a v-if="planningSectionId" :href="`#${planningSectionId}`" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Planning</a>
          <a v-if="importantDatesSectionId" :href="`#${importantDatesSectionId}`" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Important Dates</a>
          <a v-if="earlyDismissalSectionId" :href="`#${earlyDismissalSectionId}`" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Early Dismissal</a>
          <a v-if="!hiddenSections.has('comparison')" href="#comparison" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">Comparison</a>
          <a href="#faq" class="flex-shrink-0 font-medium text-[#5f625d] hover:text-[#0f5d6b] transition-colors">FAQ</a>
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

      <div v-if="!hiddenSections.has('downloadCta')" class="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-blue-900">
          Download the dates for Google Calendar, Apple Calendar, or Outlook, or view the district's official PDF.
        </p>
        <div class="flex flex-wrap gap-2">
          <a
            href="#add-to-calendar"
            class="inline-flex items-center justify-center rounded-lg bg-[#0f5d6b] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0b4c58] transition-colors"
          >
            Download ICS Calendar
          </a>
          <a
            v-if="(cal as any).sourcePdfUrl || (cal as any).printablePdfUrl"
            :href="(cal as any).sourcePdfUrl || (cal as any).printablePdfUrl"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center justify-center rounded-lg border border-[#d9d2c7] bg-[#fbfaf7] px-3 py-2 text-sm font-semibold text-[#0f5d6b] hover:border-[#b8c9c9] hover:bg-[#e6f0ef] transition-colors"
          >
            {{ (cal as any).sourcePdfUrl ? 'Download PDF' : 'Download Printable PDF' }}
            <span class="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>

      <!-- Today / Year Status -->
      <DistrictTodayStatus v-if="!hiddenSections.has('todayStatus')" :cal="cal!" />

      <!-- Alternate calendars notice -->
      <div v-if="(cal as any)?.alternateCalendars?.length && !hideAlternateCalendarsNotice" class="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
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
      <div v-if="hiddenSections.has('keyDateCards')" id="key-dates" class="scroll-mt-24" />
      <DistrictAllDates
        :events="cal!.events"
        :title="allDatesTitle"
        :source-url="(cal as any).allDatesSourceUrl ?? (cal as any).meta?.allDatesSourceUrl ?? cal!.sourceUrl ?? district!.officialWebsite"
        :source-label="(cal as any).allDatesSourceLabel ?? (cal as any).meta?.allDatesSourceLabel"
        :source-suffix="(cal as any).allDatesSourceSuffix ?? (cal as any).meta?.allDatesSourceSuffix"
        :correction-source-url="(cal as any).allDatesCorrectionSourceUrl ?? (cal as any).meta?.allDatesCorrectionSourceUrl"
        :correction-source-label="(cal as any).allDatesCorrectionSourceLabel ?? (cal as any).meta?.allDatesCorrectionSourceLabel"
        :district-name="district!.name"
        :verified-date="verifiedDate"
        :legend="dateLegend"
        :label-overrides="dateLabelOverrides"
        :mode="allDatesMode"
        :footer-mode="(cal as any).allDatesFooterMode ?? (cal as any).meta?.allDatesFooterMode"
        :included-dates-in-key-dates="allDatesIncludedDatesInKeyDates"
        :first-day="cal!.firstDay"
        :last-day="cal!.lastDay"
        :coverage-note="(cal as any).allDatesCoverageNote ?? (cal as any).meta?.allDatesCoverageNote"
        :legend-style="(cal as any).dateLegendStyle ?? (cal as any).meta?.dateLegendStyle"
      />
      <DistrictCustomSections :sections="customSections" position="afterAllDates" />

      <!-- Break Summary -->
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

      <!-- Add to Calendar + Share -->
      <CalendarExportShare
        :district-name="district!.name"
        :year="year"
        :source-url="cal!.sourceUrl ?? district!.officialWebsite"
        :district="district!"
        :cal="cal!"
      />
      <DistrictCustomSections :sections="customSections" position="afterCalendarExport" />

      <!-- Custom Sections: afterBreaks (year pages render this after the full date list) -->
      <div v-if="!breaks.length" id="breaks" class="scroll-mt-24">
        <DistrictCustomSections v-if="!hiddenSections.has('breaks')" :sections="customSections" position="afterBreaks" />
      </div>
      <DistrictCustomSections v-else-if="!hiddenSections.has('breaks')" :sections="customSections" position="afterBreaks" />

      <!-- Other Official Calendars -->
      <DistrictOtherCalendars
        v-if="(cal as any)?.alternateCalendars?.length"
        :alternate-calendars="(cal as any).alternateCalendars"
        :district-name="district!.name"
        :title="(cal as any).alternateCalendarsTitle ?? (cal as any).meta?.alternateCalendarsTitle"
        :description="(cal as any).alternateCalendarsDescription ?? (cal as any).meta?.alternateCalendarsDescription"
        :button-label="(cal as any).alternateCalendarsButtonLabel ?? (cal as any).meta?.alternateCalendarsButtonLabel"
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
        <span class="text-sm text-[#7b756d]">Other school years:</span>
        <NuxtLink
          v-for="y in availableYears"
          :key="y"
          :to="yearLink(y)"
          class="text-sm px-3 py-1 rounded-lg border transition-colors"
          :class="y === year ? 'border-[#b8c9c9] bg-[#e6f0ef] text-[#0f5d6b] font-medium' : 'border-[#d9d2c7] text-[#6b645c] hover:border-[#b8c9c9] hover:text-[#0f5d6b]'"
        >
          {{ displaySchoolYearLabel(y) }}
        </NuxtLink>
      </div>

      <!-- Calendar Context + About -->
      <DistrictCalendarAbout v-if="!hiddenSections.has('about')" :cal="cal!" :district="district!" />

      <!-- Custom Sections: afterAbout (default position) -->
      <DistrictCustomSections :sections="customSections" position="afterAbout" />

      <!-- Compare with Nearby Districts -->
      <template v-if="comparisonBeforeFaq">
        <DistrictComparison v-if="!hiddenSections.has('comparison')" :cal="cal!" :district="district!" :related-cals="relatedCals ?? []" :all-districts="allDistricts ?? []" :year="year" />
        <DistrictCustomSections :sections="customSections" position="afterComparison" />
      </template>

      <!-- FAQ -->
      <DistrictFaq :cal="cal!" :district="district!" :faqs="faqs" />

      <!-- Custom Sections: afterFaq -->
      <DistrictCustomSections :sections="customSections" position="afterFaq" />

      <!-- Compare with Nearby Districts -->
      <template v-if="!comparisonBeforeFaq">
        <DistrictComparison v-if="!hiddenSections.has('comparison')" :cal="cal!" :district="district!" :related-cals="relatedCals ?? []" :all-districts="allDistricts ?? []" :year="year" />
        <DistrictCustomSections :sections="customSections" position="afterComparison" />
      </template>

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

      <!-- Custom Sections: beforeSources -->
      <DistrictCustomSections :sections="customSections" position="beforeSources" />

      <!-- Sources -->
      <DistrictSources
        v-if="!hiddenSections.has('sources') && (district as any).sources?.length"
        :sources="(district as any).sources"
        :district-name="district!.name"
        :short-name="district!.shortName || district!.name"
        :year="year"
        :verified-date="verifiedDate"
        :source-version="(cal as any).sourceVersion"
        :source-pdf-url="(cal as any).sourcePdfUrl"
        :review-summary="(cal as any).sourceReviewSummary ?? (cal as any).meta?.sourceReviewSummary"
        :review-details="(cal as any).sourceReviewDetails ?? (cal as any).meta?.sourceReviewDetails"
      />

      <!-- Data quality notice -->
      <DistrictDataQuality
        v-if="!hiddenSections.has('sources') && !(district as any).sources?.length"
        :cal="cal!"
        :district="district!"
        :year="year"
      />

      <!-- Related Districts -->
      <DistrictRelatedDistricts
        v-if="!hiddenSections.has('relatedDistricts') && (district as any).relatedDistricts?.length"
        :related-districts="(district as any).relatedDistricts"
        :state-name="district!.state"
        :title="(district as any).relatedDistrictsTitle"
        :description="(district as any).relatedDistrictsDescription"
      />

      <section v-if="!hiddenSections.has('nationalTrends')" class="rounded-lg border border-rds-hairline bg-rds-surface-panel p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ district!.shortName || district!.name }} in National Calendar Trends</h2>
        <p class="text-sm leading-relaxed text-gray-600">
          To compare this district calendar with broader U.S. start-date, break, and end-date patterns, see the
          <NuxtLink to="/school-calendar-trends/2026-2027-report" class="font-semibold text-[#0f5d6b] hover:underline">
            2026-2027 School Calendar Trends Report
          </NuxtLink>.
        </p>
      </section>

      <!-- Back to current -->
      <div class="text-center">
        <NuxtLink :to="`/${slug}`" class="text-[#0f5d6b] hover:text-[#0b4c58] text-sm font-medium">
          ← Back to {{ district!.name }} current calendar ({{ district!.currentSchoolYear }})
        </NuxtLink>
      </div>
      </div>

  </main>
</template>
