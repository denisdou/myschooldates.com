<script setup lang="ts">
const route = useRoute()
const slug = route.params.district as string
const { formatDate, formatShortDate, daysUntil, getBreaks, getSecondSemesterStart, generateFaqs, downloadICS, eventTypeLabel, eventTypeColor } = useDistrictPage()

// Load all data in parallel (allDistricts needed for state detection)
const [{ data: allDistricts }, { data: district }, { data: allCals }, { data: statePageData }] = await Promise.all([
  useAsyncData('districts-all', () => queryCollection('districts').order('name', 'ASC').all()),
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
  const stateDesc = `Official ${stateCurrentYear} school calendars for ${stateDistricts.length} public school district${stateDistricts.length !== 1 ? 's' : ''} in ${matchedStateName}. First day of school, spring break, winter break, and all important dates.`
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
          description: `Official ${stateCurrentYear} school calendars for ${stateDistricts.length} public school districts in ${matchedStateName}.`,
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
        ...(statePageData.value?.faqs?.length ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: statePageData.value.faqs.map((f: { q: string; a: string }) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }] : []),
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

const stateCalsMap = computed(() => {
  const map: Record<string, string> = {}
  for (const c of stateCals.value ?? []) {
    map[c.institutionId] = c.firstDay
  }
  return map
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
  return (all ?? []).filter(c => relatedIds.includes(c.institutionId) && c.schoolYear === year)
})

// ── District page logic ────────────────────────────────────────────────────
const currentYear = district.value?.currentSchoolYear ?? ''
const cal = allCals.value?.find(y => y.schoolYear === currentYear) ?? null
const meta = district

const archivedYears = computed(() =>
  (allCals.value ?? []).filter(y => y.schoolYear !== currentYear).map(y => y.schoolYear)
)
const daysUntilStart = computed(() => cal ? daysUntil(cal.firstDay) : 0)
const today = new Date(); today.setHours(0, 0, 0, 0)
const nextEvent = computed(() =>
  cal?.events.find(e => new Date(e.date + 'T00:00:00') >= today) ?? null
)
const breaks = computed(() => getBreaks(cal?.events ?? []))

const keyDateHighlights = computed(() => {
  if (!cal?.events) return []
  const HIGHLIGHT_TYPES = new Set(['school_start', 'school_end', 'holiday', 'break_start'])
  return cal.events.filter(e => HIGHLIGHT_TYPES.has(e.type))
})

const calendarSummary = computed(() => {
  if (!cal || !district.value) return ''
  const springBreak = breaks.value.find(b => b.name.toLowerCase().includes('spring'))
  const springPart = springBreak
    ? ` Spring Break runs ${formatShortDate(springBreak.start)}–${formatShortDate(springBreak.end)}.`
    : ''
  return `${district.value.name} starts the ${currentYear} school year on ${formatDate(cal.firstDay)} and ends on ${formatDate(cal.lastDay)}.${springPart}`
})

const faqs = computed(() => {
  if (!cal || !district.value) return []
  const specificFaqs: { q: string; a: string }[] = (district.value as any).districtFaqs ?? []
  const allTemplateFaqs = generateFaqs(district.value, cal, district.value.officialWebsite)

  const TARGET = 8
  const needed = Math.max(0, TARGET - specificFaqs.length)
  if (needed === 0) return specificFaqs.slice(0, TARGET)

  // Calendar characteristics drive FAQ scoring
  const hasFallBreak = breaks.value.some(b => b.name.toLowerCase().includes('fall'))
  const hasSpringBreak = breaks.value.some(b => b.name.toLowerCase().includes('spring'))
  const hasWinterBreak = breaks.value.some(b =>
    b.name.toLowerCase().includes('winter') || b.name.toLowerCase().includes('christmas'))
  const hasThanksgiving = breaks.value.some(b => b.name.toLowerCase().includes('thanksgiving'))
  const hasSemStart = !!secondSemStart.value
  const hasTeacherDays = !!(cal.teacherWorkDays && cal.teacherWorkDays > 0)

  // Topic overlap: skip template FAQ if specific FAQs already address the same topic
  const specificLower = specificFaqs.map(f => f.q.toLowerCase())
  const hasOverlap = (keywords: string[]) =>
    keywords.some(kw => specificLower.some(q => q.includes(kw)))

  // Base scores per template FAQ index (matches generateFaqs output order 0-13)
  const scored: { idx: number; score: number }[] = [
    { idx: 0,  score: hasFallBreak ? 95 : 65 },      // fallBreak — searched either way ("does X have fall break?")
    { idx: 1,  score: 80 },                           // googleCalendar — conversion-critical, always useful
    { idx: 2,  score: 52 },                           // travelPlanning — capped so idx 8 (spring break dates) wins when spring break exists
    { idx: 3,  score: 55 },                           // earlyRelease
    { idx: 4,  score: 50 },                           // officialSource
    { idx: 5,  score: 88 },                           // schoolStart — highest-demand query
    { idx: 6,  score: 85 },                           // lastDay — equally high demand
    { idx: 7,  score: hasSemStart ? 75 : 48 },        // secondSemester
    { idx: 8,  score: hasSpringBreak ? 90 : 38 },     // springBreakDate
    { idx: 9,  score: hasWinterBreak ? 85 : 52 },     // winterBreakDate
    { idx: 10, score: hasThanksgiving ? 78 : 48 },    // thanksgiving
    { idx: 11, score: 62 },                           // instructionalDays
    { idx: 12, score: hasTeacherDays ? 80 : 42 },     // teacherWorkDays
    { idx: 13, score: 56 },                           // holidays
  ]

  // Keywords that indicate overlap with specific FAQs
  const overlapKeywords: Record<number, string[]> = {
    0:  ['fall break'],
    2:  ['spring break', 'travel'],
    5:  ['school start', 'first day'],
    6:  ['last day'],
    7:  ['second semester'],
    8:  ['spring break'],
    9:  ['winter break'],
    10: ['thanksgiving'],
    11: ['instructional days', 'school days'],
    12: ['teacher work', 'teacher'],
    13: ['holiday'],
  }

  const slug = district.value.slug
  const selected = scored
    .filter(s => { const kws = overlapKeywords[s.idx]; return !kws || !hasOverlap(kws) })
    .sort((a, b) => b.score !== a.score ? b.score - a.score : simpleHash(String(a.idx) + slug) - simpleHash(String(b.idx) + slug))
    .slice(0, needed)
    .map(s => s.idx)
    .sort((a, b) => a - b) // restore original topic order for readability

  const templateSelected = selected.map(i => allTemplateFaqs[i]).filter((f): f is { q: string; a: string } => f !== undefined)
  return [...specificFaqs, ...templateSelected]
})
const secondSemStart = computed(() => cal ? getSecondSemesterStart(cal.events) : '')

// Today status — answers "is school in session right now?"
const todayStr = (() => {
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})()

const todayStatus = computed(() => {
  if (!cal) return null
  if (todayStr < cal.firstDay) {
    const d = daysUntilStart.value
    return { type: 'upcoming', headline: d === 0 ? 'School starts today!' : d === 1 ? 'School starts tomorrow' : `School starts in ${d} days`, detail: `First day: ${formatShortDate(cal.firstDay)}`, color: 'blue' }
  }
  if (todayStr > cal.lastDay) {
    return { type: 'ended', headline: 'School year has ended', detail: `Last day was ${formatShortDate(cal.lastDay)}`, color: 'gray' }
  }
  for (const b of breaks.value) {
    if (todayStr >= b.start && todayStr <= b.end) {
      const d = daysUntil(b.end)
      return { type: 'break', headline: b.name, detail: `${d + 1} day${d !== 0 ? 's' : ''} remaining`, color: 'purple' }
    }
  }
  const holiday = cal.events.find(e => e.date === todayStr && (e.type === 'holiday' || e.type === 'no_school'))
  if (holiday) {
    return { type: 'holiday', headline: `No school today — ${holiday.name}`, detail: nextEvent.value ? `Next school event: ${formatShortDate(nextEvent.value.date)}` : '', color: 'amber' }
  }
  return { type: 'school', headline: 'School is in session', detail: nextEvent.value ? `Next: ${nextEvent.value.name} — ${formatShortDate(nextEvent.value.date)}` : '', color: 'green' }
})

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
  // Break starting within 14 days: surface it first so families can plan
  const breakSoon = breaks.value.some(b => { const d = daysUntil(b.start); return d >= 0 && d <= 14 })
  if (breakSoon) return ['breaks', 'upcoming', 'about']
  // Calendar context always comes last — users want dates first, context after
  return ['upcoming', 'breaks', 'about']
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
const yearComparison = computed(() => {
  if (!prevCal.value) return ''
  const prevBreaks = getBreaks(prevCal.value.events)
  const curSpring = breaks.value.find(b => b.name.toLowerCase().includes('spring'))
  const prevSpring = prevBreaks.find(b => b.name.toLowerCase().includes('spring'))
  if (!curSpring || !prevSpring) return ''
  // Compare MM-DD only — avoids ~357-day error when comparing absolute dates across school years
  const curMD = curSpring.start.slice(5)
  const prevMD = prevSpring.start.slice(5)
  const diff = Math.round(
    (new Date(`2000-${curMD}T00:00:00`).getTime() - new Date(`2000-${prevMD}T00:00:00`).getTime())
    / (1000 * 60 * 60 * 24)
  )
  if (diff === 0) return `Spring break starts on the same date as ${prevYear.value}.`
  if (diff > 0) return `Compared to ${prevYear.value}, spring break starts ${diff} day${diff !== 1 ? 's' : ''} later this year.`
  return `Compared to ${prevYear.value}, spring break starts ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} earlier this year.`
})

// ── Dynamic Metrics: types ─────────────────────────────────────────────────
type MetricPool = {
  // Quick Facts candidates
  nextStudentDayOff:           { name: string; date: string; daysUntil: number } | null
  nextHoliday:                 { name: string; date: string; daysUntil: number } | null
  nextTeacherWorkday:          { name: string; date: string; daysUntil: number } | null
  nextBreak:                   { name: string; start: string; daysUntil: number } | null
  longestBreak:                { name: string; days: number; start: string; end: string } | null
  breakCount:                  number
  daysUntilSpringBreak:        number | null
  springBreakStart:            string | null
  daysUntilWinterBreak:        number | null
  daysBeforeLaborDay:          number | null
  teacherWorkDays:             number | null
  startDiffNearest:            { days: number; direction: 'earlier' | 'later' | 'same'; vsName: string } | null
  lastDayDiffNearest:          { days: number; direction: 'earlier' | 'later' | 'same'; vsName: string } | null
  // Year by Numbers candidates
  schoolWeeks:                 number
  totalDaysOff:                number
  winterBreakLength:           number | null
  winterBreakStart:            string | null
  winterBreakEnd:              string | null
  longestInstructionalStretch: { weeks: number; start: string; end: string } | null
  instructionalDays:           number
  springBreakVsPrevYear:       string | null
  springBreakDiffDays:         number | null
  firstDay:                    string
  lastDay:                     string
  holidayCount:                number
  instructionWeeks:            number
  secondSemStart:              string | null
  breakdownText:               string | null
}

type FactItem = {
  key:   string
  value: string
  label: string
}

type NumberCard = {
  key:         string
  label:       string
  value:       number
  unit:        string
  description: string
}

// ── Dynamic Metrics: helpers ───────────────────────────────────────────────
function getLaborDay(year: number): string {
  // First Monday of September
  const sept1 = new Date(year, 8, 1)
  const dow = sept1.getDay() // 0=Sun, 1=Mon…
  const offset = dow === 1 ? 0 : dow === 0 ? 1 : 8 - dow
  const day = 1 + offset
  const mm = '09'
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function simpleHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function countWeekdays(from: string, to: string): number {
  if (from > to) return 0
  let count = 0
  const d = new Date(from + 'T00:00:00')
  const end = new Date(to + 'T00:00:00')
  while (d <= end) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) count++
    d.setDate(d.getDate() + 1)
  }
  return count
}

