# Dynamic Metrics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace two static, template-identical modules (Quick Facts + Year by the Numbers) with data-driven, district-specific content computed from existing calendar events.

**Architecture:** One `computeMetricPool()` function builds all possible metrics; two independent scorers (`scoreQuickFacts`, `scoreYearNumbers`) select what to show. All logic lives in `index.vue` script setup. No JSON file changes required.

**Tech Stack:** Vue 3 Composition API, TypeScript, Nuxt 3. No new dependencies.

**Design doc:** `docs/plans/2026-07-07-dynamic-metrics-design.md`

---

## Task 1: Add types and helper functions

**File:** `app/pages/[district]/index.vue` — insert after line 299 (after `yearComparison` computed, before `// ── All Dates legend`)

Add the following block. These are pure functions with no side effects.

```typescript
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
  const ld = new Date(year, 8, 1 + offset)
  return ld.toISOString().slice(0, 10)
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
```

**Step 1:** Paste this block into index.vue after line 299.

**Step 2:** Save and confirm TypeScript compiles without errors:
```bash
cd /Users/doujiajun/work/mars/myschooldates.com && npx nuxi typecheck 2>&1 | head -30
```
Expected: no errors related to the new types.

**Step 3:** Commit:
```bash
git add 'app/pages/[district]/index.vue'
git commit -m "feat: add MetricPool types and helper functions for dynamic metrics"
```

---

## Task 2: Add computeMetricPool()

**File:** `app/pages/[district]/index.vue` — insert immediately after the helpers block from Task 1.

```typescript
// ── Dynamic Metrics: pool computation ─────────────────────────────────────
function computeMetricPool(
  cal: NonNullable<typeof import('./index.vue')['default']> extends never ? any : any,
  districtVal: any,
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
  const nextBreakObj = breaksVal.find(b => b.start >= todayStrVal) ?? null
  const nextBreak = nextBreakObj
    ? { name: nextBreakObj.name, start: nextBreakObj.start, daysUntil: daysUntilFn(nextBreakObj.start) }
    : null

  // ── longestBreak ───────────────────────────────────────────────────────
  const longestBreak = breaksVal.length === 0 ? null
    : breaksVal.reduce((max, b) => b.days > max.days ? b : max, breaksVal[0])

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
    const vsName = relDistrict.shortName || relDistrict.name

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
    if (!merged.length || p.start > merged[merged.length - 1].end) {
      merged.push({ ...p })
    } else if (p.end > merged[merged.length - 1].end) {
      merged[merged.length - 1].end = p.end
    }
  }

  let longestInstructionalStretch: MetricPool['longestInstructionalStretch'] = null
  let longestWd = 0
  // Check gap: firstDay → first closed period
  if (merged.length > 0) {
    const gapEnd = shiftDay(merged[0].start, -1)
    if (cal.firstDay <= gapEnd) {
      const wd = countWeekdays(cal.firstDay, gapEnd)
      if (wd > longestWd) { longestWd = wd; longestInstructionalStretch = { weeks: Math.round(wd / 5), start: cal.firstDay, end: gapEnd } }
    }
  }
  // Check gaps between consecutive closed periods
  for (let i = 0; i < merged.length - 1; i++) {
    const gapStart = shiftDay(merged[i].end, 1)
    const gapEnd = shiftDay(merged[i + 1].start, -1)
    if (gapStart <= gapEnd) {
      const wd = countWeekdays(gapStart, gapEnd)
      if (wd > longestWd) { longestWd = wd; longestInstructionalStretch = { weeks: Math.round(wd / 5), start: gapStart, end: gapEnd } }
    }
  }
  // Check gap: last closed period → lastDay
  if (merged.length > 0) {
    const gapStart = shiftDay(merged[merged.length - 1].end, 1)
    if (gapStart <= cal.lastDay) {
      const wd = countWeekdays(gapStart, cal.lastDay)
      if (wd > longestWd) { longestWd = wd; longestInstructionalStretch = { weeks: Math.round(wd / 5), start: gapStart, end: cal.lastDay } }
    }
  }

  // ── springBreakVsPrevYear ──────────────────────────────────────────────
  let springBreakVsPrevYear: string | null = null
  let springBreakDiffDays: number | null = null
  if (prevCalVal && yearComparisonVal) {
    springBreakVsPrevYear = yearComparisonVal
    const prevBreaks = breaksVal // Note: yearComparison is already computed using prevCal
    // Extract diff from yearComparison string for numeric use
    const match = yearComparisonVal.match(/(\d+) day/)
    if (match) {
      const n = parseInt(match[1])
      springBreakDiffDays = yearComparisonVal.includes('later') ? n : yearComparisonVal.includes('earlier') ? -n : 0
    }
  }

  return {
    nextStudentDayOff,
    nextHoliday,
    nextTeacherWorkday,
    nextBreak,
    longestBreak: longestBreak ?? null,
    breakCount: breaksVal.length,
    daysUntilSpringBreak,
    springBreakStart,
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
  }
}
```

