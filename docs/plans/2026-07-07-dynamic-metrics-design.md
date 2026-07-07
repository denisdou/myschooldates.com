# Dynamic Metrics: Quick Facts + Year by the Numbers

**Date:** 2026-07-07
**Scope:** `app/pages/[district]/index.vue` — district page only
**Goal:** Replace two static, template-identical modules with dynamic, data-driven content that varies meaningfully across districts.

---

## Problem

Both modules currently output identical structure across every district:

- **Quick Facts**: always Instructional Days / Teacher Work Days / Semesters / Major Breaks / Students / Schools
- **Year by the Numbers**: always Weeks / Days Off / Winter Break / Instructional Days

At scale (thousands of districts), this creates a visible programmatic footprint.

---

## Architecture

```
computeMetricPool(cal, district, breaks, relatedCals, todayStr)
        │
        ▼
   MetricPool (one set of computed values, nulls where not applicable)
        │
   ┌────┴────────────────┐
   ▼                     ▼
scoreQuickFacts()    scoreYearNumbers()
   │                     │
   ▼                     ▼
FactItem[] (6)       NumberCard[] (4)
```

- **One computation layer** — `computeMetricPool()` runs once; no repeated calculations
- **Two independent scoring strategies** — different user intents, separate priority logic
- **Two rendering templates** — grid cells vs. narrative cards
- **Deterministic** — same inputs always produce same output; hash only as tiebreaker
- **Max 1 shared metric** — Year by Numbers scorer receives `selectedQuickFactKeys` and penalizes semantic overlap

---

## Metric Pool

```ts
type MetricPool = {
  // ── Quick Facts candidates (action-oriented) ──────────────────────────────
  nextStudentDayOff:       { name: string; date: string; daysUntil: number } | null
  nextHoliday:             { name: string; date: string; daysUntil: number } | null
  nextTeacherWorkday:      { name: string; date: string; daysUntil: number } | null
  nextBreak:               { name: string; start: string; daysUntil: number } | null
  longestBreak:            { name: string; days: number; start: string; end: string } | null
  breakCount:              number
  daysUntilSpringBreak:    number | null   // null if spring break already passed
  daysBeforeLaborDay:      number | null   // null if school starts on/after Labor Day
  teacherWorkDays:         number | null   // null if 0 or absent
  startDiffNearest:        { days: number; direction: 'earlier' | 'later' | 'same'; vsName: string } | null
  lastDayDiffNearest:      { days: number; direction: 'earlier' | 'later' | 'same'; vsName: string } | null

  // ── Year by Numbers candidates (analytical) ───────────────────────────────
  schoolWeeks:             number          // always non-null
  totalDaysOff:            number          // always non-null
  winterBreakLength:       number | null   // calendar days; null if no winter break found
  longestInstructionalStretch: { weeks: number; start: string; end: string } | null
  instructionalDays:       number          // cal.totalSchoolDays, always non-null
  springBreakVsPrevYear:   string | null   // null if no prevCal
}
```

### Computation notes

- **`nextStudentDayOff`**: first event after today where `type === 'holiday' || type === 'no_school' || type === 'break_start'`
- **`nextTeacherWorkday`**: first event where `type === 'teacher_workday'`; null if type never appears
- **`daysBeforeLaborDay`**: Labor Day = first Monday of September of `cal.firstDay`'s year. Use calendar days (not weekdays). Null if `firstDay >= laborDay`.
- **`startDiffNearest`**: compare `cal.firstDay` with all `relatedCals`. Pick the related district whose first day is closest to current. Report difference in calendar days.
- **`longestInstructionalStretch`**: sort all no-school events (holidays + break_start dates); find longest weekday gap between consecutive no-school events; convert to weeks (`Math.round(weekdays / 5)`).

---

## Quick Facts Scoring

`scoreQuickFacts(pool, todayStr)` → `FactItem[]` (always 6, or fewer only if pool has < 6 non-null candidates).

