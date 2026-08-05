<script setup lang="ts">
const { formatDate, eventTypeLabel, eventTypeColor, isCoveredByBreak } = useDistrictPage()

type CalendarEvent = {
  date: string
  endDate?: string
  name: string
  type: string
  description?: string
  preserveOfficialName?: boolean
  labelType?: string
  badgeLabel?: string
  displayDate?: string
  displayAsRange?: boolean
  dates?: string[]
  hideFromAllDates?: boolean
  showDuringBreak?: boolean
  hideLabel?: boolean
  preventRangeMerge?: boolean
}
type LegendItem = { label: string; dot: string }

const props = defineProps<{
  events: CalendarEvent[]
  title: string
  sourceUrl: string
  sourceLabel?: string
  sourceSuffix?: string
  correctionSourceUrl?: string
  correctionSourceLabel?: string
  districtName: string
  verifiedDate: string | null
  legend?: LegendItem[]
  mode?: 'all' | 'keyDates'
  footerMode?: 'default' | 'source_sentence'
  coverageNote?: string
  includedDatesInKeyDates?: string[]
  firstDay?: string
  lastDay?: string
  labelOverrides?: Record<string, string>
  legendStyle?: 'dots' | 'text'
  monthNotes?: Record<string, string>
}>()

type DisplayEvent = CalendarEvent & {
  startDate: string
  endDate: string
  displayName: string
  labelType: string
  hasExplicitEndDate: boolean
}

function isPossibleMakeupDay(event: CalendarEvent) {
  const lower = event.name.toLowerCase()
  return lower.includes('possible') && (lower.includes('make-up') || lower.includes('makeup'))
}

const hiddenInKeyDates = new Set(['break_end', 'teacher_workday'])
const includedDatesInKeyDates = computed(() => new Set(props.includedDatesInKeyDates ?? []))
function isHolidayOutsideStudentYear(event: CalendarEvent) {
  return Boolean(props.firstDay && props.lastDay) &&
    event.type === 'holiday' &&
    (event.date < props.firstDay || event.date > props.lastDay)
}
function isRangeEndEvent(event: CalendarEvent) {
  if (event.type !== 'teacher_workday' && event.type !== 'teacher_professional_learning') return false
  if (!/\bends?\b/i.test(event.name)) return false
  const normalizedEnd = normalizeName(event).toLowerCase()
  return props.events.some(candidate =>
    candidate.type === event.type &&
    candidate.date <= event.date &&
    /\b(begins?|starts?)\b/i.test(candidate.name) &&
    normalizeName(candidate).toLowerCase() === normalizedEnd
  )
}
const visibleEvents = computed(() => props.events.filter(e =>
  !e.hideFromAllDates && (props.mode === 'keyDates'
    ? (!hiddenInKeyDates.has(e.type) || includedDatesInKeyDates.value.has(e.date)) &&
      !isRangeEndEvent(e) &&
      !isHolidayOutsideStudentYear(e) &&
      (e.showDuringBreak || e.type === 'holiday' || !isCoveredByBreak(e, props.events))
    : e.type !== 'break_end' && !isRangeEndEvent(e) && (e.showDuringBreak || !isCoveredByBreak(e, props.events)))
))

const coveredBreakDateNames = computed(() => {
  const names = props.events
    .filter(e => isCoveredByBreak(e, props.events))
    .map(e => normalizeName(e))
  return [...new Set(names)]
})

const sortedEvents = computed(() =>
  [...props.events].sort((a, b) => a.date.localeCompare(b.date))
)