**Step 1:** Paste this block immediately after the helpers block from Task 1.

**Step 2:** Typecheck:
```bash
cd /Users/doujiajun/work/mars/myschooldates.com && npx nuxi typecheck 2>&1 | head -30
```

**Step 3:** Commit:
```bash
git add 'app/pages/[district]/index.vue'
git commit -m "feat: add computeMetricPool function"
```

---

## Task 3: Add scoreQuickFacts() and scoreYearNumbers()

**File:** `app/pages/[district]/index.vue` — insert after `computeMetricPool`.

```typescript
// ── Dynamic Metrics: Quick Facts scorer ───────────────────────────────────
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
    raw.push({ key: 'daysBeforeLaborDay', value: `${pool.daysBeforeLaborDay}`, label: 'Days Before Labor Day', score: 65 })
  }
  if (pool.nextHoliday) {
    const x = pool.nextHoliday
    raw.push({ key: 'nextHoliday', value: fmt(x.date), label: x.name, score: 60 + recency(x.daysUntil) })
  }
  if (pool.startDiffNearest) {
    const x = pool.startDiffNearest
    raw.push({
      key: 'startDiffNearest',
      value: x.direction === 'same' ? 'Same day' : `${x.days}d ${x.direction}`,
      label: `Start vs. ${x.vsName}`,
      score: 60,
    })
  }
  if (pool.teacherWorkDays !== null) {
    raw.push({ key: 'teacherWorkDays', value: String(pool.teacherWorkDays), label: 'Teacher Workdays', score: 55 })
  }
  raw.push({ key: 'breakCount', value: String(pool.breakCount), label: 'Major Breaks', score: 50 })
  if (pool.lastDayDiffNearest) {
    const x = pool.lastDayDiffNearest
    raw.push({
      key: 'lastDayDiffNearest',
      value: x.direction === 'same' ? 'Same day' : `${x.days}d ${x.direction}`,
      label: `Last Day vs. ${x.vsName}`,
      score: 45,
    })
  }

  // Redundancy penalties
  const hasNsdo = raw.some(c => c.key === 'nextStudentDayOff')
  const hasNextBreak = raw.some(c => c.key === 'nextBreak')
  const nextBreakIsSpring = pool.nextBreak !== null && pool.nextBreak.start === pool.springBreakStart

  const scored = raw.map(c => {
    if (hasNsdo && c.key === 'nextHoliday') return { ...c, score: -999 }
    if (hasNextBreak && nextBreakIsSpring && c.key === 'daysUntilSpringBreak') return { ...c, score: -999 }
    return c
  }).filter(c => c.score > -999)

  // Sort: score DESC, then stable hash tiebreaker
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return simpleHash(a.key + districtSlug) - simpleHash(b.key + districtSlug)
  })

  return scored.slice(0, 6).map(({ score, ...item }) => item)
}

// ── Dynamic Metrics: Year by Numbers scorer ────────────────────────────────
function scoreYearNumbers(
  pool: MetricPool,
  selectedQuickFactKeys: Set<string>,
  districtVal: any,
  currentYearVal: string,
  fmtShort: (d: string) => string,
): NumberCard[] {
  const shortName = districtVal?.shortName || districtVal?.name || ''

  // Mandatory card
  const mandatory: NumberCard = {
    key: 'schoolWeeks',
    label: 'School year',
    value: pool.schoolWeeks,
    unit: 'weeks',
    description: `The ${currentYearVal} year runs ${fmtShort(pool.firstDay)} through ${fmtShort(pool.lastDay)}, spanning ${pool.schoolWeeks} weeks.`,
  }

  type ScoredCard = NumberCard & { score: number }
  const candidates: ScoredCard[] = []

  // longestInstructionalStretch
  if (pool.longestInstructionalStretch) {
    const ls = pool.longestInstructionalStretch
    const bonus = ls.weeks > 8 ? 10 : 0
    candidates.push({
      key: 'longestInstructionalStretch',
      label: 'Longest school stretch',
      value: ls.weeks,
      unit: 'weeks',
      description: `The longest stretch without a student day off runs ${ls.weeks} weeks — ${fmtShort(ls.start)} through ${fmtShort(ls.end)}.`,
      score: 85 + bonus,
    })
  }

  // winterBreakLength
  if (pool.winterBreakLength !== null && pool.winterBreakStart && pool.winterBreakEnd) {
    const bonus = pool.winterBreakLength > 14 ? 10 : 0
    const penalty = selectedQuickFactKeys.has('longestBreak') ? -30 : 0
    candidates.push({
      key: 'winterBreakLength',
      label: 'Winter break',
      value: pool.winterBreakLength,
      unit: 'days',
      description: `Winter break runs ${fmtShort(pool.winterBreakStart)} to ${fmtShort(pool.winterBreakEnd)} — ${pool.winterBreakLength} calendar days.`,
      score: 80 + bonus + penalty,
    })
  }

  // totalDaysOff
  candidates.push({
    key: 'totalDaysOff',
    label: 'Student days off',
    value: pool.totalDaysOff,
    unit: 'days',
    description: `Students get ${pool.totalDaysOff} full weekdays off — breaks, holidays, and no-school days combined.`,
    score: 75,
  })

  // springBreakVsPrevYear
  if (pool.springBreakVsPrevYear && pool.springBreakDiffDays !== null) {
    const absDiff = Math.abs(pool.springBreakDiffDays)
    candidates.push({
      key: 'springBreakVsPrevYear',
      label: 'Spring break shift',
      value: absDiff,
      unit: `day${absDiff !== 1 ? 's' : ''} ${pool.springBreakDiffDays > 0 ? 'later' : pool.springBreakDiffDays < 0 ? 'earlier' : 'same'}`,
      description: pool.springBreakVsPrevYear,
      score: 70,
    })
  }

  // instructionalDays (fallback)
  candidates.push({
    key: 'instructionalDays',
    label: 'Instructional days',
    value: pool.instructionalDays,
    unit: 'days',
    description: `${shortName} schedules ${pool.instructionalDays} instructional days for ${currentYearVal}, consistent with state calendar requirements.`,
    score: 55,
  })

  candidates.sort((a, b) => b.score - a.score)
  const top3 = candidates.slice(0, 3).map(({ score, ...c }) => c)

  return [mandatory, ...top3]
}
```

