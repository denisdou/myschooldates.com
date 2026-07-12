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

const daysUntilStart = computed(() => daysUntil(cal.value!.firstDay))
const nextEvent = computed(() =>
  cal.value!.events.find(e => new Date(e.date + 'T00:00:00') >= today) ?? null
)
const breaks = computed(() => getBreaks(cal.value!.events))
const secondSemStart = computed(() => getSecondSemesterStart(cal.value!.events))
const verifiedDate = computed(() => {
  if (!(cal.value as any)?.lastVerifiedAt) return null
  return new Date((cal.value as any).lastVerifiedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
})

const isFutureYear = cal.value!.firstDay > todayStr

const formatWeekdayDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

const springBreak = computed(() =>
  breaks.value.find(b => b.name.toLowerCase().includes('spring')) ?? null
)

const todayStatus = computed(() => {
  if (todayStr < cal.value!.firstDay) {
    const d = daysUntilStart.value
    return { type: 'upcoming' as const, headline: d === 0 ? 'School starts today!' : d === 1 ? 'School starts tomorrow' : `School starts in ${d} days`, detail: formatWeekdayDate(cal.value!.firstDay) }
  }
  if (todayStr > cal.value!.lastDay) {
    return { type: 'ended' as const, headline: `The ${year} school year has ended`, detail: `Last day was ${formatShortDate(cal.value!.lastDay)}` }
  }
  for (const b of breaks.value) {
    if (todayStr >= b.start && todayStr <= b.end) {
      const d = daysUntil(b.end)
      return { type: 'break' as const, headline: b.name, detail: `${d + 1} day${d !== 0 ? 's' : ''} remaining` }
    }
  }
  const holiday = cal.value!.events.find(e => e.date === todayStr && (e.type === 'holiday' || e.type === 'no_school'))
  if (holiday) {
    return { type: 'holiday' as const, headline: `No school today — ${holiday.name}`, detail: nextEvent.value ? `Next school event: ${formatShortDate(nextEvent.value.date)}` : '' }
  }
  return { type: 'school' as const, headline: 'School is in session', detail: nextEvent.value ? `Next: ${nextEvent.value.name} — ${formatShortDate(nextEvent.value.date)}` : '' }
})

const upcomingEvents = computed(() =>
  cal.value!.events
    .filter(e => e.date >= todayStr && e.type !== 'break_end')
    .slice(0, 6)
)

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
  daysUntilWinterBreak:        number | null
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
  holidayCount:                number
  instructionWeeks:            number
  secondSemStart:              string | null
  breakdownText:               string | null
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
  const holidayCount = events.filter(e => e.type === 'holiday' || e.type === 'no_school').length
  const instructionWeeks = Math.round((calVal.totalSchoolDays ?? 180) / 5)

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

  const daysUntilWinterBreak = winterBreakObj && winterBreakObj.start > todayStrVal
    ? daysUntilFn(winterBreakObj.start)
    : null

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
    nextStudentDayOff, nextHoliday, nextTeacherWorkday, nextBreak,
    longestBreak: longestBreak ?? null, breakCount: breaksVal.length,
    daysUntilSpringBreak, springBreakStart, daysUntilWinterBreak, daysBeforeLaborDay, teacherWorkDays,
    startDiffNearest: null, lastDayDiffNearest: null,
    schoolWeeks: schoolWeeksVal, totalDaysOff: daysOffCountVal,
    winterBreakLength: winterBreakObj ? winterBreakDaysVal : null,
    winterBreakStart: winterBreakObj ? winterBreakObj.start : null,
    winterBreakEnd: winterBreakObj ? winterBreakObj.end : null,
    longestInstructionalStretch,
    instructionalDays: calVal.totalSchoolDays ?? 180,
    springBreakVsPrevYear: null, springBreakDiffDays: null,
    firstDay: calVal.firstDay, lastDay: calVal.lastDay,
    holidayCount, instructionWeeks,
    secondSemStart: secondSemStartVal,
    breakdownText,
  }
}

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

  const semDesc = pool.secondSemStart
    ? `${fmtShort(pool.firstDay)} – ${fmtShort(pool.lastDay)} · Semester 2 begins ${fmtShort(pool.secondSemStart)}.`
    : `${fmtShort(pool.firstDay)} – ${fmtShort(pool.lastDay)}, spanning ${pool.schoolWeeks} weeks.`
  const mandatory: NumberCard = {
    key: 'schoolWeeks', label: 'School year', value: pool.instructionalDays, unit: 'instructional days',
    description: semDesc,
  }

  type ScoredCard = NumberCard & { score: number }
  const candidates: ScoredCard[] = []

  if (pool.winterBreakLength !== null && pool.winterBreakStart && pool.winterBreakEnd) {
    const penalty = 0
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
    description: pool.breakdownText
      ? `${pool.totalDaysOff} student weekdays off — ${pool.breakdownText}.`
      : `${pool.totalDaysOff} weekdays off in total, including all breaks and individual holidays.`,
    score: 75,
  })

  if (pool.teacherWorkDays !== null) {
    const planDays = pool.teacherWorkDays - pool.instructionalDays
    candidates.push({
      key: 'teacherWorkDays', label: 'Teacher workdays',
      value: pool.teacherWorkDays, unit: 'days',
      description: planDays > 0
        ? `${pool.instructionalDays} student days plus ${planDays} additional planning and professional development days.`
        : `${pool.teacherWorkDays} days on campus, matching the student instructional calendar.`,
      score: 70,
    })
  } else {
    candidates.push({
      key: 'instructionalDays', label: 'Instructional days',
      value: pool.instructionalDays, unit: 'days',
      description: `${shortName} schedules ${pool.instructionalDays} instructional days for ${currentYearVal}, consistent with state calendar requirements.`,
      score: 30,
    })
  }

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