### Base scores

| Metric | Base |
|---|---|
| `nextStudentDayOff` | 90 |
| `nextTeacherWorkday` | 85 |
| `nextBreak` | 80 |
| `daysUntilSpringBreak` | 75 |
| `longestBreak` | 70 |
| `daysBeforeLaborDay` | 65 |
| `nextHoliday` | 60 |
| `startDiffNearest` | 60 |
| `teacherWorkDays` | 55 |
| `breakCount` | 50 |
| `lastDayDiffNearest` | 45 |

### Recency boost (time-sensitive metrics only)

Applies to: `nextStudentDayOff`, `nextTeacherWorkday`, `nextBreak`, `daysUntilSpringBreak`

| Days until | Boost |
|---|---|
| < 7 | +20 |
| < 14 | +15 |
| < 30 | +10 |

### Redundancy penalties (−999 = effectively excluded)

- If `nextStudentDayOff` selected → `nextHoliday` = −999
- If `nextBreak` selected AND its `start` matches `nextStudentDayOff.date` → `nextBreak` = −999
- If `nextBreak` selected AND it is the spring break → `daysUntilSpringBreak` = −999
- Null pool values → −999

### Tiebreaker (stable sort)

```
score DESC, then hash(metricKey + district.slug) ASC
```

---

## Year by Numbers Scoring

`scoreYearNumbers(pool, selectedQuickFactKeys, district, currentYear)` → exactly 4 `NumberCard[]`.

```ts
type NumberCard = {
  label:       string
  value:       number
  unit:        string
  description: string
}
```

### Selection

**Always included (1 mandatory):**
- `schoolWeeks`

**Scored — pick top 3 from:**

| Metric | Base | Bonus |
|---|---|---|
| `longestInstructionalStretch` | 85 | +10 if stretch > 8 weeks |
| `winterBreakLength` | 80 | +10 if > 14 days |
| `totalDaysOff` | 75 | — |
| `springBreakVsPrevYear` | 70 | only if prevCal exists |
| `instructionalDays` | 55 | fallback, always non-null |

**Overlap penalty:** If `longestBreak` key appears in `selectedQuickFactKeys` → `winterBreakLength` −30.

### Description templates

| Metric | Description |
|---|---|
| `schoolWeeks` | "The {{ year }} year runs {{ firstDay }} through {{ lastDay }}, spanning {{ value }} weeks." |
| `longestInstructionalStretch` | "The longest stretch without a student day off runs {{ value }} weeks — {{ start }} through {{ end }}." |
| `winterBreakLength` | "Winter break runs {{ wbStart }} to {{ wbEnd }} — {{ value }} calendar days." |
| `totalDaysOff` | "Students get {{ value }} full weekdays off — breaks, holidays, and no-school days combined." |
| `springBreakVsPrevYear` | (use existing `yearComparison` string) |
| `instructionalDays` | "{{ shortName }} schedules {{ value }} instructional days for {{ year }}, consistent with state calendar requirements." |

---

## Vue Implementation

All code stays in `app/pages/[district]/index.vue` unless the new logic exceeds ~150 lines, in which case extract to `app/composables/useDistrictMetrics.ts`.

### New computeds (add to `<script setup>`)

1. `metricPool` — `computed(() => computeMetricPool(...))`
2. `quickFactItems` — `computed(() => scoreQuickFacts(metricPool.value, todayStr))`
3. `yearNumberCards` — `computed(() => scoreYearNumbers(metricPool.value, quickFactKeys.value, district.value, currentYear))`
4. `quickFactKeys` — `computed(() => new Set(quickFactItems.value.map(f => f.key)))`

### Template changes

- **Lines 884–919** (Year at a Glance): replace with `yearNumberCards` render loop
- **Lines 995–1039** (Quick Facts): replace grid with `quickFactItems` render loop; keep source/verification footer row unchanged

### No JSON changes required for v1.