**Step 1:** Paste this block after `computeMetricPool`.

**Step 2:** Typecheck:
```bash
cd /Users/doujiajun/work/mars/myschooldates.com && npx nuxi typecheck 2>&1 | head -30
```

**Step 3:** Commit:
```bash
git add 'app/pages/[district]/index.vue'
git commit -m "feat: add scoreQuickFacts and scoreYearNumbers functions"
```

---

## Task 4: Add computed refs

**File:** `app/pages/[district]/index.vue` — insert after the `yearComparison` computed (around line 299), before the types block added in Task 1.

```typescript
// ── Dynamic Metrics: computed refs ─────────────────────────────────────────
const metricPool = computed(() => {
  if (!cal || !district.value) return null
  return computeMetricPool(
    cal,
    district.value,
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
  return scoreYearNumbers(metricPool.value, quickFactKeys.value, district.value, currentYear, formatShortDate)
})
```

**Step 1:** Paste this block at the correct position.

**Step 2:** Typecheck:
```bash
cd /Users/doujiajun/work/mars/myschooldates.com && npx nuxi typecheck 2>&1 | head -30
```

**Step 3:** Commit:
```bash
git add 'app/pages/[district]/index.vue'
git commit -m "feat: add metricPool, quickFactItems, yearNumberCards computed refs"
```