function shiftDay(dateStr: string, delta: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}

// ── Dynamic Metrics: pool computation ─────────────────────────────────────
function computeMetricPool(
  cal: any,
  breaksVal: { name: string; start: string; end: string; days: number }[],
  relatedCalsVal: any[],
  allDistrictsVal: any[],
  todayStrVal: string,
  daysUntilFn: (d: string) => number,
  schoolWeeksVal: number,
  daysOffCountVal: number,
  winterBreakDaysVal: number,
  prevCalVal: any,
  yearComparisonVal: string,
): MetricPool {
  const events: { date: string; type: string; name: string }[] = cal.events ?? []
  const holidayCount = events.filter(e => e.type === 'holiday' || e.type === 'no_school').length
  const instructionWeeks = Math.round((cal.totalSchoolDays ?? 180) / 5)

  // ── nextStudentDayOff ──────────────────────────────────────────────────
  const nextSdoEvt = events
    .filter(e => e.date >= todayStrVal && (e.type === 'holiday' || e.type === 'no_school' || e.type === 'break_start'))
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
  const nextStudentDayOff = nextSdoEvt
    ? { name: nextSdoEvt.name, date: nextSdoEvt.date, daysUntil: daysUntilFn(nextSdoEvt.date) }
    : null

  // ── nextHoliday ────────────────────────────────────────────────────────
  const nextHolEvt = events
    .filter(e => e.date >= todayStrVal && e.type === 'holiday')
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
  const nextHoliday = nextHolEvt
    ? { name: nextHolEvt.name, date: nextHolEvt.date, daysUntil: daysUntilFn(nextHolEvt.date) }
    : null

  // ── nextTeacherWorkday ─────────────────────────────────────────────────
  const nextTwdEvt = events
    .filter(e => e.date >= todayStrVal && e.type === 'teacher_workday')
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
  const nextTeacherWorkday = nextTwdEvt
    ? { name: nextTwdEvt.name, date: nextTwdEvt.date, daysUntil: daysUntilFn(nextTwdEvt.date) }
    : null

  // ── nextBreak ──────────────────────────────────────────────────────────
  const nextBreakObj = [...breaksVal]
    .sort((a, b) => a.start.localeCompare(b.start))
    .find(b => b.start >= todayStrVal) ?? null
  const nextBreak = nextBreakObj
    ? { name: nextBreakObj.name, start: nextBreakObj.start, daysUntil: daysUntilFn(nextBreakObj.start) }
    : null

  // ── longestBreak ───────────────────────────────────────────────────────
  const longestBreak = breaksVal.length === 0 ? null
    : breaksVal.reduce((max, b) => b.days > max.days ? b : max, breaksVal[0]!)

  // ── springBreak ────────────────────────────────────────────────────────
  const springBreak = breaksVal.find(b => b.name.toLowerCase().includes('spring')) ?? null
  const springBreakStart = springBreak ? springBreak.start : null
  const daysUntilSpringBreak = springBreak && springBreak.start >= todayStrVal
    ? daysUntilFn(springBreak.start)
    : null

  // ── daysBeforeLaborDay ─────────────────────────────────────────────────
  const firstDayYear = parseInt(cal.firstDay.slice(0, 4))
  const laborDay = getLaborDay(firstDayYear)
  const daysBeforeLaborDay = cal.firstDay < laborDay
    ? Math.round((new Date(laborDay + 'T00:00:00').getTime() - new Date(cal.firstDay + 'T00:00:00').getTime()) / 86400000)
    : null

  // ── teacherWorkDays ────────────────────────────────────────────────────
  const teacherWorkDays = (cal.teacherWorkDays && cal.teacherWorkDays > 0) ? cal.teacherWorkDays : null

  // ── startDiffNearest / lastDayDiffNearest ──────────────────────────────
  let startDiffNearest: MetricPool['startDiffNearest'] = null
  let lastDayDiffNearest: MetricPool['lastDayDiffNearest'] = null
  let bestStartAbsDiff = Infinity
  let bestLastAbsDiff = Infinity
  for (const rc of relatedCalsVal) {
    const relDistrict = allDistrictsVal.find((d: any) => d.institutionId === rc.institutionId)
    if (!relDistrict) continue
    const fullName = relDistrict.name as string
    const vsName = (() => {
      for (const suffix of [' County', ' Unified', ' Public', ' Independent', ' ISD', ' USD', ' City', ' Municipal']) {
        const idx = fullName.indexOf(suffix)
        if (idx > 0) return fullName.slice(0, idx)
      }
      return fullName.split(' ').slice(0, 2).join(' ')
    })()

    const startDiff = Math.round((new Date(rc.firstDay + 'T00:00:00').getTime() - new Date(cal.firstDay + 'T00:00:00').getTime()) / 86400000)
    if (Math.abs(startDiff) < bestStartAbsDiff) {
      bestStartAbsDiff = Math.abs(startDiff)
      startDiffNearest = {
        days: Math.abs(startDiff),
        direction: startDiff > 0 ? 'earlier' : startDiff < 0 ? 'later' : 'same',
        vsName,
      }
    }

    const lastDiff = Math.round((new Date(rc.lastDay + 'T00:00:00').getTime() - new Date(cal.lastDay + 'T00:00:00').getTime()) / 86400000)
    if (Math.abs(lastDiff) < bestLastAbsDiff) {
      bestLastAbsDiff = Math.abs(lastDiff)
      lastDayDiffNearest = {
        days: Math.abs(lastDiff),
        direction: lastDiff > 0 ? 'earlier' : lastDiff < 0 ? 'later' : 'same',
        vsName,
      }
    }
  }

  // ── winterBreak ────────────────────────────────────────────────────────
  const winterBreakObj = breaksVal.find(b =>
    b.name.toLowerCase().includes('winter') ||
    b.name.toLowerCase().includes('christmas') ||
    b.name.toLowerCase().includes('december')
  ) ?? null

  const daysUntilWinterBreak = winterBreakObj && winterBreakObj.start > todayStrVal
    ? daysUntilFn(winterBreakObj.start)
    : null

  // ── longestInstructionalStretch ────────────────────────────────────────
  type Period = { start: string; end: string }
  const closed: Period[] = [
    ...breaksVal.map(b => ({ start: b.start, end: b.end })),
    ...events
      .filter(e => e.type === 'holiday' || e.type === 'no_school')
      .map(e => ({ start: e.date, end: e.date })),
  ].sort((a, b) => a.start.localeCompare(b.start))

  // Merge overlapping/adjacent periods
  const merged: Period[] = []
  for (const p of closed) {
    const last = merged[merged.length - 1]
    if (!last || p.start > shiftDay(last.end, 1)) {
      merged.push({ ...p })
    } else if (p.end > last.end) {
      last.end = p.end
    }
  }

  let longestInstructionalStretch: MetricPool['longestInstructionalStretch'] = null
  let longestWd = 0

  // Gap: firstDay → first closed period
  if (merged.length > 0) {
    const gapEnd = shiftDay(merged[0]!.start, -1)
    if (cal.firstDay <= gapEnd) {
      const wd = countWeekdays(cal.firstDay, gapEnd)
      if (wd > longestWd) { longestWd = wd; longestInstructionalStretch = { weeks: Math.round(wd / 5), start: cal.firstDay, end: gapEnd } }
    }
  }
  // Gaps between consecutive closed periods
  for (let i = 0; i < merged.length - 1; i++) {
    const gapStart = shiftDay(merged[i]!.end, 1)
    const gapEnd = shiftDay(merged[i + 1]!.start, -1)
    if (gapStart <= gapEnd) {
      const wd = countWeekdays(gapStart, gapEnd)
      if (wd > longestWd) { longestWd = wd; longestInstructionalStretch = { weeks: Math.round(wd / 5), start: gapStart, end: gapEnd } }
    }
  }
  // Gap: last closed period → lastDay
  if (merged.length > 0) {
    const gapStart = shiftDay(merged[merged.length - 1]!.end, 1)
    if (gapStart <= cal.lastDay) {
      const wd = countWeekdays(gapStart, cal.lastDay)
      if (wd > longestWd) { longestWd = wd; longestInstructionalStretch = { weeks: Math.round(wd / 5), start: gapStart, end: cal.lastDay } }
    }
  }

  // ── springBreakVsPrevYear ──────────────────────────────────────────────
  let springBreakVsPrevYear: string | null = null
  let springBreakDiffDays: number | null = null
  if (prevCalVal && yearComparisonVal) {
    // Only show the card when spring break hasn't happened yet
    const sprStart = (events as any[])
      .filter(e => e.name?.toLowerCase().includes('spring') && (e.type === 'break_start' || e.type === 'holiday'))
      .map(e => e.date)
      .sort()[0] ?? null
    const springBreakPassed = sprStart ? sprStart < todayStrVal : false
    if (!springBreakPassed) {
      springBreakVsPrevYear = yearComparisonVal
      const match = yearComparisonVal.match(/(\d+) day/)
      if (match) {
        const n = parseInt(match[1]!)
        springBreakDiffDays = yearComparisonVal.includes('later') ? n : yearComparisonVal.includes('earlier') ? -n : 0
      } else if (yearComparisonVal.includes('same date')) {
        springBreakDiffDays = 0
      }
    }
  }

  // ── secondSemStart ─────────────────────────────────────────────────────
  const secondSemStartVal = getSecondSemesterStart(events) || null

  // ── breakdownText (Student Days Off breakdown) ──────────────────────────
  const brkDefs = [
    { keywords: ['thanksgiving'], label: 'Thanksgiving' },
    { keywords: ['winter', 'christmas', 'december'], label: 'Winter' },
    { keywords: ['spring'], label: 'Spring' },
  ]
  const breakParts: string[] = []
  for (const { keywords, label } of brkDefs) {
    const brk = breaksVal.find(b => keywords.some(kw => b.name.toLowerCase().includes(kw)))
    if (brk) {
      const wdays = countWeekdays(brk.start, brk.end)
      if (wdays > 0) breakParts.push(`${wdays} ${label}`)
    }
  }
  if (holidayCount > 0) breakParts.push(`${holidayCount} individual holidays`)
  const breakdownText = breakParts.length > 1 ? breakParts.join(', ') : null

  return {
    nextStudentDayOff,
    nextHoliday,
    nextTeacherWorkday,
    nextBreak,
    longestBreak: longestBreak ?? null,
    breakCount: breaksVal.length,
    daysUntilSpringBreak,
    springBreakStart,
    daysUntilWinterBreak,
    daysBeforeLaborDay,
    teacherWorkDays,
    startDiffNearest,
    lastDayDiffNearest,
    schoolWeeks: schoolWeeksVal,
    totalDaysOff: daysOffCountVal,
    winterBreakLength: winterBreakObj ? winterBreakDaysVal : null,
    winterBreakStart: winterBreakObj ? winterBreakObj.start : null,
    winterBreakEnd: winterBreakObj ? winterBreakObj.end : null,
    longestInstructionalStretch,
    instructionalDays: cal.totalSchoolDays ?? 180,
    springBreakVsPrevYear,
    springBreakDiffDays,
    firstDay: cal.firstDay,
    lastDay: cal.lastDay,
    holidayCount,
    instructionWeeks,
    secondSemStart: secondSemStartVal,
    breakdownText,
  }
}