function normalizeName(event: CalendarEvent) {
  const name = event.name.trim()
  const lower = name.toLowerCase()

  if (event.preserveOfficialName) return name

  if (event.type === 'break_start' || event.type === 'break_end') {
    return name
      .replace(/\b(Begins|Begin|Starts|Start|Ends|End)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  if (event.type === 'teacher_workday' || event.type === 'teacher_professional_learning') {
    return name
      .replace(/\b(Begins|Begin|Starts|Start|Ends|End)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  if (event.type === 'no_school' || event.type === 'student_holiday') {
    if (lower.includes('student/staff holiday')) return 'Student and Staff Holiday'
    if (lower.includes('professional learning')) return 'Professional Learning Day'
    if (lower.includes('professional development')) return 'Professional Development'
    if (lower.includes('teacher duty')) return 'Teacher Duty Day'
    if (lower.includes('workday') || lower.includes('work day') || lower.includes('staff workday')) return 'Staff Workday'
    if (lower === 'student holiday') return 'No School'
  }

  if (event.type === 'holiday') {
    if (lower === 'district holiday') return 'District Holiday'
    if (lower.includes('martin luther king')) return 'Martin Luther King Jr. Day'
    return name.replace(/\s+Holiday$/i, '')
  }

  if (event.type === 'academic' && lower.includes('exam')) {
    if (lower === 'exam' || lower === 'exams' || lower === 'final exams' || lower === 'semester exams') {
      return 'High School Exam Window'
    }
    return name
  }

  return name
}

function displayLabelType(event: CalendarEvent) {
  if (event.labelType) return event.labelType
  if (isPossibleMakeupDay(event)) return 'makeup_day'
  if (event.type === 'student_holiday') return 'no_school'
  return event.type
}

function displayLabelText(event: DisplayEvent) {
  if (event.badgeLabel) return event.badgeLabel
  let label = ''
  if (event.labelType === 'staff_date') label = 'Teachers'
  else if (event.labelType === 'partial_closure') label = 'Some Students Off'
  else if (isPossibleMakeupDay(event)) label = 'Possible Make-up Day'
  else if (event.type === 'makeup_day' && event.displayName.toLowerCase().includes('conditional')) label = 'Conditional'
  else if (event.type === 'break_start') label = 'Break'
  else if (event.type === 'observance') label = 'Observance'
  else if (event.type === 'schools_closed') label = 'Schools Closed'
  else if (event.type === 'schools_offices_closed') label = 'Schools & Offices Closed'
  else if (event.type === 'teacher_professional_learning') label = 'Professional Development'
  else if (event.type === 'digital_learning') label = 'Online Learning'
  if (
    !label &&
    event.type === 'teacher_workday' &&
    (event.displayName.toLowerCase().includes('student holiday') ||
      event.displayName.toLowerCase().includes('schools closed for students') ||
      event.displayName.toLowerCase().includes('students do not attend'))
  ) label = 'No School for Students'
  else if (!label && event.type === 'teacher_workday') label = 'Staff Day'
  else if (!label && event.type === 'school_end' && event.displayName.toLowerCase().includes('observance')) label = 'Last Day · Early Dismissal · Observance'
  else if (!label && event.type === 'school_end' && (event.displayName.toLowerCase().includes('early dismissal') || event.displayName.toLowerCase().includes('early release') || event.displayName.toLowerCase().includes('early closing'))) label = 'Last Day · Early Closing'
  else if (!label && event.type === 'academic' && event.displayName.toLowerCase().includes('exam')) label = 'Exam Window'
  else if (!label && event.type === 'milestone') {
    const name = event.displayName.toLowerCase()
    if (name.includes('first day')) label = 'First Day'
    else if (name.includes('kindergarten')) label = 'Kindergarten'
    else if (name.includes('report card')) label = 'Report Cards'
    else if (name.includes('senior')) label = 'Seniors'
    else if (name.includes('commencement') || name.includes('graduation')) label = 'Graduation'
    else if (name.includes('break begins') || name.includes('break begins at')) label = 'Break Begins'
    else if (name.includes('summer school')) label = 'Summer School'
  }
  label = label || eventTypeLabel[event.labelType] || event.labelType
  return props.labelOverrides?.[label] ?? label
}

function displayEventName(event: DisplayEvent) {
  if (event.type === 'teacher_professional_learning' && event.startDate !== event.endDate) {
    return 'Teacher Professional Learning Days'
  }
  if (
    (event.type === 'teacher_workday' || event.type === 'teacher_professional_learning') &&
    event.startDate !== event.endDate &&
    event.displayName.toLowerCase().includes('workday')
  ) {
    return event.displayName.replace(/\bWorkday\b/i, 'Workdays')
  }
  if (
    (event.type === 'teacher_workday' || event.type === 'teacher_professional_learning') &&
    event.displayName === 'Professional Development Day' &&
    event.startDate !== event.endDate
  ) {
    return 'Professional Development Days'
  }
  if (
    event.type === 'teacher_professional_learning' &&
    event.startDate !== event.endDate &&
    event.displayName.toLowerCase().includes('teacher professional learning') &&
    !event.displayName.toLowerCase().includes('days')
  ) {
    return event.displayName.replace(/Teacher Professional Learning(?: Day)?/i, 'Teacher Professional Learning Days')
  }
  return event.displayName
}

function parseDate(date: string) {
  return new Date(date + 'T00:00:00')
}

function dateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function nextSchoolDateAfter(date: string) {
  const next = parseDate(date)
  next.setDate(next.getDate() + 1)
  while (next.getDay() === 0 || next.getDay() === 6) {
    next.setDate(next.getDate() + 1)
  }
  return dateKey(next)
}

function canMerge(prev: DisplayEvent, next: DisplayEvent) {
  if (prev.preventRangeMerge || next.preventRangeMerge) return false
  if (prev.labelType === 'observance' || next.labelType === 'observance') return false
  if (prev.hasExplicitEndDate || next.hasExplicitEndDate) return false
  return prev.labelType === next.labelType &&
    prev.displayName === next.displayName &&
    (prev.description ?? '') === (next.description ?? '') &&
    next.date === nextSchoolDateAfter(prev.endDate)
}

function shouldShowDescription(event: DisplayEvent) {
  if (!event.description) return false
  if (event.type === 'academic' && /PLC Day \(Delayed Start\)/i.test(event.displayName)) return false
  return true
}

function rangeEndFor(event: CalendarEvent) {
  if (event.endDate) {
    return event.endDate
  }

  if (event.type === 'break_start') {
    const normalizedStart = normalizeName(event).toLowerCase()
    const end = sortedEvents.value.find(e =>
      e.type === 'break_end' &&
      e.date >= event.date &&
      normalizeName(e).toLowerCase() === normalizedStart
    )
    return end?.date ?? event.date
  }

  if ((event.type === 'teacher_workday' || event.type === 'teacher_professional_learning') && /\b(begins?|starts?)\b/i.test(event.name)) {
    const normalizedStart = normalizeName(event).toLowerCase()
    const end = sortedEvents.value.find(e =>
      e.type === event.type &&
      e.date >= event.date &&
      /\bends?\b/i.test(e.name) &&
      normalizeName(e).toLowerCase() === normalizedStart
    )
    return end?.date ?? event.date
  }

  if (event.type === 'academic' && event.name.toLowerCase().includes('exam')) {
    const start = parseDate(event.date)
    const max = parseDate(event.date)
    max.setDate(max.getDate() + 10)
    const end = sortedEvents.value.find(e => {
      if (e.date <= event.date) return false
      const d = parseDate(e.date)
      return d <= max && ['early_dismissal', 'school_end'].includes(e.type)
    })
    return end?.date ?? event.date
  }

  return event.date
}

const mergedEvents = computed(() => {
  const merged: DisplayEvent[] = []
  for (const event of [...visibleEvents.value].sort((a, b) => a.date.localeCompare(b.date))) {
    const displayEvent: DisplayEvent = {
      ...event,
      startDate: event.date,
      endDate: rangeEndFor(event),
      displayName: normalizeName(event),
      labelType: displayLabelType(event),
      hasExplicitEndDate: Boolean(event.endDate),
    }
    const prev = merged[merged.length - 1]
    if (prev && canMerge(prev, displayEvent)) {
      prev.endDate = displayEvent.endDate
    } else {
      merged.push(displayEvent)
    }
  }
  return merged
})

const monthGroups = computed(() => {
  const groups: { key: string; label: string; events: DisplayEvent[]; note?: string }[] = []
  for (const event of mergedEvents.value) {
    const date = parseDate(event.startDate)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    let group = groups.find(g => g.key === key)
    if (!group) {
      group = {
        key,
        label: date.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        events: [],
      }
      groups.push(group)
    }
    group.events.push(event)
  }
  for (const [key, note] of Object.entries(props.monthNotes ?? {})) {
    if (groups.some(group => group.key === key)) continue
    const [year, month] = key.split('-')
    const date = parseDate(`${year}-${month}-01`)
    groups.push({
      key,
      label: date.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      events: [],
      note,
    })
  }
  return groups.sort((a, b) => a.key.localeCompare(b.key))
})

function monthAnchor(key: string) {
  return `dates-${key}`
}

function formatDateRange(event: DisplayEvent) {
  if (event.displayDate) return event.displayDate
  if (event.startDate === event.endDate) return formatDate(event.startDate)

  const start = parseDate(event.startDate)
  const end = parseDate(event.endDate)
  const sameYear = start.getFullYear() === end.getFullYear()
  const sameMonth = sameYear && start.getMonth() === end.getMonth()

  if (sameMonth) {
    const startWeekday = start.toLocaleDateString('en-US', { weekday: 'long' })
    const endWeekday = end.toLocaleDateString('en-US', { weekday: 'long' })
    const month = start.toLocaleDateString('en-US', { month: 'long' })
    return `${startWeekday}–${endWeekday}, ${month} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`
  }

  const startPart = start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  const endPart = end.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  return `${startPart} to ${endPart}`
}

function displayDateRangeParts(event: DisplayEvent) {
  if (!event.displayDate || event.startDate === event.endDate) return null
  if (event.displayDate.includes(';')) return null
  const separator = event.displayDate.includes('–') ? '–' : event.displayDate.includes(' - ') ? ' - ' : ''
  if (!separator) return null
  const [startLabel, endLabel] = event.displayDate.split(separator)
  if (!startLabel?.trim() || !endLabel?.trim()) return null
  return {
    startLabel: startLabel.trim(),
    endLabel: endLabel.trim(),
  }
}

function formatDateListParts(dates: string[]) {
  const parsed = dates.map(date => ({ date, parsed: parseDate(date) }))
  const sameYear = parsed.every(item => item.parsed.getFullYear() === parsed[0]!.parsed.getFullYear())
  const sameMonth = sameYear && parsed.every(item => item.parsed.getMonth() === parsed[0]!.parsed.getMonth())
  if (sameMonth) {
    const month = parsed[0]!.parsed.toLocaleDateString('en-US', { month: 'long' })
    const year = parsed[0]!.parsed.getFullYear()
    return parsed.map((item, index) => ({
      date: item.date,
      label: index === 0
        ? `${month} ${item.parsed.getDate()}`
        : index === parsed.length - 1
        ? `${item.parsed.getDate()}, ${year}`
        : `${item.parsed.getDate()}`,
    }))
  }
  return parsed.map(item => ({ date: item.date, label: formatDate(item.date) }))
}

function dateListSeparator(index: number, total: number) {
  if (index === 0) return ''
  if (index === total - 1) return total === 2 ? ' and ' : ', and '
  return ', '
}

function formatRangeStart(event: DisplayEvent) {
  if (event.startDate === event.endDate) return formatDate(event.startDate)
  const start = parseDate(event.startDate)
  const end = parseDate(event.endDate)
  const sameYear = start.getFullYear() === end.getFullYear()
  const sameMonth = sameYear && start.getMonth() === end.getMonth()

  if (sameMonth) {
    const weekday = start.toLocaleDateString('en-US', { weekday: 'long' })
    const month = start.toLocaleDateString('en-US', { month: 'long' })
    return `${weekday}, ${month} ${start.getDate()}`
  }

  return start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function formatRangeEnd(event: DisplayEvent) {
  const start = parseDate(event.startDate)
  const end = parseDate(event.endDate)
  const sameYear = start.getFullYear() === end.getFullYear()
  const sameMonth = sameYear && start.getMonth() === end.getMonth()

  if (sameMonth) {
    const weekday = end.toLocaleDateString('en-US', { weekday: 'long' })
    const month = end.toLocaleDateString('en-US', { month: 'long' })
    return `${weekday}, ${month} ${end.getDate()}, ${end.getFullYear()}`
  }

  return end.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div id="all-dates" class="bg-rds-surface-panel rounded-lg border border-rds-hairline overflow-hidden scroll-mt-24 shadow-[0_1px_0_rgba(31,41,51,0.03)]">
    <div class="px-6 py-4 border-b border-[#ebe6dd]">
      <h2 class="text-lg font-semibold text-[#1f2933]" :class="legend?.length ? 'mb-3' : ''">{{ title }}</h2>
      <div v-if="legend?.length" class="flex flex-wrap items-center gap-3">
        <span class="text-xs font-semibold uppercase tracking-wide text-[#8a8176]">Common date types</span>
        <span
          v-for="item in legend"
          :key="item.label"
          class="inline-flex items-center gap-1.5 text-xs text-[#7b756d]"
        >
          <span v-if="legendStyle !== 'text'" class="w-2 h-2 rounded-lg flex-shrink-0" :class="item.dot" />
          {{ item.label }}
        </span>
      </div>
      <nav
        v-if="monthGroups.length > 1"
        aria-label="Jump to month"
        class="mt-4 flex gap-2 overflow-x-auto pb-1"
      >
        <a
          v-for="group in monthGroups"
          :key="group.key"
          :href="`#${monthAnchor(group.key)}`"
          class="inline-flex flex-shrink-0 items-center rounded-lg border border-[#e1dbd0] bg-[#f3f0e8] px-3 py-1.5 text-xs font-medium text-[#6b645c] transition-colors hover:border-[#b8c9c9] hover:bg-[#e6f0ef] hover:text-[#0f5d6b]"
        >
          {{ group.label.split(' ')[0] }}
        </a>
      </nav>
    </div>
    <div>
      <div
        v-for="group in monthGroups"
        :key="group.key"
        class="border-b border-[#ebe6dd] last:border-b-0"
      >
        <div
          :id="monthAnchor(group.key)"
          class="px-6 py-3 bg-[#f3f0e8] text-xs font-semibold text-[#7b756d] uppercase tracking-widest scroll-mt-24"
        >
          {{ group.label }}
        </div>
        <div class="divide-y divide-[#eee9df]">
          <p v-if="!group.events.length && group.note" class="px-6 py-4 text-sm text-[#6b645c]">
            {{ group.note }}
          </p>
          <div
            v-for="event in group.events"
            :key="event.startDate + event.endDate + event.type + event.displayName"
            class="flex flex-col items-start gap-2 px-6 py-4 hover:bg-[#f6f2ea] transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <div>
              <div class="font-medium text-[#1f2933]">{{ displayEventName(event) }}</div>
              <div class="text-sm text-[#7b756d]">
                <template v-if="displayDateRangeParts(event)">
                  <time :datetime="event.startDate">{{ displayDateRangeParts(event)!.startLabel }}</time>
                  <span aria-hidden="true">–</span>
                  <time :datetime="event.endDate">{{ displayDateRangeParts(event)!.endLabel }}</time>
                </template>
                <span v-else-if="event.displayDate">{{ event.displayDate }}</span>
                <template v-else-if="event.dates?.length && event.dates.length > 1">
                  <template v-for="(part, index) in formatDateListParts(event.dates)" :key="part.date">
                    <span v-if="index">{{ dateListSeparator(index, event.dates.length) }}</span><time :datetime="part.date">{{ part.label }}</time>
                  </template>
                </template>
                <time v-else-if="event.startDate === event.endDate" :datetime="event.startDate">{{ formatDateRange(event) }}</time>
                <template v-else>
                  <time :datetime="event.startDate">{{ formatRangeStart(event) }}</time>
                  <span> – </span>
                  <time :datetime="event.endDate">{{ formatRangeEnd(event) }}</time>
                </template>
              </div>
              <p v-if="shouldShowDescription(event)" class="mt-1 text-sm text-[#6b645c]">
                {{ event.description }}
              </p>
            </div>
            <span v-if="!event.hideLabel" class="text-xs font-medium px-2.5 py-1 rounded-lg whitespace-normal sm:whitespace-nowrap" :class="eventTypeColor[event.labelType]">
              {{ displayLabelText(event) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="px-6 py-3 border-t border-[#ebe6dd] flex items-center gap-1.5 text-xs text-[#6b645c]">
      <span>
        <template v-if="footerMode === 'source_sentence'">
          {{ coverageNote || "This list includes districtwide student dates." }}
          <a :href="sourceUrl" target="_blank" rel="noopener" class="inline-flex min-h-11 items-center underline hover:text-[#0f5d6b] transition-colors">
            {{ sourceLabel || `${districtName} official calendar` }}<span class="sr-only">(opens in a new tab)</span>
          </a><template v-if="sourceSuffix">. {{ sourceSuffix }}.</template><template v-else>.</template>
          <template v-if="correctionSourceUrl">
            Check the
            <a :href="correctionSourceUrl" target="_blank" rel="noopener" class="inline-flex min-h-11 items-center underline hover:text-[#0f5d6b] transition-colors">
              {{ correctionSourceLabel || 'district calendar page' }}<span class="sr-only">(opens in a new tab)</span>
            </a>
            for corrections or revised versions.
          </template>
        </template>
        <template v-else>
          <template v-if="mode === 'keyDates'">{{ coverageNote || "This table lists major districtwide student dates. Check the official PDF and your school's calendar for campus events, dismissal times, testing, and schedule changes." }}</template>
          <template v-else>{{ coverageNote || "This table lists major districtwide student dates. Check the official PDF and your school's calendar for campus events, dismissal times, testing, and schedule changes." }} </template>
          <template v-if="coveredBreakDateNames.length">
            Dates listed within a vacation period are already included in that period and are not listed separately{{ coveredBreakDateNames.length ? ` (${coveredBreakDateNames.join(', ')})` : '' }}.
          </template>
          Based on the
          <a :href="sourceUrl" target="_blank" rel="noopener" class="inline-flex min-h-11 items-center underline hover:text-[#0f5d6b] transition-colors">
            {{ sourceLabel || `${districtName} official calendar` }}<span class="sr-only">(opens in a new tab)</span>
          </a>
        </template>
      </span>
    </div>
  </div>
</template>