---

## Task 5: Replace Year at a Glance template

**File:** `app/pages/[district]/index.vue`

Find and replace the entire Year at a Glance section (lines ~884–919):

**Old block to find:**
```html
        <!-- Year at a Glance -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">The Year, by the Numbers</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
```
*(entire block through closing `</div>` of the section)*

**New block:**
```html
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
```

**Step 1:** Make the replacement.

**Step 2:** Run dev server and visually check the Year by Numbers section renders correctly:
```bash
cd /Users/doujiajun/work/mars/myschooldates.com && npm run dev
```
Open `http://localhost:3000/guilford-county-school-calendar` and verify 4 cards appear.

**Step 3:** Commit:
```bash
git add 'app/pages/[district]/index.vue'
git commit -m "feat: replace Year at a Glance with dynamic yearNumberCards template"
```

---

## Task 6: Replace Quick Facts template

**File:** `app/pages/[district]/index.vue`

Find and replace the Quick Facts section (lines ~995–1039).

**Old block to find:**
```html
        <!-- Quick Facts -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Facts — {{ currentYear }}</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
```
*(entire block through the closing `</div>` after the data source row)*

**New block:**
```html
        <!-- Quick Facts -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Facts — {{ currentYear }}</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div v-for="fact in quickFactItems" :key="fact.key" class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold text-gray-900 truncate">{{ fact.value }}</div>
              <div class="text-xs text-gray-500 mt-1 leading-snug">{{ fact.label }}</div>
            </div>
          </div>
          <!-- Data source row (unchanged) -->
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
            <span v-if="!isEstimated" class="ml-1 text-green-600 font-medium">· Verified {{ verifiedDate }}</span>
            <span v-else class="ml-1 text-gray-400">· Not yet verified against official source</span>
          </div>
        </div>
```

**Step 1:** Make the replacement.

**Step 2:** Verify in browser: Quick Facts grid shows 6 distinct, data-driven cells (not the old static ones). Check a second district page to confirm different facts appear.

**Step 3:** Commit:
```bash
git add 'app/pages/[district]/index.vue'
git commit -m "feat: replace Quick Facts with dynamic quickFactItems template"
```

---

## Task 7: Clean up now-unused computeds

**File:** `app/pages/[district]/index.vue`

The old Year at a Glance used `schoolWeeks`, `daysOffCount`, and `winterBreakDays` directly in the template. These are now sourced through `metricPool`. **Do not delete them** — they are still passed as arguments to `computeMetricPool`. No cleanup needed.

**Step 1:** Run typecheck one final time to confirm no unused variable warnings:
```bash
cd /Users/doujiajun/work/mars/myschooldates.com && npx nuxi typecheck 2>&1 | head -50
```

**Step 2:** Build to confirm no SSR/prerender errors:
```bash
cd /Users/doujiajun/work/mars/myschooldates.com && npm run build 2>&1 | tail -20
```

**Step 3:** Final commit:
```bash
git add 'app/pages/[district]/index.vue'
git commit -m "chore: verify dynamic metrics build clean"
```