// ── Dynamic Metrics: Quick Facts scorer ───────────────────────────────────
function scoreQuickFacts(pool: MetricPool, districtSlug: string): FactItem[] {
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const recency = (d: number | undefined) =>
    d === undefined ? 0 : d < 7 ? 20 : d < 14 ? 15 : d < 30 ? 10 : 0
  // Large boost when a countdown metric is imminent — score of 22 base only wins slots when ≤14 days away
  const nearRecency = (d: number | undefined) =>
    d === undefined ? 0 : d < 7 ? 50 : d < 14 ? 35 : d < 21 ? 18 : 0

  type Candidate = FactItem & { score: number }
  const raw: Candidate[] = []

  if (pool.nextStudentDayOff) {
    const x = pool.nextStudentDayOff
    raw.push({ key: 'nextStudentDayOff', value: fmt(x.date), label: x.name, score: 90 + recency(x.daysUntil) })
  }
  if (pool.nextTeacherWorkday) {
    const x = pool.nextTeacherWorkday
    raw.push({ key: 'nextTeacherWorkday', value: fmt(x.date), label: 'Next Teacher Workday', score: 85 + recency(x.daysUntil) })
  }
  if (pool.nextBreak) {
    const x = pool.nextBreak
    raw.push({ key: 'nextBreak', value: fmt(x.start), label: x.name, score: 80 + recency(x.daysUntil) })
  }
  if (pool.daysUntilSpringBreak !== null) {
    raw.push({ key: 'daysUntilSpringBreak', value: String(pool.daysUntilSpringBreak), label: 'Days Until Spring Break', score: 22 + nearRecency(pool.daysUntilSpringBreak) })
  }
  if (pool.secondSemStart) {
    const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    raw.push({ key: 'secondSemStart', value: fmt(pool.secondSemStart), label: 'Semester 2 Begins', score: 72 })
  }
  raw.push({ key: 'holidayCount', value: String(pool.holidayCount), label: 'Holidays & No-School Days', score: 65 })
  // instructionWeeks omitted — low user value; Teacher Workdays slot fills instead
  if (pool.daysUntilWinterBreak !== null) {
    raw.push({ key: 'daysUntilWinterBreak', value: String(pool.daysUntilWinterBreak), label: 'Days Until Winter Break', score: 22 + nearRecency(pool.daysUntilWinterBreak) })
  }
  if (pool.nextHoliday) {
    const x = pool.nextHoliday
    raw.push({ key: 'nextHoliday', value: fmt(x.date), label: x.name, score: 60 + recency(x.daysUntil) })
  }
  if (pool.teacherWorkDays !== null) {
    raw.push({ key: 'teacherWorkDays', value: String(pool.teacherWorkDays), label: 'Teacher Workdays', score: 42 })
  }
  if (pool.winterBreakLength !== null) {
    raw.push({ key: 'winterBreakDays', value: `${pool.winterBreakLength} days`, label: 'Winter Break', score: 20 })
  } else {
    raw.push({ key: 'breakCount', value: String(pool.breakCount), label: 'Major Breaks', score: 50 })
  }

  // Redundancy penalties
  const hasNsdo = raw.some(c => c.key === 'nextStudentDayOff')
  const hasNextBreak = raw.some(c => c.key === 'nextBreak')
  const nextBreakIsSpring = pool.nextBreak !== null && pool.nextBreak.start === pool.springBreakStart

  const nextBreakIsWinter = pool.nextBreak !== null && pool.winterBreakStart !== null && pool.nextBreak.start === pool.winterBreakStart

  const scored = raw.map(c => {
    if (hasNsdo && c.key === 'nextHoliday') return { ...c, score: -999 }
    if (hasNextBreak && nextBreakIsSpring && c.key === 'daysUntilSpringBreak') return { ...c, score: -999 }
    if (hasNextBreak && nextBreakIsWinter && c.key === 'daysUntilWinterBreak') return { ...c, score: -999 }
    return c
  }).filter(c => c.score > -999)

  // Sort: score DESC, then stable hash tiebreaker
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return simpleHash(a.key + districtSlug) - simpleHash(b.key + districtSlug)
  })

  return scored.slice(0, 6).map(({ score: _score, ...item }) => item)
}

