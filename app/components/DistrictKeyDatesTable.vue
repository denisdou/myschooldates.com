<script setup lang="ts">
import type { StudentCalendarEvent } from '~/utils/calendarOverview'
import { isPairedStudentEventEnd, isStudentKeyDate, normalizeStudentEventName } from '~/utils/calendarOverview'
import { detailEventRanges, formatCalendarRange } from '~/utils/calendarDetails'

type CalendarEvent = StudentCalendarEvent & {
  displayDate?: string
  status?: string
  preserveOfficialName?: boolean
  preventRangeMerge?: boolean
}

const props = defineProps<{
  districtName?: string
  year?: string
  cal: {
    firstDay: string
    lastDay: string
    events: CalendarEvent[]
  }
}>()

function normalizeName(event: CalendarEvent) {
  return event.preserveOfficialName ? event.name : normalizeStudentEventName(event)
}

function statusFor(event: CalendarEvent) {
  if (event.status === 'TENTATIVE') return { label: 'Conditional', tone: 'important' }
  if (event.status === 'CANCELLED') return { label: 'Cancelled', tone: 'important' }
  if (event.type === 'school_start') return { label: 'School Opens', tone: 'milestone' }
  if (event.type === 'school_end') return { label: 'School Closes', tone: 'milestone' }
  if (event.type === 'break' || event.type === 'break_start') return { label: 'No School', tone: 'holiday' }
  if (['holiday', 'closure', 'no_school', 'student_holiday', 'schools_closed', 'schools_offices_closed'].includes(event.type)) return { label: 'No School', tone: 'holiday' }
  if (['teacher_workday', 'teacher_professional_learning', 'staff_workday', 'staff_development', 'staff_day'].includes(event.type)) return { label: 'No School', tone: 'holiday' }
  if (['early_release', 'early_dismissal', 'early_close', 'half_day_dismissal'].includes(event.type)) return { label: 'Early Dismissal', tone: 'important' }
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
    .filter(event => isStudentKeyDate(event, props.cal) && !isPairedStudentEventEnd(event, props.cal.events))
    .map(event => ({
      name: normalizeName(event),
      start: event.date!,
      end: detailEventRanges(event, props.cal.events).at(-1)?.end ?? event.date!,
      displayDate: event.displayDate ?? (event.dates?.length && !['break', 'break_start'].includes(event.type)
        ? event.dates.map(date => formatCalendarRange(date)).join('; ') : ''),
      preventRangeMerge: Boolean(event.preventRangeMerge),
      status: statusFor(event),
    }))
    .sort((a, b) => a.start.localeCompare(b.start))

  if (!props.cal.events.some(event => event.type === 'school_start' && event.date === props.cal.firstDay)) {
    raw.push({ name: 'First Day of School', start: props.cal.firstDay, end: props.cal.firstDay, displayDate: '', preventRangeMerge: false, status: { label: 'School Opens', tone: 'milestone' } })
  }
  if (!props.cal.events.some(event => event.type === 'school_end' && event.date === props.cal.lastDay)) {
    raw.push({ name: 'Last Day of School', start: props.cal.lastDay, end: props.cal.lastDay, displayDate: '', preventRangeMerge: false, status: { label: 'School Closes', tone: 'milestone' } })
  }
  raw.sort((a, b) => a.start.localeCompare(b.start))

  return raw.reduce<typeof raw>((merged, event) => {
    const previous = merged.at(-1)
    if (
      previous && !previous.displayDate && !event.displayDate && !previous.preventRangeMerge && !event.preventRangeMerge &&
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

</script>

<template>
  <section id="key-dates" class="district-key-dates-table scroll-mt-24" aria-labelledby="key-dates-title">
    <header class="district-key-dates-table__intro">
      <h2 id="key-dates-title">Key Dates</h2>
    </header>

    <div class="district-key-dates-table__frame">
      <table>
        <caption class="sr-only">Key dates for {{ districtName }} {{ year }} school year</caption>
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
              <time :datetime="event.start">{{ event.displayDate || formatCalendarRange(event.start, event.end, true) }}</time>
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