// ── Year-over-year diff ─────────────────────────────────────────────────────
function computeYearDiff(
  curCal: any,
  prevCalData: any,
  prevYearStr: string,
): string[] {
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
  if (!cal.value) return []
  const base = prevCal.value ? computeYearDiff(cal.value, prevCal.value, prevYearVal) : []
  const extra: string[] = (cal.value as any).diffNotes ?? []
  return [...base, ...extra]
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
    { idx: 0,  score: hasFallBreak ? 95 : 65 },      // fallBreak — searched either way
    { idx: 1,  score: 80 },                           // googleCalendar — conversion-critical
    { idx: 2,  score: 52 },                           // travelPlanning — capped so idx 8 wins when spring break exists
    { idx: 3,  score: 55 },
    { idx: 4,  score: 50 },
    { idx: 5,  score: 88 },                           // schoolStart — highest-demand query
    { idx: 6,  score: 85 },                           // lastDay — equally high demand
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
  `Official ${_sn} ${year} calendar with holidays${_hasSpring ? ', spring break' : ''} and winter break. Download PDF or sync to Google Calendar.`,
  // E — verified dates (~130 chars)
  `${_sn} ${year}: first day ${_fd}, last day ${_ld}. Holidays${_hasSpring ? ', spring break' : ''} and official PDF. Syncs with Google Calendar.`,
]
const _autoDesc = _descTemplates[simpleHash(district.value.slug + year) % _descTemplates.length]
const _autoTitle = `${_sn} Calendar ${year}${_titleSuffix}`

const _pageTitle = (cal.value as any).seoTitle ?? _autoTitle
const _pageDesc = (cal.value as any).seoDescription ?? _autoDesc

useSeoMeta({
  title: _pageTitle,
  description: _pageDesc,
  ogTitle: _pageTitle,
  ogUrl: canonicalUrl,
})