// ── Dynamic Metrics: Year by Numbers scorer ────────────────────────────────
function scoreYearNumbers(
  pool: MetricPool,
  selectedQuickFactKeys: Set<string>,
  districtVal: any,
  currentYearVal: string,
  fmtShort: (d: string) => string,
): NumberCard[] {
  const shortName: string = districtVal?.shortName || districtVal?.name || ''

  // Mandatory card — always first
  const mandatory: NumberCard = {
    key: 'schoolWeeks',
    label: 'School year',
    value: pool.instructionalDays,
    unit: 'instructional days',
    description: pool.secondSemStart
      ? `${fmtShort(pool.firstDay)} – ${fmtShort(pool.lastDay)} · Semester 2 begins ${fmtShort(pool.secondSemStart)}.`
      : `The ${currentYearVal} year runs ${fmtShort(pool.firstDay)} through ${fmtShort(pool.lastDay)}, spanning ${pool.schoolWeeks} weeks.`,
  }

  type ScoredCard = NumberCard & { score: number }
  const candidates: ScoredCard[] = []

  if (pool.winterBreakLength !== null && pool.winterBreakStart && pool.winterBreakEnd) {
    const bonus = pool.winterBreakLength > 14 ? 10 : 0
    const penalty = 0
    candidates.push({
      key: 'winterBreakLength',
      label: 'Winter break',
      value: pool.winterBreakLength,
      unit: 'days',
      description: `Winter break runs ${fmtShort(pool.winterBreakStart)} to ${fmtShort(pool.winterBreakEnd)} — ${pool.winterBreakLength} calendar days.`,
      score: 80 + bonus + penalty,
    })
  }

  candidates.push({
    key: 'totalDaysOff',
    label: 'Student days off',
    value: pool.totalDaysOff,
    unit: 'days',
    description: pool.breakdownText
      ? `${pool.totalDaysOff} student weekdays off — ${pool.breakdownText}.`
      : `${pool.totalDaysOff} weekdays off in total, including all breaks and individual holidays.`,
    score: 75,
  })

  if (pool.teacherWorkDays !== null) {
    const planDays = pool.teacherWorkDays - pool.instructionalDays
    candidates.push({
      key: 'teacherWorkDays',
      label: 'Teacher workdays',
      value: pool.teacherWorkDays,
      unit: 'days',
      description: planDays > 0
        ? `${pool.instructionalDays} student days plus ${planDays} additional planning and professional development days.`
        : `${pool.teacherWorkDays} days on campus, matching the student instructional calendar.`,
      score: 70,
    })
  } else {
    candidates.push({
      key: 'instructionalDays',
      label: 'Instructional days',
      value: pool.instructionalDays,
      unit: 'days',
      description: `${shortName} schedules ${pool.instructionalDays} instructional days for ${currentYearVal}, consistent with state calendar requirements.`,
      score: 30,
    })
  }

  candidates.sort((a, b) => b.score - a.score)
  const top3 = candidates.slice(0, 3).map(({ score: _score, ...c }) => c)

  return [mandatory, ...top3]
}

