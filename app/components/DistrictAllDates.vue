<script setup lang="ts">
const { formatDate, eventTypeLabel, eventTypeColor, isCoveredByBreak } = useDistrictPage()

type CalendarEvent = { date: string; name: string; type: string }
type LegendItem = { label: string; dot: string }

const props = defineProps<{
  events: CalendarEvent[]
  title: string
  sourceUrl: string
  districtName: string
  verifiedDate: string | null
  legend?: LegendItem[]
  mode?: 'all' | 'keyDates'
}>()

type DisplayEvent = CalendarEvent & {
  startDate: string
  endDate: string
  displayName: string
  labelType: string
}

function isPossibleMakeupDay(event: CalendarEvent) {
  const lower = event.name.toLowerCase()
  return lower.includes('possible') && (lower.includes('make-up') || lower.includes('makeup'))
}

const hiddenInKeyDates = new Set(['break_end', 'teacher_workday'])
const visibleEvents = computed(() => props.events.filter(e =>
  props.mode === 'keyDates'
    ? !hiddenInKeyDates.has(e.type) && !isCoveredByBreak(e, props.events)
    : e.type !== 'break_end' && !isCoveredByBreak(e, props.events)
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

  if (event.type === 'no_school' || event.type === 'student_holiday') {
    if (lower.includes('student/staff holiday')) return 'Student/Staff Holiday'
    if (lower.includes('professional learning')) return 'Professional Learning Day'
    if (lower.includes('professional development')) return 'Professional Development'
    if (lower.includes('teacher duty')) return 'Teacher Duty Day'
    if (lower.includes('workday') || lower.includes('work day') || lower.includes('staff workday')) return 'Staff Workday'
    if (lower === 'student holiday') return 'No School'
  }

  if (event.type === 'holiday') {
    return name.replace(/\s+Holiday$/i, '')
  }

  if (event.type === 'academic' && lower.includes('exam')) {
    return 'High School Exam Window'
  }

  return name
}

function displayLabelType(event: CalendarEvent) {
  if (isPossibleMakeupDay(event)) return 'makeup_day'
  if (event.type === 'student_holiday' || event.type === 'teacher_workday') return 'no_school'
  return event.type
}

function displayLabelText(event: DisplayEvent) {
  if (isPossibleMakeupDay(event)) return 'Possible Make-up Day'
  if (event.type === 'break_start') return 'Break'
  if (event.type === 'school_end' && event.displayName.toLowerCase().includes('early dismissal')) return 'Last Day · Early Dismissal'
  if (event.type === 'academic' && event.displayName.toLowerCase().includes('exam')) return 'Exam Window'
  return eventTypeLabel[event.labelType] ?? event.labelType
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
  return prev.labelType === next.labelType &&
    prev.displayName === next.displayName &&
    next.date === nextSchoolDateAfter(prev.endDate)
}

function rangeEndFor(event: CalendarEvent) {
  if (event.type === 'break_start') {
    const end = sortedEvents.value.find(e =>
      e.type === 'break_end' &&
      e.date >= event.date &&
      e.name.replace(/\s+End$/i, '').toLowerCase() === event.name.toLowerCase()
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
  for (const event of visibleEvents.value) {
    const displayEvent: DisplayEvent = {
      ...event,
      startDate: event.date,
      endDate: rangeEndFor(event),
      displayName: normalizeName(event),
      labelType: displayLabelType(event),
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
  const groups: { key: string; label: string; events: DisplayEvent[] }[] = []
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
  return groups
})

function formatDateRange(event: DisplayEvent) {
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
  <div id="all-dates" class="bg-white rounded-xl border border-gray-200 overflow-hidden scroll-mt-24">
    <div class="px-6 py-4 border-b border-gray-100">
      <h2 class="text-lg font-semibold text-gray-900" :class="legend?.length ? 'mb-3' : ''">{{ title }}</h2>
      <div v-if="legend?.length" class="flex flex-wrap gap-3">
        <span
          v-for="item in legend"
          :key="item.label"
          class="inline-flex items-center gap-1.5 text-xs text-gray-500"
        >
          <span class="w-2 h-2 rounded-full flex-shrink-0" :class="item.dot" />
          {{ item.label }}
        </span>
      </div>
    </div>
    <div>
      <div
        v-for="group in monthGroups"
        :key="group.key"
        class="border-b border-gray-100 last:border-b-0"
      >
        <div class="px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-widest">{{ group.label }}</div>
        <div class="divide-y divide-gray-50">
          <div
            v-for="event in group.events"
            :key="event.startDate + event.endDate + event.type + event.displayName"
            class="flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div>
              <div class="font-medium text-gray-900">{{ event.displayName }}</div>
              <div class="text-sm text-gray-500">
                <time v-if="event.startDate === event.endDate" :datetime="event.startDate">{{ formatDateRange(event) }}</time>
                <template v-else>
                  <time :datetime="event.startDate">{{ formatRangeStart(event) }}</time>
                  <span> – </span>
                  <time :datetime="event.endDate">{{ formatRangeEnd(event) }}</time>
                </template>
              </div>
            </div>
            <span class="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap" :class="eventTypeColor[event.labelType]">
              {{ displayLabelText(event) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="px-6 py-3 border-t border-gray-50 flex items-center gap-1.5 text-xs text-gray-600">
      <span>
        <template v-if="mode === 'keyDates'">This list summarizes major student dates and may not include every staff development day, minimum day, school-specific change, or track-specific event. See the official PDF for the complete calendar.</template>
        <template v-if="coveredBreakDateNames.length">
          Dates that fall inside a listed break are included in that break{{ coveredBreakDateNames.length ? ` (${coveredBreakDateNames.join(', ')})` : '' }}.
        </template>
        Sourced from the
        <a :href="sourceUrl" target="_blank" rel="noopener" class="underline hover:text-blue-600 transition-colors">
          {{ districtName }} official calendar
          <span class="sr-only">(opens in a new tab)</span>
        </a>
        <template v-if="verifiedDate"> · Last reviewed {{ verifiedDate }}</template>
      </span>
    </div>
  </div>
</template>
