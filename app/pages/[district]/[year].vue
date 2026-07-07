<script setup lang="ts">
const route = useRoute()
const slug = route.params.district as string
const year = route.params.year as string
const { formatDate, formatShortDate, daysUntil, getBreaks, getSecondSemesterStart, generateFaqs, downloadICS, eventTypeLabel, eventTypeColor } = useDistrictPage()

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
  useAsyncData('districts-all', () =>
    queryCollection('districts').order('name', 'ASC').all()
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
  return (all ?? []).filter(c => relatedIds.includes(c.institutionId) && c.schoolYear === year)
})

if (!district.value || !cal.value) {
  throw createError({ statusCode: 404, statusMessage: 'Calendar not found' })
}

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

const daysUntilStart = computed(() => daysUntil(cal.value!.firstDay))
const nextEvent = computed(() =>
  cal.value!.events.find(e => new Date(e.date + 'T00:00:00') >= today) ?? null
)
const breaks = computed(() => getBreaks(cal.value!.events))
const secondSemStart = computed(() => getSecondSemesterStart(cal.value!.events))

// ── Dynamic Metrics: types ─────────────────────────────────────────────────
type MetricPool = {
  nextStudentDayOff:           { name: string; date: string; daysUntil: number } | null
  nextHoliday:                 { name: string; date: string; daysUntil: number } | null
  nextTeacherWorkday:          { name: string; date: string; daysUntil: number } | null
  nextBreak:                   { name: string; start: string; daysUntil: number } | null
  longestBreak:                { name: string; days: number; start: string; end: string } | null
  breakCount:                  number
  daysUntilSpringBreak:        number | null
  springBreakStart:            string | null
  daysBeforeLaborDay:          number | null
  teacherWorkDays:             number | null
  startDiffNearest:            { days: number; direction: 'earlier' | 'later' | 'same'; vsName: string } | null
  lastDayDiffNearest:          { days: number; direction: 'earlier' | 'later' | 'same'; vsName: string } | null
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
}

type FactItem = { key: string; value: string; label: string }

type NumberCard = { key: string; label: string; value: number; unit: string; description: string }

// ── Dynamic Metrics: helpers ───────────────────────────────────────────────
function getLaborDay(yr: number): string {
  const sept1 = new Date(yr, 8, 1)
  const dow = sept1.getDay()
  const offset = dow === 1 ? 0 : dow === 0 ? 1 : 8 - dow
  const day = 1 + offset
  return `${yr}-09-${String(day).padStart(2, '0')}`
}

function simpleHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
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