const orgAddress = {
  '@type': 'PostalAddress',
  addressLocality: district.value.city ?? '',
  addressRegion: (district.value as any).stateCode ?? district.value.state,
  addressCountry: 'US',
}
const orgRef = { '@type': 'EducationalOrganization', name: district.value.name, url: district.value.officialWebsite }
const keyEvents = [
  {
    '@context': 'https://schema.org', '@type': 'Event',
    name: `First Day of School — ${district.value.name} ${year}`,
    description: `First day of school for ${district.value.name} in the ${year} school year.`,
    startDate: cal.value.firstDay, endDate: cal.value.firstDay,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: district.value.logo || 'https://myschooldates.com/icons/myschooldates-og-img.png',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
    performer: orgRef,
    organizer: orgRef, location: { '@type': 'Place', name: district.value.name, address: orgAddress },
  },
  {
    '@context': 'https://schema.org', '@type': 'Event',
    name: `Last Day of School — ${district.value.name} ${year}`,
    description: `Last day of school for ${district.value.name} in the ${year} school year.`,
    startDate: cal.value.lastDay, endDate: cal.value.lastDay,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: district.value.logo || 'https://myschooldates.com/icons/myschooldates-og-img.png',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
    performer: orgRef,
    organizer: orgRef, location: { '@type': 'Place', name: district.value.name, address: orgAddress },
  },
]

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

      <!-- Title -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          {{ district!.name }} Calendar {{ year }}
        </h1>
        <div class="mt-3 text-gray-600 leading-relaxed space-y-2">
          <p>
            The first day of school for {{ district!.name }} {{ isFutureYear ? 'is' : 'was' }}
            <strong>{{ formatWeekdayDate(cal!.firstDay) }}</strong>.
            The last day {{ isFutureYear || isCurrentYear ? 'is' : 'was' }}
            <strong>{{ formatWeekdayDate(cal!.lastDay) }}</strong>.
            <span v-if="springBreak">
              Spring Break {{ isFutureYear || isCurrentYear ? 'runs' : 'ran' }}
              {{ formatShortDate(springBreak.start) }}–{{ formatShortDate(springBreak.end) }}.
            </span>
          </p>
          <p class="text-sm text-gray-500">
            {{ cal!.totalSchoolDays ?? 180 }} instructional days · {{ cal!.semesters ?? 2 }} semesters
            <span v-if="secondSemStart"> · Second semester begins {{ formatShortDate(secondSemStart) }}</span>
          </p>
        </div>
      </div>

      <!-- Key Date Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">First Day of School</div>
          <div class="text-lg font-bold text-gray-900">{{ formatDate(cal!.firstDay) }}</div>
          <ClientOnly><div v-if="daysUntilStart > 0" class="mt-2 text-sm text-blue-600">{{ daysUntilStart }} days away</div></ClientOnly>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Last Day of School</div>
          <div class="text-lg font-bold text-gray-900">{{ formatDate(cal!.lastDay) }}</div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{{ nextEvent ? 'Next Event' : 'School Breaks' }}</div>
          <template v-if="nextEvent">
            <div class="text-lg font-bold text-gray-900">{{ nextEvent.name }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ formatShortDate(nextEvent.date) }}</div>
          </template>
          <div v-else class="text-lg font-bold text-gray-900">{{ breaks.length }} breaks</div>
        </div>
      </div>

      <!-- Today / Year Status -->
      <ClientOnly>
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
        >{{ todayStatus.headline }}</div>
        <div v-if="todayStatus.detail" class="text-sm mt-1"
          :class="{
            'text-green-600': todayStatus.type === 'school',
            'text-blue-600': todayStatus.type === 'upcoming',
            'text-purple-600': todayStatus.type === 'break',
            'text-amber-600': todayStatus.type === 'holiday',
            'text-gray-500': todayStatus.type === 'ended',
          }"
        >{{ todayStatus.detail }}</div>
      </div>
      </ClientOnly>

      <!-- Year by the Numbers -->
      <DistrictYearNumbers :cards="yearNumberCards" />

      <!-- What's Different This Year -->
      <DistrictYearDiff :current-year="year" :prev-year="prevYearVal" :items="yearDiffItems" />

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
          <span v-if="verifiedDate" class="ml-1 text-green-600 font-medium">· Last reviewed {{ verifiedDate }}</span>
          <span v-else class="ml-1 text-gray-400">· Not yet verified against official source</span>
        </div>
        <p class="text-xs text-gray-400 mt-1.5">Counts include listed weekday student no-school dates between the first and last day of school. Weekends and pre-year teacher/buyback days are not counted. Instructional weeks are approximate.</p>
      </div>

      <!-- Add to Calendar + Share -->
      <CalendarExportShare
        :district-name="district!.name"
        :year="year"
        :source-url="cal!.sourceUrl ?? district!.officialWebsite"
        :district="district!"
        :cal="cal!"
      />

      <!-- All Dates -->
      <DistrictAllDates
        :events="cal!.events"
        :title="`All Important Dates — ${year}`"
        :source-url="cal!.sourceUrl ?? district!.officialWebsite"
        :district-name="district!.name"
        :verified-date="verifiedDate"
      />

      <!-- Calendar Context + About -->
      <div v-if="cal!.calendarNotes || (district as any).about?.length" class="space-y-4">
        <template v-if="cal!.calendarNotes">
          <div class="text-gray-600 leading-relaxed space-y-3 text-sm">
            <p v-for="(para, i) in cal!.calendarNotes.split('\n\n')" :key="i">{{ para }}</p>
          </div>
        </template>
        <template v-if="(district as any).about?.length">
          <div v-for="card in (district as any).about" :key="card.title" class="bg-white rounded-xl border border-gray-200 p-5">
            <h3 class="text-sm font-semibold text-gray-900 mb-2">{{ card.title }}</h3>
            <p class="text-sm text-gray-600 leading-relaxed">{{ card.content }}</p>
          </div>
        </template>
      </div>

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

      <!-- District Profile -->
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
          <div v-if="district!.grades?.length">
            <div class="text-sm font-semibold text-gray-900 mt-1">{{ district!.grades[0] }} – {{ district!.grades[district!.grades.length - 1] }}</div>
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

      <!-- Other Official Calendars -->
      <div v-if="(cal as any)?.alternateCalendars?.length" id="other-calendars" class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">Other Official Calendars</h2>
        <p class="text-sm text-gray-500 mb-4">{{ district!.name }} also publishes official calendars for specific school types.</p>
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

      <!-- Sources -->
      <div v-if="(district as any).sources?.length" class="bg-gray-50 rounded-xl border border-gray-100 p-5">
        <h2 class="text-sm font-semibold text-gray-700 mb-2">Sources and Verification</h2>
        <p class="text-sm text-gray-600 mb-3">
          Calendar dates are based on {{ district!.name }}'s official {{ year }} calendar.
          <template v-if="verifiedDate"> Reviewed by our editorial team on {{ verifiedDate }}.</template>
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
          <p>Supplemental planning notes and district profile information may change by year. Families should confirm program deadlines, transportation notices, and emergency schedule updates directly with {{ district!.shortName || district!.name }}.</p>
        </div>
      </div>

      <!-- Back to current -->
      <div class="text-center">
        <NuxtLink :to="`/${slug}`" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
          ← Back to {{ district!.name }} current calendar ({{ district!.currentSchoolYear }})
        </NuxtLink>
      </div>

    </main>
  </div>
</template>
