<script setup lang="ts">
import { getLaborDay, simpleHash, countWeekdays, shiftDay } from '~/utils/calendarHelpers'

const props = defineProps<{
  cal: any
  district: any
  relatedCals?: any[]
  allDistricts?: any[]
  prevCal?: any
}>()

const { getBreaks, getSecondSemesterStart, daysUntil } = useDistrictPage()

// ── Derived simple values ──────────────────────────────────────────────────
const year = computed(() => props.cal?.schoolYear ?? '')

const sourceUrl = computed(() =>
  props.cal?.sourceUrl ?? (props.district as any)?.calendarPage ?? props.district?.officialWebsite ?? ''
)

const districtName = computed(() => props.district?.name ?? '')

const verifiedDate = computed(() => {
  if (!props.cal?.lastVerifiedAt) return null
  return new Date(props.cal.lastVerifiedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
})

// prevYearStr needed for yearComparison
const prevYearStr = computed(() => {
  if (!props.prevCal) return ''
  return props.prevCal.schoolYear ?? ''
})

// yearComparison: compare spring break MM-DD between current and prev year
const yearComparison = computed(() => {
  if (!props.prevCal || !props.cal) return ''
  const prevBreaks = getBreaks(props.prevCal.events ?? [])
  const curBreaks = getBreaks(props.cal.events ?? [])
  const curSpring = curBreaks.find((b: any) => b.name.toLowerCase().includes('spring'))
  const prevSpring = prevBreaks.find((b: any) => b.name.toLowerCase().includes('spring'))
  if (!curSpring || !prevSpring) return ''
  const curMD = curSpring.start.slice(5)
  const prevMD = prevSpring.start.slice(5)
  const diff = Math.round(
    (new Date(`2000-${curMD}T00:00:00`).getTime() - new Date(`2000-${prevMD}T00:00:00`).getTime())
    / (1000 * 60 * 60 * 24)
  )
  if (diff === 0) return `Spring break starts on the same date as ${prevYearStr.value}.`
  if (diff > 0) return `Compared to ${prevYearStr.value}, spring break starts ${diff} day${diff !== 1 ? 's' : ''} later this year.`
  return `Compared to ${prevYearStr.value}, spring break starts ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} earlier this year.`
})

// todayStr
const todayStr = (() => {
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})()

// breaks computed
const breaks = computed(() => getBreaks(props.cal?.events ?? []))

// schoolWeeks
const schoolWeeks = computed(() => {
  if (!props.cal) return 0
  const ms = new Date(props.cal.lastDay + 'T00:00:00').getTime() - new Date(props.cal.firstDay + 'T00:00:00').getTime()
  return Math.round(ms / (7 * 24 * 60 * 60 * 1000))
})

// daysOffCount
const daysOffCount = computed(() => {
  if (!props.cal) return 0
  let count = 0
  const breakRanges: { start: string; end: string }[] = []
  for (const e of props.cal.events) {
    if (e.type === 'break_start') {
      const endEvt = props.cal.events.find((x: any) => x.type === 'break_end' && x.date > e.date)
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

// winterBreakDays
const winterBreakDays = computed(() => {
  const wb = breaks.value.find((b: any) =>
    b.name.toLowerCase().includes('winter') ||
    b.name.toLowerCase().includes('christmas') ||
    b.name.toLowerCase().includes('december')
  )
  if (!wb) return 0
  const ms = new Date(wb.end + 'T00:00:00').getTime() - new Date(wb.start + 'T00:00:00').getTime()
  return Math.round(ms / (24 * 60 * 60 * 1000)) + 1
})

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
  noSchoolDayCount:            number
  semesters:                   number
  extraCards:                  { label: string; value: string; detail: string }[]
  instructionWeeks:            number
  secondSemStart:              string | null
  breakdownText:               string | null
}

type FactItem = {
  key:   string
  value: string
  label: string
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
  const noSchoolDayCount = events.filter(e => e.type === 'holiday' || e.type === 'no_school' || e.type === 'student_holiday').length
  const semesters = cal.semesters ?? 2
  const extraCards: { label: string; value: string; detail: string }[] = cal.yearNumbers ?? []
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
    noSchoolDayCount,
    semesters,
    extraCards,
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
  type Candidate = FactItem & { score: number }
  const raw: Candidate[] = []

  raw.push({ key: 'firstStudentDay', value: fmt(pool.firstDay), label: 'First Student Day', score: 120 })
  raw.push({ key: 'lastStudentDay', value: fmt(pool.lastDay), label: 'Last Student Day', score: 118 })
  if (pool.winterBreakStart) {
    raw.push({ key: 'winterBreakDate', value: fmt(pool.winterBreakStart), label: 'Winter Break', score: 116 })
  }
  if (pool.springBreakStart) {
    raw.push({ key: 'springBreakDate', value: fmt(pool.springBreakStart), label: 'Spring Break', score: 114 })
  }
  raw.push({ key: 'noSchoolDayCount', value: String(pool.noSchoolDayCount), label: 'Student No-School Days', score: 112 })
  raw.push({ key: 'instructionalDays', value: String(pool.instructionalDays), label: 'School Days', score: 110 })
  // instructionWeeks omitted — low user value; staff calendar length is more actionable.
  if (pool.nextStudentDayOff) {
    const x = pool.nextStudentDayOff
    raw.push({ key: 'nextStudentDayOff', value: fmt(x.date), label: x.name, score: 45 + recency(x.daysUntil) })
  }
  if (pool.nextBreak) {
    const x = pool.nextBreak
    raw.push({ key: 'nextBreak', value: fmt(x.start), label: x.name, score: 44 + recency(x.daysUntil) })
  }
  if (pool.secondSemStart) {
    raw.push({ key: 'secondSemStart', value: fmt(pool.secondSemStart), label: 'Semester 2 Begins', score: 43 })
  }
  if (pool.nextHoliday) {
    const x = pool.nextHoliday
    raw.push({ key: 'nextHoliday', value: fmt(x.date), label: x.name, score: 40 + recency(x.daysUntil) })
  }
  if (pool.teacherWorkDays !== null) {
    raw.push({ key: 'teacherWorkDays', value: String(pool.teacherWorkDays), label: 'Staff Calendar Length', score: 30 })
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
  // Deduplicate: nextStudentDayOff and nextBreak can point to the same break_start event
  const nextBreakMatchesNsdo = hasNsdo && pool.nextBreak !== null && pool.nextStudentDayOff !== null &&
    pool.nextStudentDayOff.date === pool.nextBreak.start

  const scored = raw.map(c => {
    if (hasNsdo && c.key === 'nextHoliday') return { ...c, score: -999 }
    if (hasNsdo && nextBreakMatchesNsdo && c.key === 'nextBreak') return { ...c, score: -999 }
    if (hasNextBreak && nextBreakIsSpring && c.key === 'springBreakDate') return { ...c, score: -999 }
    if (hasNextBreak && nextBreakIsWinter && c.key === 'winterBreakDate') return { ...c, score: -999 }
    return c
  }).filter(c => c.score > -999)

  // Sort: score DESC, then stable hash tiebreaker
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return simpleHash(a.key + districtSlug) - simpleHash(b.key + districtSlug)
  })

  return scored.slice(0, 6).map(({ score: _score, ...item }) => item)
}

// ── Computed refs ──────────────────────────────────────────────────────────
const metricPool = computed(() => {
  if (!props.cal) return null
  return computeMetricPool(
    props.cal,
    breaks.value,
    props.relatedCals ?? [],
    props.allDistricts ?? [],
    todayStr,
    daysUntil,
    schoolWeeks.value,
    daysOffCount.value,
    winterBreakDays.value,
    props.prevCal ?? null,
    yearComparison.value,
  )
})

const facts = computed(() => {
  if (!metricPool.value || !props.district) return []
  return scoreQuickFacts(metricPool.value, props.district.slug)
})
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Facts — {{ year }}</h2>
    <div class="grid grid-cols-3 gap-4">
      <div v-for="fact in facts" :key="fact.key" class="text-center p-3 bg-gray-50 rounded-lg">
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
        :href="sourceUrl"
        target="_blank"
        rel="noopener"
        class="underline text-gray-500 hover:text-blue-600 transition-colors"
      >
        {{ districtName }} official calendar
        <span class="sr-only">(opens in a new tab)</span>
      </a>
      <span v-if="verifiedDate" class="ml-1 text-green-600 font-medium">· Last reviewed {{ verifiedDate }}</span>
      <span v-else class="ml-1 text-gray-400">· Not yet verified against official source</span>
    </div>
    <p class="text-xs text-gray-400 mt-1.5">Counts include listed weekday student no-school dates between the first and last day of school. Weekends and pre-year teacher/buyback days are not counted. Instructional weeks are approximate.</p>
  </div>
</template>