function computeMetricPool(
  calVal: any,
  breaksVal: { name: string; start: string; end: string; days: number }[],
  todayStrVal: string,
  daysUntilFn: (d: string) => number,
  schoolWeeksVal: number,
  daysOffCountVal: number,
  winterBreakDaysVal: number,
): MetricPool {
  const events: { date: string; type: string; name: string }[] = calVal.events ?? []

  const nextSdoEvt = events
    .filter(e => e.date >= todayStrVal && (e.type === 'holiday' || e.type === 'no_school' || e.type === 'break_start'))
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
  const nextStudentDayOff = nextSdoEvt
    ? { name: nextSdoEvt.name, date: nextSdoEvt.date, daysUntil: daysUntilFn(nextSdoEvt.date) } : null

  const nextHolEvt = events
    .filter(e => e.date >= todayStrVal && e.type === 'holiday')
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
  const nextHoliday = nextHolEvt
    ? { name: nextHolEvt.name, date: nextHolEvt.date, daysUntil: daysUntilFn(nextHolEvt.date) } : null

  const nextTwdEvt = events
    .filter(e => e.date >= todayStrVal && e.type === 'teacher_workday')
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
  const nextTeacherWorkday = nextTwdEvt
    ? { name: nextTwdEvt.name, date: nextTwdEvt.date, daysUntil: daysUntilFn(nextTwdEvt.date) } : null

  const nextBreakObj = [...breaksVal]
    .sort((a, b) => a.start.localeCompare(b.start))
    .find(b => b.start >= todayStrVal) ?? null
  const nextBreak = nextBreakObj
    ? { name: nextBreakObj.name, start: nextBreakObj.start, daysUntil: daysUntilFn(nextBreakObj.start) } : null

  const longestBreak = breaksVal.length === 0 ? null
    : breaksVal.reduce((max, b) => b.days > max.days ? b : max, breaksVal[0]!)

  const springBreak = breaksVal.find(b => b.name.toLowerCase().includes('spring')) ?? null
  const springBreakStart = springBreak ? springBreak.start : null
  const daysUntilSpringBreak = springBreak && springBreak.start >= todayStrVal
    ? daysUntilFn(springBreak.start) : null

  const firstDayYear = parseInt(calVal.firstDay.slice(0, 4))
  const laborDay = getLaborDay(firstDayYear)
  const daysBeforeLaborDay = calVal.firstDay < laborDay
    ? Math.round((new Date(laborDay + 'T00:00:00').getTime() - new Date(calVal.firstDay + 'T00:00:00').getTime()) / 86400000)
    : null

  const teacherWorkDays = (calVal.teacherWorkDays && calVal.teacherWorkDays > 0) ? calVal.teacherWorkDays : null

  const winterBreakObj = breaksVal.find(b =>
    b.name.toLowerCase().includes('winter') ||
    b.name.toLowerCase().includes('christmas') ||
    b.name.toLowerCase().includes('december')
  ) ?? null

  type Period = { start: string; end: string }
  const closed: Period[] = [
    ...breaksVal.map(b => ({ start: b.start, end: b.end })),
    ...events.filter(e => e.type === 'holiday' || e.type === 'no_school').map(e => ({ start: e.date, end: e.date })),
  ].sort((a, b) => a.start.localeCompare(b.start))

  const merged: Period[] = []
  for (const p of closed) {
    const last = merged[merged.length - 1]
    if (!last || p.start > shiftDay(last.end, 1)) merged.push({ ...p })
    else if (p.end > last.end) last.end = p.end
  }

  let longestInstructionalStretch: MetricPool['longestInstructionalStretch'] = null
  let longestWd = 0
  if (merged.length > 0) {
    const gapEnd = shiftDay(merged[0]!.start, -1)
    if (calVal.firstDay <= gapEnd) {
      const wd = countWeekdays(calVal.firstDay, gapEnd)
      if (wd > longestWd) { longestWd = wd; longestInstructionalStretch = { weeks: Math.round(wd / 5), start: calVal.firstDay, end: gapEnd } }
    }
  }
  for (let i = 0; i < merged.length - 1; i++) {
    const gapStart = shiftDay(merged[i]!.end, 1)
    const gapEnd = shiftDay(merged[i + 1]!.start, -1)
    if (gapStart <= gapEnd) {
      const wd = countWeekdays(gapStart, gapEnd)
      if (wd > longestWd) { longestWd = wd; longestInstructionalStretch = { weeks: Math.round(wd / 5), start: gapStart, end: gapEnd } }
    }
  }
  if (merged.length > 0) {
    const gapStart = shiftDay(merged[merged.length - 1]!.end, 1)
    if (gapStart <= calVal.lastDay) {
      const wd = countWeekdays(gapStart, calVal.lastDay)
      if (wd > longestWd) { longestWd = wd; longestInstructionalStretch = { weeks: Math.round(wd / 5), start: gapStart, end: calVal.lastDay } }
    }
  }

  return {
    nextStudentDayOff, nextHoliday, nextTeacherWorkday, nextBreak,
    longestBreak: longestBreak ?? null, breakCount: breaksVal.length,
    daysUntilSpringBreak, springBreakStart, daysBeforeLaborDay, teacherWorkDays,
    startDiffNearest: null, lastDayDiffNearest: null,
    schoolWeeks: schoolWeeksVal, totalDaysOff: daysOffCountVal,
    winterBreakLength: winterBreakObj ? winterBreakDaysVal : null,
    winterBreakStart: winterBreakObj ? winterBreakObj.start : null,
    winterBreakEnd: winterBreakObj ? winterBreakObj.end : null,
    longestInstructionalStretch,
    instructionalDays: calVal.totalSchoolDays ?? 180,
    springBreakVsPrevYear: null, springBreakDiffDays: null,
    firstDay: calVal.firstDay, lastDay: calVal.lastDay,
  }
}