// ── Year-at-a-Glance stats ─────────────────────────────────────────────────
const schoolWeeks = computed(() => {
  if (!cal) return 0
  const ms = new Date(cal.lastDay + 'T00:00:00').getTime() - new Date(cal.firstDay + 'T00:00:00').getTime()
  return Math.round(ms / (7 * 24 * 60 * 60 * 1000))
})

const daysOffCount = computed(() => {
  if (!cal) return 0
  let count = 0
  const breakRanges: { start: string; end: string }[] = []
  for (const e of cal.events) {
    if (e.type === 'break_start') {
      const endEvt = cal.events.find(x => x.type === 'break_end' && x.date > e.date)
      if (endEvt) breakRanges.push({ start: e.date, end: endEvt.date })
    }
    if (e.type === 'holiday' || e.type === 'no_school') count++
  }
  for (const { start, end } of breakRanges) {
    let d = new Date(start + 'T00:00:00')
    const endD = new Date(end + 'T00:00:00')
    while (d <= endD) {
      if (d.getDay() !== 0 && d.getDay() !== 6) count++
      d.setDate(d.getDate() + 1)
    }
  }
  return count
})

const winterBreakDays = computed(() => {
  const wb = breaks.value.find(b =>
    b.name.toLowerCase().includes('winter') ||
    b.name.toLowerCase().includes('christmas') ||
    b.name.toLowerCase().includes('december')
  )
  if (!wb) return 0
  const ms = new Date(wb.end + 'T00:00:00').getTime() - new Date(wb.start + 'T00:00:00').getTime()
  return Math.round(ms / (24 * 60 * 60 * 1000)) + 1
})

// ── Dynamic Metrics: computed refs ─────────────────────────────────────────
const metricPool = computed((): MetricPool | null => {
  const calVal = allCals.value?.find(y => y.schoolYear === district.value?.currentSchoolYear) ?? null
  if (!calVal || !district.value) return null
  return computeMetricPool(
    calVal,
    breaks.value,
    relatedCals.value ?? [],
    allDistricts.value ?? [],
    todayStr,
    daysUntil,
    schoolWeeks.value,
    daysOffCount.value,
    winterBreakDays.value,
    prevCal.value,
    yearComparison.value,
  )
})

const quickFactItems = computed((): FactItem[] => {
  if (!metricPool.value || !district.value) return []
  return scoreQuickFacts(metricPool.value, district.value.slug)
})

const quickFactKeys = computed(() => new Set(quickFactItems.value.map(f => f.key)))

const yearNumberCards = computed((): NumberCard[] => {
  if (!metricPool.value || !district.value) return []
  return scoreYearNumbers(metricPool.value, quickFactKeys.value, district.value, district.value.currentSchoolYear ?? '', formatShortDate)
})

// ── Year-over-year diff ─────────────────────────────────────────────────────
function computeYearDiff(curCal: any, prevCalData: any, prevYearStr: string): string[] {
  if (!prevCalData) return []
  const items: string[] = []

  // Compare MM-DD only — avoids ~364-day error when comparing dates across different school years
  const mmddDiff = (a: string, b: string) =>
    Math.round(
      (new Date(`2000-${a.slice(5)}T00:00:00`).getTime() - new Date(`2000-${b.slice(5)}T00:00:00`).getTime()) / 86400000
    )

  // First day
  const sd = mmddDiff(curCal.firstDay, prevCalData.firstDay)
  if (sd === 0) items.push(`First day of school is unchanged from ${prevYearStr} — ${formatShortDate(curCal.firstDay)}.`)
  else if (sd > 0) items.push(`School starts ${sd} day${sd !== 1 ? 's' : ''} later than ${prevYearStr} — ${formatShortDate(curCal.firstDay)}.`)
  else items.push(`School starts ${Math.abs(sd)} day${Math.abs(sd) !== 1 ? 's' : ''} earlier than ${prevYearStr} — ${formatShortDate(curCal.firstDay)}.`)

  // Last day
  const ed = mmddDiff(curCal.lastDay, prevCalData.lastDay)
  if (ed === 0) items.push(`Last day of school is unchanged from ${prevYearStr} — ${formatShortDate(curCal.lastDay)}.`)
  else if (ed > 0) items.push(`Last day of school is ${ed} day${ed !== 1 ? 's' : ''} later than ${prevYearStr} — ${formatShortDate(curCal.lastDay)}.`)
  else items.push(`Last day of school is ${Math.abs(ed)} day${Math.abs(ed) !== 1 ? 's' : ''} earlier than ${prevYearStr} — ${formatShortDate(curCal.lastDay)}.`)

  // Spring break (MM-DD comparison only)
  const curSp = getBreaks(curCal.events).find((b: any) => b.name.toLowerCase().includes('spring'))
  const prevSp = getBreaks(prevCalData.events).find((b: any) => b.name.toLowerCase().includes('spring'))
  if (curSp && prevSp) {
    const diff = Math.round(
      (new Date(`2000-${curSp.start.slice(5)}T00:00:00`).getTime() - new Date(`2000-${prevSp.start.slice(5)}T00:00:00`).getTime()) / 86400000
    )
    if (Math.abs(diff) >= 5) {
      if (diff > 0) items.push(`Spring Break starts ${diff} days later than ${prevYearStr} — ${formatShortDate(curSp.start)}–${formatShortDate(curSp.end)}.`)
      else items.push(`Spring Break starts ${Math.abs(diff)} days earlier than ${prevYearStr} — ${formatShortDate(curSp.start)}–${formatShortDate(curSp.end)}.`)
    }
  }

  // Thanksgiving break length
  const curTh = getBreaks(curCal.events).find((b: any) => b.name.toLowerCase().includes('thanksgiving'))
  const prevTh = getBreaks(prevCalData.events).find((b: any) => b.name.toLowerCase().includes('thanksgiving'))
  if (curTh && prevTh) {
    const ld = curTh.days - prevTh.days
    if (ld === 0) items.push(`Thanksgiving Break is ${curTh.days} days — unchanged from ${prevYearStr}.`)
    else if (ld > 0) items.push(`Thanksgiving Break is ${ld} day${ld !== 1 ? 's' : ''} longer than ${prevYearStr} — ${curTh.days} days total.`)
    else items.push(`Thanksgiving Break is ${Math.abs(ld)} day${Math.abs(ld) !== 1 ? 's' : ''} shorter than ${prevYearStr} — ${curTh.days} days total.`)
  }

  return items
}

const yearDiffItems = computed(() => {
  const base = cal && prevCal.value ? computeYearDiff(cal, prevCal.value, prevYear.value) : []
  const extra: string[] = (cal as any)?.diffNotes ?? []
  return [...base, ...extra]
})

// ── Nearby district comparison stats ───────────────────────────────────────
type ComparisonEntry = {
  name: string; slug: string; isCurrent: boolean
  firstDay: string; lastDay: string
  springBreak: { start: string; end: string } | null
  daysOff: number
  comparisonNote?: string
}
const comparisonStats = computed((): ComparisonEntry[] => {
  const rows: ComparisonEntry[] = []

  const computeDaysOff = (events: any[]) => {
    let count = 0
    const ranges: { start: string; end: string }[] = []
    for (const e of events) {
      if (e.type === 'break_start') {
        const end = events.find((x: any) => x.type === 'break_end' && x.date > e.date)
        if (end) ranges.push({ start: e.date, end: end.date })
      }
      if (e.type === 'holiday' || e.type === 'no_school') count++
    }
    for (const { start, end } of ranges) {
      let d = new Date(start + 'T00:00:00')
      const endD = new Date(end + 'T00:00:00')
      while (d <= endD) { if (d.getDay() !== 0 && d.getDay() !== 6) count++; d.setDate(d.getDate() + 1) }
    }
    return count
  }

  // Current district
  if (cal && district.value) {
    const sp = breaks.value.find(b => b.name.toLowerCase().includes('spring')) ?? null
    rows.push({
      name: district.value.name, slug: district.value.slug, isCurrent: true,
      firstDay: cal.firstDay, lastDay: cal.lastDay,
      springBreak: sp ? { start: sp.start, end: sp.end } : null,
      daysOff: daysOffCount.value,
    })
  }

  // Related districts
  for (const c of relatedCals.value ?? []) {
    const d = (allDistricts.value ?? []).find(x => x.institutionId === c.institutionId)
    if (!d) continue
    const calBreaks = getBreaks(c.events ?? [])
    const sp = calBreaks.find(b => b.name.toLowerCase().includes('spring')) ?? null
    const relatedDef = (district.value?.relatedDistricts as any[] ?? []).find((rd: any) => rd.slug === d.slug)
    rows.push({
      name: d.name, slug: d.slug, isCurrent: false,
      firstDay: c.firstDay, lastDay: c.lastDay,
      springBreak: sp ? { start: sp.start, end: sp.end } : null,
      daysOff: computeDaysOff(c.events ?? []),
      comparisonNote: relatedDef?.comparisonNote,
    })
  }

  return rows
})

