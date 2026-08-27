<script setup lang="ts">
import type { StudentCalendarEvent } from '~/utils/calendarOverview'
import { isConferenceEarlyDismissalEvent, isPairedStudentEventEnd, isStudentCalendarEvent, normalizeStudentEventName, pairedStudentEventEndDate } from '~/utils/calendarOverview'

type CalendarEvent = StudentCalendarEvent

type ResolvedEvent = CalendarEvent & {
  start: string
  end: string
  displayName: string
  tone: 'milestone' | 'break' | 'holiday' | 'important'
}

const props = defineProps<{
  cal: {
    firstDay: string
    lastDay: string
    events: CalendarEvent[]
  }
}>()

const { getBreaks } = useDistrictPage()
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function parseDate(date: string) {
  return new Date(`${date}T00:00:00`)
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function normalizeName(event: CalendarEvent) {
  return normalizeStudentEventName(event)
}

function toneFor(event: CalendarEvent): ResolvedEvent['tone'] {
  if (event.type === 'school_start' || event.type === 'school_end') return 'milestone'
  if (event.type === 'break' || event.type === 'break_start') return 'break'
  if (['holiday', 'closure', 'no_school', 'student_holiday'].includes(event.type)) return 'holiday'
  return 'important'
}

function showInMonthlyList(event: CalendarEvent) {
  if (event.hideFromMonthlyList) return false
  return !isConferenceEarlyDismissalEvent(event)
}

const resolvedEvents = computed<ResolvedEvent[]>(() => {
  const schoolBreaks = getBreaks(props.cal.events)
  return props.cal.events
    .filter(event => isStudentCalendarEvent(event) && !isPairedStudentEventEnd(event, props.cal.events))
    .map((event) => {
      const schoolBreak = schoolBreaks.find(item => item.start === event.date)
      const datesEnd = event.dates?.length ? [...event.dates].sort().at(-1) : undefined
      return {
        ...event,
        start: event.date!,
        end: event.endDate ?? datesEnd ?? pairedStudentEventEndDate(event, props.cal.events) ?? schoolBreak?.end ?? event.date!,
        displayName: normalizeName(event),
        tone: toneFor(event),
      }
    })
    .sort((a, b) => a.start.localeCompare(b.start))
})

const months = computed(() => {
  const first = parseDate(props.cal.firstDay)
  const last = parseDate(props.cal.lastDay)
  const cursor = new Date(first.getFullYear(), first.getMonth(), 1)
  const result: Array<{
    key: string
    label: string
    days: Array<{ key: string; date?: string; day?: number; weekend?: boolean; outsideYear?: boolean; event?: ResolvedEvent }>
    events: ResolvedEvent[]
  }> = []

  while (cursor <= last) {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const monthStart = dateKey(new Date(year, month, 1))
    const monthEnd = dateKey(new Date(year, month + 1, 0))
    const offset = (new Date(year, month, 1).getDay() + 6) % 7
    const dayCount = new Date(year, month + 1, 0).getDate()
    const days = Array.from({ length: 42 }, (_, index) => {
      const day = index - offset + 1
      if (day < 1 || day > dayCount) return { key: `blank-${index}` }
      const date = dateKey(new Date(year, month, day))
      const event = resolvedEvents.value
        .filter(item => item.start <= date && item.end >= date)
        .sort((a, b) => ({ milestone: 4, break: 3, holiday: 2, important: 1 }[b.tone] - { milestone: 4, break: 3, holiday: 2, important: 1 }[a.tone]))[0]
      const weekday = new Date(year, month, day).getDay()
      return {
        key: date,
        date,
        day,
        weekend: weekday === 0 || weekday === 6,
        outsideYear: date < props.cal.firstDay || date > props.cal.lastDay,
        event,
      }
    })

    result.push({
      key: `${year}-${String(month + 1).padStart(2, '0')}`,
      label: cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      days,
      events: resolvedEvents.value.filter(event =>
        event.start <= monthEnd && event.end >= monthStart && showInMonthlyList(event)
      ),
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return result
})

function dayClass(day: { weekend?: boolean; outsideYear?: boolean; event?: ResolvedEvent }) {
  if (day.event) return `district-month-calendar__day--${day.event.tone}`
  if (day.outsideYear) return 'district-month-calendar__day--outside'
  if (day.weekend) return 'district-month-calendar__day--weekend'
  return 'district-month-calendar__day--school'
}

function formatMonthEventDate(event: ResolvedEvent) {
  const start = parseDate(event.start)
  const end = parseDate(event.end)
  const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (event.start === event.end) return startLabel
  const endLabel = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()
    ? String(end.getDate())
    : end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${startLabel}–${endLabel}`
}

function dayAriaLabel(day: { date?: string; event?: ResolvedEvent }) {
  if (!day.date) return undefined
  const date = parseDate(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  return day.event ? `${date}: ${day.event.displayName}` : date
}
</script>

<template>
  <section id="monthly-calendar" class="district-monthly-calendar scroll-mt-24" aria-labelledby="monthly-calendar-title">
    <header class="district-monthly-calendar__intro">
      <div>
        <p class="district-overview-eyebrow">Month by month</p>
        <h2 id="monthly-calendar-title">Monthly Calendar</h2>
      </div>
      <p>Highlighted dates are taken directly from the published district calendar.</p>
    </header>

    <ul class="district-monthly-calendar__legend" aria-label="Calendar legend">
      <li><span data-tone="school" />School Day</li>
      <li><span data-tone="weekend" />Weekend</li>
      <li><span data-tone="holiday" />Holiday (No School)</li>
      <li><span data-tone="break" />School Break</li>
      <li><span data-tone="milestone" />First / Last Day</li>
      <li><span data-tone="important" />Important Date</li>
    </ul>

    <div class="district-monthly-calendar__grid">
      <article v-for="month in months" :key="month.key" class="district-month-calendar">
        <h3>{{ month.label }}</h3>
        <div class="district-month-calendar__weekdays" aria-hidden="true">
          <span v-for="weekday in weekdays" :key="weekday">{{ weekday }}</span>
        </div>
        <div class="district-month-calendar__days">
          <span
            v-for="day in month.days"
            :key="day.key"
            class="district-month-calendar__day"
            :class="day.date ? dayClass(day) : 'district-month-calendar__day--blank'"
            :aria-label="dayAriaLabel(day)"
          >
            <time v-if="day.date" :datetime="day.date">{{ day.day }}</time>
            <i v-if="day.event" aria-hidden="true" />
          </span>
        </div>
        <ul v-if="month.events.length" class="district-month-calendar__events">
          <li v-for="event in month.events" :key="`${month.key}-${event.start}-${event.displayName}`">
            <span :data-tone="event.tone" aria-hidden="true" />
            <strong>{{ formatMonthEventDate(event) }}</strong>
            <span aria-hidden="true">—</span>
            {{ event.displayName }}
          </li>
        </ul>
        <p v-else class="district-month-calendar__empty">No districtwide key dates published for this month.</p>
      </article>
    </div>
  </section>
</template>