function scoreQuickFacts(pool: MetricPool, districtSlug: string): FactItem[] {
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const recency = (d: number | undefined) =>
    d === undefined ? 0 : d < 7 ? 20 : d < 14 ? 15 : d < 30 ? 10 : 0

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
    raw.push({ key: 'daysUntilSpringBreak', value: String(pool.daysUntilSpringBreak), label: 'Days Until Spring Break', score: 75 + recency(pool.daysUntilSpringBreak) })
  }
  if (pool.longestBreak) {
    raw.push({ key: 'longestBreak', value: `${pool.longestBreak.days} days`, label: 'Longest Break', score: 70 })
  }
  if (pool.daysBeforeLaborDay !== null) {
    raw.push({ key: 'daysBeforeLaborDay', value: String(pool.daysBeforeLaborDay), label: 'Days Before Labor Day', score: 65 })
  }
  if (pool.nextHoliday) {
    const x = pool.nextHoliday
    raw.push({ key: 'nextHoliday', value: fmt(x.date), label: x.name, score: 60 + recency(x.daysUntil) })
  }
  if (pool.teacherWorkDays !== null) {
    raw.push({ key: 'teacherWorkDays', value: String(pool.teacherWorkDays), label: 'Teacher Workdays', score: 55 })
  }
  raw.push({ key: 'breakCount', value: String(pool.breakCount), label: 'Major Breaks', score: 50 })

  const hasNsdo = raw.some(c => c.key === 'nextStudentDayOff')
  const hasNextBreak = raw.some(c => c.key === 'nextBreak')
  const nextBreakIsSpring = pool.nextBreak !== null && pool.nextBreak.start === pool.springBreakStart

  const scored = raw.map(c => {
    if (hasNsdo && c.key === 'nextHoliday') return { ...c, score: -999 }
    if (hasNextBreak && nextBreakIsSpring && c.key === 'daysUntilSpringBreak') return { ...c, score: -999 }
    return c
  }).filter(c => c.score > -999)

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return simpleHash(a.key + districtSlug) - simpleHash(b.key + districtSlug)
  })

  return scored.slice(0, 6).map(({ score: _score, ...item }) => item)
}

function scoreYearNumbers(
  pool: MetricPool,
  selectedQuickFactKeys: Set<string>,
  districtVal: any,
  currentYearVal: string,
  fmtShort: (d: string) => string,
): NumberCard[] {
  const shortName: string = districtVal?.shortName || districtVal?.name || ''

  const mandatory: NumberCard = {
    key: 'schoolWeeks', label: 'School year', value: pool.schoolWeeks, unit: 'weeks',
    description: `The ${currentYearVal} year runs ${fmtShort(pool.firstDay)} through ${fmtShort(pool.lastDay)}, spanning ${pool.schoolWeeks} weeks.`,
  }

  type ScoredCard = NumberCard & { score: number }
  const candidates: ScoredCard[] = []

  if (pool.longestInstructionalStretch) {
    const ls = pool.longestInstructionalStretch
    candidates.push({
      key: 'longestInstructionalStretch', label: 'Longest school stretch',
      value: ls.weeks, unit: 'weeks',
      description: `The longest stretch without a student day off runs ${ls.weeks} weeks — ${fmtShort(ls.start)} through ${fmtShort(ls.end)}.`,
      score: 85 + (ls.weeks > 8 ? 10 : 0),
    })
  }

  if (pool.winterBreakLength !== null && pool.winterBreakStart && pool.winterBreakEnd) {
    const penalty = selectedQuickFactKeys.has('longestBreak') ? -30 : 0
    candidates.push({
      key: 'winterBreakLength', label: 'Winter break',
      value: pool.winterBreakLength, unit: 'days',
      description: `Winter break runs ${fmtShort(pool.winterBreakStart)} to ${fmtShort(pool.winterBreakEnd)} — ${pool.winterBreakLength} calendar days.`,
      score: 80 + (pool.winterBreakLength > 14 ? 10 : 0) + penalty,
    })
  }

  candidates.push({
    key: 'totalDaysOff', label: 'Student days off',
    value: pool.totalDaysOff, unit: 'days',
    description: `Students get ${pool.totalDaysOff} full weekdays off — breaks, holidays, and no-school days combined.`,
    score: 75,
  })

  candidates.push({
    key: 'instructionalDays', label: 'Instructional days',
    value: pool.instructionalDays, unit: 'days',
    description: `${shortName} schedules ${pool.instructionalDays} instructional days for ${currentYearVal}, consistent with state calendar requirements.`,
    score: 55,
  })

  candidates.sort((a, b) => b.score - a.score)
  const top3 = candidates.slice(0, 3).map(({ score: _score, ...c }) => c)
  return [mandatory, ...top3]
}

