<script setup lang="ts">
import type { StudentCalendarEvent } from '~/utils/calendarOverview'
import { isPairedStudentEventEnd, isStudentKeyDate, normalizeStudentEventName, pairedStudentEventEndDate } from '~/utils/calendarOverview'

type CalendarEvent = StudentCalendarEvent & {
  displayDate?: string
}

const props = defineProps<{
  cal: {
    firstDay: string
    lastDay: string
    events: CalendarEvent[]
  }
}>()

const { getBreaks } = useDistrictPage()

function normalizeName(event: CalendarEvent) {
  return normalizeStudentEventName(event)
}

function rangeEnd(event: CalendarEvent) {
  if (event.endDate) return event.endDate
  if (event.dates?.length) return [...event.dates].sort().at(-1) ?? event.date ?? ''
  const pairedEnd = pairedStudentEventEndDate(event, props.cal.events)
  if (pairedEnd) return pairedEnd
  if (event.type === 'break' || event.type === 'break_start') {
    const schoolBreak = getBreaks(props.cal.events).find(item => item.start === event.date)
    if (schoolBreak) return schoolBreak.end
  }
  return event.date ?? ''
}

function statusFor(event: CalendarEvent) {
  if (event.type === 'school_start') return { label: 'First Day', tone: 'milestone' }
  if (event.type === 'school_end') return { label: 'Last Day', tone: 'milestone' }
  if (event.type === 'break' || event.type === 'break_start') return { label: 'School Break', tone: 'break' }
  if (['holiday', 'closure', 'no_school', 'student_holiday'].includes(event.type)) return { label: 'No School', tone: 'holiday' }
  if (['early_release', 'early_dismissal', 'early_close'].includes(event.type)) return { label: 'Early Dismissal', tone: 'important' }
  if (event.type === 'academic') return { label: /exam|test/i.test(event.name) ? 'Exam Date' : 'Academic Date', tone: 'important' }
  return { label: 'Important Date', tone: 'important' }
}

function parseDate(date: string) {
  return new Date(`${date}T00:00:00`)
}

function nextSchoolDate(date: string) {
  const next = parseDate(date)
  next.setDate(next.getDate() + 1)
  while (next.getDay() === 0 || next.getDay() === 6) next.setDate(next.getDate() + 1)
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`
}

const keyDates = computed(() => {
  const raw = props.cal.events
    .filter(event => isStudentKeyDate(event) && !isPairedStudentEventEnd(event, props.cal.events))
    .map(event => ({
      name: normalizeName(event),
      start: event.date!,
      end: rangeEnd(event),
      status: statusFor(event),
    }))
    .sort((a, b) => a.start.localeCompare(b.start))

  if (!raw.some(event => event.start === props.cal.firstDay)) {
    raw.push({ name: 'First Day of School', start: props.cal.firstDay, end: props.cal.firstDay, status: { label: 'First Day', tone: 'milestone' } })
  }
  if (!raw.some(event => event.start === props.cal.lastDay)) {
    raw.push({ name: 'Last Day of School', start: props.cal.lastDay, end: props.cal.lastDay, status: { label: 'Last Day', tone: 'milestone' } })
  }
  raw.sort((a, b) => a.start.localeCompare(b.start))

  return raw.reduce<typeof raw>((merged, event) => {
    const previous = merged.at(-1)
    if (
      previous &&
      previous.name === event.name &&
      previous.status.label === event.status.label &&
      (event.start === nextSchoolDate(previous.end) || event.start <= previous.end)
    ) {
      if (event.end > previous.end) previous.end = event.end
      return merged
    }
    merged.push({ ...event })
    return merged
  }, [])
})

function formatLongDate(date: string) {
  return parseDate(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatRange(start: string, end: string) {
  return start === end ? formatLongDate(start) : `${formatLongDate(start)} - ${formatLongDate(end)}`
}
</script>

<template>
  <section id="key-dates" class="district-key-dates-table scroll-mt-24" aria-labelledby="key-dates-title">
    <header class="district-key-dates-table__intro">
      <p class="district-overview-eyebrow">Plan ahead</p>
      <h2 id="key-dates-title">Key Dates</h2>
      <p>Student holidays, recess periods, school-year milestones, and other high-impact dates from the published district calendar.</p>
    </header>

    <div class="district-key-dates-table__frame">
      <table>
        <colgroup>
          <col class="district-key-dates-table__event-col">
          <col class="district-key-dates-table__date-col">
          <col class="district-key-dates-table__status-col">
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Event</th>
            <th scope="col">Date(s)</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in keyDates" :key="`${event.start}-${event.end}-${event.name}`">
            <th scope="row">{{ event.name }}</th>
            <td class="district-key-dates-table__date">
              <time :datetime="event.start">{{ formatRange(event.start, event.end) }}</time>
            </td>
            <td>
              <span class="district-key-dates-table__status" :data-tone="event.status.tone">{{ event.status.label }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