// ── Compare insight ────────────────────────────────────────────────────────
const comparisonInsight = computed((): string => {
  const stats = comparisonStats.value
  if (stats.length < 2) return ''
  const current = stats.find(s => s.isCurrent)
  const others = stats.filter(s => !s.isCurrent)
  if (!current || !others.length) return ''
  const shortName = (n: string) => n.replace(/ School District$/, '').replace(/ Unified$/, '').replace(/ Independent$/, '') || n
  const parts = others.map(other => {
    const diff = Math.round(
      (new Date(other.firstDay + 'T00:00:00').getTime() - new Date(current.firstDay + 'T00:00:00').getTime())
      / (1000 * 60 * 60 * 24)
    )
    if (diff > 0) return `${diff} day${diff !== 1 ? 's' : ''} earlier than ${shortName(other.name)}`
    if (diff < 0) return `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} later than ${shortName(other.name)}`
    return `on the same first day as ${shortName(other.name)}`
  })
  return `${shortName(current.name)} starts ${parts.join(' and ')}.`
})

// ── All Dates legend ───────────────────────────────────────────────────────
const dateLegend = [
  { label: 'Breaks', dot: 'bg-purple-400' },
  { label: 'Holidays', dot: 'bg-blue-400' },
  { label: 'No school', dot: 'bg-amber-400' },
  { label: 'Early release', dot: 'bg-green-400' },
]

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
    `Official ${_sn} ${currentYear} calendar with holidays${_hasSpring ? ', spring break' : ''} and winter break. Download PDF or sync to Google Calendar.`,
    // E — verified dates (~130 chars)
    `${_sn} ${currentYear}: first day ${_fd}, last day ${_ld}. Holidays${_hasSpring ? ', spring break' : ''} and official PDF. Syncs with Google Calendar.`,
  ]
  const _idxDesc = cal
    ? _descTemplates[simpleHash(_slug + currentYear) % _descTemplates.length]
    : `${_dn} ${currentYear} school calendar with all holidays, breaks, and key dates.`
  useSeoMeta({
    title: `${_sn} Calendar ${currentYear}${_titleSuffix}`,
    description: _idxDesc,
    ogTitle: `${_sn} Calendar ${currentYear}${_titleSuffix}`,
    ogDescription: _idxDesc,
    ogUrl: canonicalUrl,
  })

  const orgAddress = {
    '@type': 'PostalAddress',
    addressLocality: meta.value!.city ?? '',
    addressRegion: (meta.value! as any).stateCode ?? meta.value!.state,
    addressCountry: 'US',
  }
  const orgRef = { '@type': 'EducationalOrganization', name: meta.value!.name, url: meta.value!.officialWebsite || canonicalUrl }

  const keyEvents = cal ? [
    ...(cal.firstDay ? [{
      '@context': 'https://schema.org', '@type': 'Event',
      name: `First Day of School — ${meta.value!.name} ${currentYear}`,
      description: `First day of school for ${meta.value!.name} in the ${currentYear} school year.`,
      startDate: cal.firstDay, endDate: cal.firstDay,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      image: (meta.value! as any).logo || 'https://myschooldates.com/icons/myschooldates-og-img.png',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
      performer: orgRef,
      organizer: orgRef, location: { '@type': 'Place', name: meta.value!.name, address: orgAddress },
    }] : []),
    ...(cal.lastDay ? [{
      '@context': 'https://schema.org', '@type': 'Event',
      name: `Last Day of School — ${meta.value!.name} ${currentYear}`,
      description: `Last day of school for ${meta.value!.name} in the ${currentYear} school year.`,
      startDate: cal.lastDay, endDate: cal.lastDay,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      image: (meta.value! as any).logo || 'https://myschooldates.com/icons/myschooldates-og-img.png',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
      performer: orgRef,
      organizer: orgRef, location: { '@type': 'Place', name: meta.value!.name, address: orgAddress },
    }] : []),
    ...breaks.value
      .filter((b: any) => ['thanksgiving', 'winter', 'christmas', 'spring'].some(kw => b.name.toLowerCase().includes(kw)))
      .map((b: any) => ({
        '@context': 'https://schema.org', '@type': 'Event',
        name: `${b.name} — ${meta.value!.name} ${currentYear}`,
        description: `${b.name} for ${meta.value!.name} ${currentYear}. No school during this period.`,
        startDate: b.start, endDate: b.end,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        image: (meta.value! as any).logo || 'https://myschooldates.com/icons/myschooldates-og-img.png',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
        performer: orgRef,
        organizer: orgRef, location: { '@type': 'Place', name: meta.value!.name, address: orgAddress },
      })),
  ] : []

  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl }],
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myschooldates.com' },
            { '@type': 'ListItem', position: 2, name: meta.value!.state, item: `https://myschooldates.com/${toStateSlug(meta.value!.state)}` },
            { '@type': 'ListItem', position: 3, name: `${meta.value!.name} Calendar`, item: canonicalUrl },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'EducationalOrganization',
          name: meta.value!.name,
          url: meta.value!.officialWebsite || canonicalUrl,
          sameAs: [canonicalUrl, meta.value!.officialWebsite].filter(Boolean),
          description: Array.isArray(meta.value!.about)
            ? meta.value!.about.map((s: { content: string }) => s.content).join(' ')
            : (typeof meta.value!.about === 'string' ? meta.value!.about : ''),
          address: orgAddress,
        },
        ...keyEvents,
        ...(faqs.value.length ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.value.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }] : []),
      ]),
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
            Official {{ stateCurrentYear }} school calendars · {{ stateDistricts.length }} public school district{{ stateDistricts.length !== 1 ? 's' : '' }} · Sourced from official district websites
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

        <!-- Title -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ district.name }} Calendar {{ currentYear }}
          </h1>
          <p class="mt-2 text-sm text-gray-500">
            Official {{ currentYear }} school calendar · Sourced from {{ district.name }} ·
            <button @click="downloadICS(district, cal)" class="underline hover:text-blue-600 transition-colors">Add to Google Calendar</button>
          </p>
          <!-- Featured snippet: direct answer for search intent -->
          <p v-if="calendarSummary" class="mt-3 text-sm text-gray-700 leading-relaxed">{{ calendarSummary }}</p>
          <p class="mt-1 text-sm text-gray-500">
            {{ cal.totalSchoolDays ?? 180 }} instructional days
            <span v-if="secondSemStart"> · Second semester begins {{ formatShortDate(secondSemStart) }}</span>
            <span v-if="metricPool?.totalDaysOff"> · {{ metricPool.totalDaysOff }} student weekdays off</span>
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
            <span v-if="!isEstimated">Manually verified by our editorial team · Last reviewed {{ verifiedDate }}</span>
            <span v-else>Based on official district website · Not yet human-verified</span>
          </div>
        </div>

        <!-- Today Status — HERO: first thing users see after the title -->
        <div
          v-if="todayStatus"
          class="rounded-2xl px-6 py-6"
          :class="{
            'bg-green-50 border border-green-200': todayStatus.type === 'school',
            'bg-blue-50 border border-blue-200': todayStatus.type === 'upcoming',
            'bg-purple-50 border border-purple-200': todayStatus.type === 'break',
            'bg-amber-50 border border-amber-200': todayStatus.type === 'holiday',
            'bg-gray-100 border border-gray-200': todayStatus.type === 'ended',
          }"
        >
          <div class="text-xs font-semibold uppercase tracking-wide mb-1"
            :class="{
              'text-green-500': todayStatus.type === 'school',
              'text-blue-500': todayStatus.type === 'upcoming',
              'text-purple-500': todayStatus.type === 'break',
              'text-amber-500': todayStatus.type === 'holiday',
              'text-gray-400': todayStatus.type === 'ended',
            }"
          >Today</div>
          <div
            class="font-bold text-2xl leading-tight"
            :class="{
              'text-green-800': todayStatus.type === 'school',
              'text-blue-800': todayStatus.type === 'upcoming',
              'text-purple-800': todayStatus.type === 'break',
              'text-amber-800': todayStatus.type === 'holiday',
              'text-gray-600': todayStatus.type === 'ended',
            }"
          >
            {{ todayStatus.headline }}
          </div>
          <div v-if="todayStatus.detail" class="text-sm mt-1"
            :class="{
              'text-green-600': todayStatus.type === 'school',
              'text-blue-600': todayStatus.type === 'upcoming',
              'text-purple-600': todayStatus.type === 'break',
              'text-amber-600': todayStatus.type === 'holiday',
              'text-gray-500': todayStatus.type === 'ended',
            }"
          >
            {{ todayStatus.detail }}
          </div>
          <!-- Primary CTA -->
          <button
            @click="downloadICS(district, cal)"
            class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Add to Calendar
          </button>
        </div>

        <!-- Key Date Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">First Day of School</div>
            <div class="text-lg font-bold text-gray-900">{{ formatDate(cal.firstDay) }}</div>
            <div v-if="daysUntilStart > 0" class="mt-2 inline-flex text-sm font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
              {{ daysUntilStart }} days away
            </div>
            <div v-else-if="daysUntilStart === 0" class="mt-2 text-sm font-medium text-green-700">Today!</div>
            <div v-else class="mt-2 text-sm text-green-600">School is in session</div>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Last Day of School</div>
            <div class="text-lg font-bold text-gray-900">{{ formatDate(cal.lastDay) }}</div>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Next Event</div>
            <template v-if="nextEvent">
              <div class="text-lg font-bold text-gray-900">{{ nextEvent.name }}</div>
              <div class="text-sm text-gray-500 mt-1">{{ formatShortDate(nextEvent.date) }}</div>
            </template>
            <div v-else class="text-gray-400">No upcoming events</div>
          </div>
        </div>

        <!-- Key Dates & Holidays Summary -->
        <div v-if="keyDateHighlights.length" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ currentYear }} Key Dates &amp; Holidays</h2>
          <p class="text-xs text-gray-400 mb-4">First day, last day, school holidays, and break start dates</p>
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
                >{{ eventTypeLabel[event.type] }}</span>
                <span class="text-sm text-gray-900 truncate">{{ event.name }}</span>
              </div>
              <span class="text-sm text-gray-500 tabular-nums ml-4 flex-shrink-0">{{ formatShortDate(event.date) }}</span>
            </div>
          </div>
        </div>

        <!-- Quick Facts (fixed position — moved above Year by Numbers) -->
        <div v-if="quickFactItems.length" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Facts — {{ currentYear }}</h2>
          <div class="grid grid-cols-3 gap-4">
            <div v-for="fact in quickFactItems" :key="fact.key" class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900 truncate">{{ fact.value }}</div>
              <div class="text-xs text-gray-500 mt-1 leading-snug">{{ fact.label }}</div>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-400">
            <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Source:</span>
            <a
              :href="cal.sourceUrl ?? district.calendarPage ?? district.officialWebsite"
              target="_blank"
              rel="nofollow noopener"
              class="underline text-gray-500 hover:text-blue-600 transition-colors"
            >{{ district.name }} official calendar</a>
            <span v-if="!isEstimated" class="ml-1 text-green-600 font-medium">· Last reviewed {{ verifiedDate }}</span>
            <span v-else class="ml-1 text-gray-400">· Not yet verified against official source</span>
          </div>
          <p class="text-xs text-gray-400 mt-1.5">Counts include listed weekday student no-school dates between the first and last day of school. Weekends and pre-year teacher/buyback days are not counted. Instructional weeks are approximate.</p>
        </div>

        <!-- Year by the Numbers -->
        <DistrictYearNumbers :cards="yearNumberCards" />

        <!-- What's Different This Year -->
        <DistrictYearDiff :current-year="currentYear" :prev-year="prevYear" :items="yearDiffItems" />

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

        <!-- Add to Calendar + Share -->
        <CalendarExportShare
          :district-name="district.name"
          :year="currentYear"
          :source-url="(cal.sourceUrl ?? district.calendarPage) ?? district.officialWebsite"
          :district="district"
          :cal="cal"
        />

        <!-- Dynamic mid sections: order varies by time context -->
        <template v-for="section in midSectionOrder" :key="section">

          <!-- About / Calendar Context -->
          <div v-if="section === 'about'" class="text-gray-600 leading-relaxed space-y-3 text-sm">
            <template v-if="cal.calendarNotes">
              <p v-for="(para, i) in cal.calendarNotes.split('\n\n')" :key="i">{{ para }}</p>
            </template>
            <template v-else>
              <p>
                The {{ currentYear }} academic year for {{ district.name }} runs from
                <strong>{{ formatDate(cal.firstDay) }}</strong> to
                <strong>{{ formatDate(cal.lastDay) }}</strong>,
                covering {{ cal.totalSchoolDays ?? 180 }} instructional days across {{ cal.semesters ?? 2 }} semesters.
                <span v-if="secondSemStart">
                  The second semester begins {{ formatShortDate(secondSemStart) }} following the winter recess.
                </span>
              </p>
              <p v-if="breaks.length">
                Students have {{ breaks.length }} major school break{{ breaks.length !== 1 ? 's' : '' }} throughout the year —
                {{ breaks.map(b => b.name).join(', ') }} — plus all federal holidays.
                <span v-if="yearComparison" class="italic text-gray-500"> {{ yearComparison }}</span>
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
                  <div v-if="daysUntil(b.start) > 0" class="text-xs text-blue-600 mt-0.5 font-medium">
                    Starts in {{ daysUntil(b.start) }} day{{ daysUntil(b.start) !== 1 ? 's' : '' }}
                  </div>
                  <div v-else-if="todayStr >= b.start && todayStr <= b.end" class="text-xs text-purple-600 mt-0.5 font-medium">
                    In progress
                  </div>
                </div>
                <div class="text-sm font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">{{ b.days }} days</div>
              </div>
            </div>
          </div>

        </template>

        <!-- All Dates -->
        <DistrictAllDates
          :events="cal.events"
          title="All Important Dates"
          :source-url="(cal?.sourceUrl ?? district.calendarPage) ?? district.officialWebsite"
          :district-name="district.name"
          :verified-date="verifiedDate"
          :legend="dateLegend"
        />

        <!-- Compare with Nearby Districts -->
        <DistrictComparison :rows="comparisonStats" :insight="comparisonInsight" :year="currentYear" />

        <!-- FAQ -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-5">Frequently Asked Questions</h2>
          <div class="space-y-5 divide-y divide-gray-100">
            <div v-for="faq in faqs" :key="faq.q" class="pt-5 first:pt-0">
              <h3 class="font-medium text-gray-900">{{ faq.q }}</h3>
              <p class="text-gray-600 mt-1.5">{{ faq.a }}</p>
            </div>
          </div>
        </div>

        <!-- Planning Tips -->
        <DistrictPlanningTips
          v-if="(district as any).planningTips?.length"
          :name="district.shortName || district.name"
          :tips="(district as any).planningTips"
        />

        <!-- District Profile (moved below Planning Tips) -->
        <div v-if="(district as any).studentCount || (district as any).schoolCount" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">District Profile</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
            <div v-if="(district as any).studentCount">
              <div class="text-2xl font-bold text-gray-900">{{ ((district as any).studentCount as number).toLocaleString('en-US') }}</div>
              <div class="text-xs text-gray-400 mt-0.5">students enrolled</div>
            </div>
            <div v-if="(district as any).schoolCount">
              <div class="text-2xl font-bold text-gray-900">{{ (district as any).schoolCount }}+</div>
              <div class="text-xs text-gray-400 mt-0.5">schools &amp; campuses</div>
            </div>
            <div v-if="(district as any).calendarType">
              <div class="text-sm font-semibold text-gray-900 leading-snug mt-1">
                {{ (district as any).calendarType === 'traditional' ? 'Traditional' : (district as any).calendarType === 'year-round' ? 'Year-Round' : 'Traditional + Year-Round' }}
              </div>
              <div class="text-xs text-gray-400 mt-0.5">calendar type</div>
            </div>
            <div v-if="district.grades?.length">
              <div class="text-sm font-semibold text-gray-900 mt-1">{{ district.grades[0] }} – {{ district.grades[district.grades.length - 1] }}</div>
              <div class="text-xs text-gray-400 mt-0.5">grades served</div>
            </div>
            <div v-if="(district as any).founded">
              <div class="text-2xl font-bold text-gray-900">{{ (district as any).founded }}</div>
              <div class="text-xs text-gray-400 mt-0.5">year founded</div>
            </div>
            <div v-if="(district as any).county">
              <div class="text-sm font-semibold text-gray-900 mt-1">{{ (district as any).county }}</div>
              <div class="text-xs text-gray-400 mt-0.5">county</div>
            </div>
            <div v-if="(district as any).metro">
              <div class="text-sm font-semibold text-gray-900 mt-1">{{ (district as any).metro }}</div>
              <div class="text-xs text-gray-400 mt-0.5">metro area</div>
            </div>
          </div>
          <p v-if="(district as any).districtFact" class="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 leading-relaxed">{{ (district as any).districtFact }}</p>
          <p class="mt-3 text-xs text-gray-400">District profile figures are approximate and sourced from public district information. Enrollment counts, school totals, and program details may change by school year.</p>
        </div>

        <!-- Living Here -->
        <DistrictLivingHere
          v-if="(district as any).livingHere?.highlights?.length"
          :city="district.city || district.name"
          :intro="(district as any).livingHere.intro"
          :highlights="(district as any).livingHere.highlights"
        />

        <!-- Related Districts -->
        <div v-if="district.relatedDistricts?.length" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">Nearby School Districts</h2>
            <p class="text-sm text-gray-500 mt-1">Compare nearby {{ district.state }} school districts.</p>
          </div>
          <div class="divide-y divide-gray-50">
            <NuxtLink v-for="rd in district.relatedDistricts" :key="rd.slug" :to="`/${rd.slug}`" class="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
              <div>
                <div class="font-medium text-gray-900">{{ rd.name }}</div>
                <div class="text-sm text-gray-500">{{ rd.state }}</div>
              </div>
              <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </NuxtLink>
          </div>
        </div>

        <!-- Other Official Calendars -->
        <div v-if="(cal as any)?.alternateCalendars?.length" id="other-calendars" class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-1">Other Official Calendars</h2>
          <p class="text-sm text-gray-500 mb-4">{{ district.name }} also publishes official calendars for specific school types.</p>
          <ul class="space-y-0">
            <li v-for="alt in (cal as any).alternateCalendars" :key="alt.type"
              class="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
              <div>
                <div class="text-sm font-medium text-gray-900">{{ alt.label }}</div>
                <div v-if="alt.firstDay" class="text-xs text-gray-500 mt-0.5">First day: {{ formatShortDate(alt.firstDay) }}</div>
              </div>
              <a v-if="alt.pdfUrl" :href="alt.pdfUrl" target="_blank" rel="nofollow noopener"
                class="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </a>
            </li>
          </ul>
        </div>

        <!-- Sources & Verification -->
        <div v-if="(district as any).sources?.length" class="bg-gray-50 rounded-xl border border-gray-100 p-5">
          <h2 class="text-sm font-semibold text-gray-700 mb-2">Sources and Verification</h2>
          <p class="text-sm text-gray-600 mb-3">
            Calendar dates are based on {{ district.name }}'s official {{ currentYear }} calendar.
            <template v-if="!isEstimated"> Reviewed by our editorial team on {{ verifiedDate }}.</template>
            <template v-else> Not yet independently reviewed against the official source.</template>
          </p>
          <ul class="space-y-1.5 mb-3">
            <li v-for="src in (district as any).sources" :key="src.label" class="flex items-start gap-2 text-xs text-gray-500">
              <svg class="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <a v-if="src.url" :href="src.url" target="_blank" rel="nofollow noopener" class="underline hover:text-blue-600 transition-colors">{{ src.label }}</a>
              <span v-else>{{ src.label }}</span>
            </li>
          </ul>
          <div class="text-xs text-gray-500 pt-3 border-t border-gray-200 space-y-1.5">
            <p class="font-medium text-gray-600">How we collect and verify this data</p>
            <p>Each school year, our editorial team downloads the official calendar PDF published on the district's website. We use AI to extract key dates and events from the source document, then manually cross-check every date against the original PDF before publishing. Any discrepancy between the AI output and the official document is corrected by hand.</p>
            <p>Supplemental planning notes and district profile information may change by year. Families should confirm program deadlines, transportation notices, and emergency schedule updates directly with {{ (district as any).shortName || district.name }}.</p>
          </div>
        </div>

        <!-- Data quality notice -->
        <div v-if="isEstimated" class="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm text-gray-600 space-y-1">
              <p class="font-medium text-gray-700">Dates not yet verified</p>
              <p>
                These dates have not been confirmed against the official {{ currentYear }} calendar.
                Always check the
                <a :href="(cal?.sourceUrl ?? district.calendarPage) ?? district.officialWebsite" target="_blank" rel="nofollow noopener" class="underline font-medium text-gray-700">official {{ district.name }} calendar</a>
                before making travel or childcare plans.
              </p>
            </div>
          </div>
        </div>

        <div v-else class="bg-green-50 border border-green-200 rounded-xl p-5">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm text-green-700 space-y-1">
              <p class="font-medium">Manually verified by our editorial team against the official district calendar</p>
              <p>
                Dates sourced directly from the
                <a :href="cal.sourceUrl ?? district.calendarPage ?? district.officialWebsite" target="_blank" rel="nofollow noopener" class="underline font-medium">official {{ district.shortName || district.name }} calendar</a>.
                Dates are subject to board approval and may change — always confirm before making travel or childcare plans.
              </p>
              <p class="text-green-600 text-xs">Last verified: {{ verifiedDate }}</p>
            </div>
          </div>
        </div>

      </main>
    </template>
  </div>
</template>