// ── Supporting computeds ───────────────────────────────────────────────────
const schoolWeeks = computed(() => {
  const ms = new Date(cal.value!.lastDay + 'T00:00:00').getTime() - new Date(cal.value!.firstDay + 'T00:00:00').getTime()
  return Math.round(ms / (7 * 24 * 60 * 60 * 1000))
})

const daysOffCount = computed(() => {
  let count = 0
  const breakRanges: { start: string; end: string }[] = []
  for (const e of cal.value!.events) {
    if (e.type === 'break_start') {
      const endEvt = cal.value!.events.find((x: any) => x.type === 'break_end' && x.date > e.date)
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

// ── Dynamic Metrics computed refs ──────────────────────────────────────────
const metricPool = computed((): MetricPool | null => {
  if (!cal.value) return null
  return computeMetricPool(
    cal.value,
    breaks.value,
    todayStr,
    daysUntil,
    schoolWeeks.value,
    daysOffCount.value,
    winterBreakDays.value,
  )
})

const quickFactItems = computed((): FactItem[] => {
  if (!metricPool.value || !district.value) return []
  return scoreQuickFacts(metricPool.value, district.value.slug)
})

const quickFactKeys = computed(() => new Set(quickFactItems.value.map(f => f.key)))

const yearNumberCards = computed((): NumberCard[] => {
  if (!metricPool.value || !district.value) return []
  return scoreYearNumbers(metricPool.value, quickFactKeys.value, district.value, year, formatShortDate)
})

// ── B3 FAQ scoring ─────────────────────────────────────────────────────────
const faqs = computed(() => {
  if (!district.value || !cal.value) return []
  const specificFaqs: { q: string; a: string }[] = (district.value as any).districtFaqs ?? []
  const allTemplateFaqs = generateFaqs(district.value, cal.value, district.value.officialWebsite)

  const TARGET = 8
  const needed = Math.max(0, TARGET - specificFaqs.length)
  if (needed === 0) return specificFaqs.slice(0, TARGET)

  const hasFallBreak = breaks.value.some(b => b.name.toLowerCase().includes('fall'))
  const hasSpringBreak = breaks.value.some(b => b.name.toLowerCase().includes('spring'))
  const hasWinterBreak = breaks.value.some(b =>
    b.name.toLowerCase().includes('winter') || b.name.toLowerCase().includes('christmas'))
  const hasThanksgiving = breaks.value.some(b => b.name.toLowerCase().includes('thanksgiving'))
  const hasSemStart = !!secondSemStart.value
  const hasTeacherDays = !!(cal.value.teacherWorkDays && cal.value.teacherWorkDays > 0)

  const specificLower = specificFaqs.map(f => f.q.toLowerCase())
  const hasOverlap = (keywords: string[]) =>
    keywords.some(kw => specificLower.some(q => q.includes(kw)))

  const scored: { idx: number; score: number }[] = [
    { idx: 0,  score: hasFallBreak ? 95 : 10 },
    { idx: 1,  score: 70 },
    { idx: 2,  score: hasSpringBreak ? 88 : 52 },
    { idx: 3,  score: 55 },
    { idx: 4,  score: 50 },
    { idx: 5,  score: 82 },
    { idx: 6,  score: 78 },
    { idx: 7,  score: hasSemStart ? 75 : 48 },
    { idx: 8,  score: hasSpringBreak ? 90 : 38 },
    { idx: 9,  score: hasWinterBreak ? 85 : 52 },
    { idx: 10, score: hasThanksgiving ? 78 : 48 },
    { idx: 11, score: 62 },
    { idx: 12, score: hasTeacherDays ? 80 : 42 },
    { idx: 13, score: 56 },
  ]

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

  const distSlug = district.value.slug
  const selected = scored
    .filter(s => { const kws = overlapKeywords[s.idx]; return !kws || !hasOverlap(kws) })
    .sort((a, b) => b.score !== a.score ? b.score - a.score : simpleHash(String(a.idx) + distSlug) - simpleHash(String(b.idx) + distSlug))
    .slice(0, needed)
    .map(s => s.idx)
    .sort((a, b) => a - b)

  const templateSelected = selected.map(i => allTemplateFaqs[i]).filter((f): f is { q: string; a: string } => f !== undefined)
  return [...specificFaqs, ...templateSelected]
})

// ── Comparison table ──────────────────────────────────────────────────────
type ComparisonRow = {
  name: string; slug: string; isCurrent: boolean
  firstDay: string; lastDay: string
  springBreak: { start: string; end: string } | null
  daysOff: number
  comparisonNote?: string
}

const comparisonStats = computed((): ComparisonRow[] => {
  const rows: ComparisonRow[] = []

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

  if (cal.value && district.value) {
    const sp = breaks.value.find(b => b.name.toLowerCase().includes('spring')) ?? null
    rows.push({
      name: district.value.name, slug: district.value.slug, isCurrent: true,
      firstDay: cal.value.firstDay, lastDay: cal.value.lastDay,
      springBreak: sp ? { start: sp.start, end: sp.end } : null,
      daysOff: daysOffCount.value,
    })
  }

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

const comparisonInsight = computed((): string => {
  const stats = comparisonStats.value
  if (stats.length < 2) return ''
  const current = stats.find(s => s.isCurrent)
  const others = stats.filter(s => !s.isCurrent)
  if (!current || !others.length) return ''
  const sn = (n: string) => n.replace(/ School District$/, '').replace(/ Unified$/, '').replace(/ Independent$/, '') || n
  const parts = others.map(other => {
    const diff = Math.round(
      (new Date(other.firstDay + 'T00:00:00').getTime() - new Date(current.firstDay + 'T00:00:00').getTime())
      / (1000 * 60 * 60 * 24)
    )
    if (diff > 0) return `${diff} day${diff !== 1 ? 's' : ''} earlier than ${sn(other.name)}`
    if (diff < 0) return `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} later than ${sn(other.name)}`
    return `on the same first day as ${sn(other.name)}`
  })
  return `${sn(current.name)} starts ${parts.join(' and ')}.`
})

useSeoMeta({
  title: `${district.value.name} Calendar ${year} | MySchoolDates`,
  description: `${district.value.name} academic calendar ${year}. First day ${formatShortDate(cal.value.firstDay)}, last day ${formatShortDate(cal.value.lastDay)}. All holidays, breaks, and important dates.`,
  ogTitle: `${district.value.name} Calendar ${year}`,
  ogUrl: canonicalUrl,
})

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
          { '@type': 'ListItem', position: 2, name: district.value.state, item: `https://myschooldates.com/${district.value.state.toLowerCase().replace(/\s+/g, '-')}` },
          { '@type': 'ListItem', position: 3, name: `${district.value.name} Calendar`, item: hubUrl },
          { '@type': 'ListItem', position: 4, name: year, item: canonicalUrl },
        ],
      },
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

      <!-- Archive notice for non-current year -->
      <div v-if="!isCurrentYear" class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p class="text-sm text-blue-700">
          You're viewing the archived <strong>{{ year }}</strong> calendar.
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
            The {{ year }} academic year for {{ district!.name }} ran from
            <strong>{{ formatDate(cal!.firstDay) }}</strong> to
            <strong>{{ formatDate(cal!.lastDay) }}</strong>,
            covering {{ cal!.totalSchoolDays ?? 180 }} instructional days across {{ cal!.semesters ?? 2 }} semesters.
            <span v-if="secondSemStart">
              The second semester began {{ formatShortDate(secondSemStart) }} following the winter recess.
            </span>
          </p>
          <p v-if="breaks.length">
            The year included {{ breaks.length }} major school break{{ breaks.length !== 1 ? 's' : '' }}:
            {{ breaks.map(b => b.name).join(', ') }}.
          </p>
        </div>
      </div>

      <!-- Key Date Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">First Day of School</div>
          <div class="text-lg font-bold text-gray-900">{{ formatDate(cal!.firstDay) }}</div>
          <div v-if="isCurrentYear && daysUntilStart > 0" class="mt-2 text-sm text-blue-600">{{ daysUntilStart }} days away</div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Last Day of School</div>
          <div class="text-lg font-bold text-gray-900">{{ formatDate(cal!.lastDay) }}</div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{{ isCurrentYear ? 'Next Event' : 'School Breaks' }}</div>
          <template v-if="isCurrentYear && nextEvent">
            <div class="text-lg font-bold text-gray-900">{{ nextEvent.name }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ formatShortDate(nextEvent.date) }}</div>
          </template>
          <div v-else class="text-lg font-bold text-gray-900">{{ breaks.length }} breaks</div>
        </div>
      </div>

      <!-- About / Calendar Context -->
      <div v-if="cal!.calendarNotes || district!.about" class="text-gray-600 leading-relaxed space-y-3 text-sm">
        <template v-if="cal!.calendarNotes">
          <p v-for="(para, i) in cal!.calendarNotes.split('\n\n')" :key="i">{{ para }}</p>
        </template>
        <p v-if="district!.about && !cal!.calendarNotes" class="text-gray-500">{{ district!.about }}</p>
      </div>

      <!-- Year by the Numbers -->
      <div v-if="yearNumberCards.length" class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">The Year, by the Numbers</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div v-for="card in yearNumberCards" :key="card.key" class="border border-gray-100 rounded-xl p-5">
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{{ card.label }}</div>
            <div class="text-3xl font-bold text-gray-900 mb-2">
              {{ card.value }} <span class="text-base font-normal text-gray-400">{{ card.unit }}</span>
            </div>
            <p class="text-sm text-gray-500 leading-relaxed">{{ card.description }}</p>
          </div>
        </div>
      </div>

      <!-- Quick Facts -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Facts — {{ year }}</h2>
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
            :href="cal!.sourceUrl ?? district!.officialWebsite"
            target="_blank"
            rel="nofollow noopener"
            class="underline text-gray-500 hover:text-blue-600 transition-colors"
          >{{ district!.name }} official calendar</a>
        </div>
      </div>

      <!-- All Dates -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">All Important Dates — {{ year }}</h2>
        </div>
        <div class="divide-y divide-gray-50">
          <div v-for="event in cal!.events" :key="event.date" class="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
            <div>
              <div class="font-medium text-gray-900">{{ event.name }}</div>
              <div class="text-sm text-gray-500">{{ formatDate(event.date) }}</div>
            </div>
            <span class="text-xs font-medium px-2.5 py-1 rounded-full" :class="eventTypeColor[event.type]">
              {{ eventTypeLabel[event.type] }}
            </span>
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

      <!-- Compare with Nearby Districts -->
      <DistrictComparison :rows="comparisonStats" :insight="comparisonInsight" :year="year" />

      <!-- Planning Tips -->
      <DistrictPlanningTips
        v-if="(district as any).planningTips?.length"
        :name="district!.shortName || district!.name"
        :tips="(district as any).planningTips"
      />

      <!-- Living Here -->
      <DistrictLivingHere
        v-if="(district as any).livingHere?.highlights?.length"
        :city="district!.city || district!.name"
        :intro="(district as any).livingHere.intro"
        :highlights="(district as any).livingHere.highlights"
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
