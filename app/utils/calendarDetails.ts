import type { StudentCalendarEvent } from './calendarOverview'
import { isPairedStudentEventEnd, isStudentCalendarEvent, normalizeStudentEventName, pairedBreakEndDate, pairedStudentEventEndDate } from './calendarOverview'

export type DetailEvent = StudentCalendarEvent & {
  displayDate?: string
  displayAsRange?: boolean
  exportDatesIndividually?: boolean
  preserveOfficialName?: boolean
  status?: string
}

export type CalendarDetails = {
  firstDay: string
  lastDay: string
  events: DetailEvent[]
}

export function shiftCalendarDate(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function isCalendarWeekend(value: string) {
  return [0, 6].includes(new Date(`${value}T00:00:00Z`).getUTCDay())
}

export function detailEventRanges(event: DetailEvent, events: DetailEvent[]) {
  if (!event.date) return []
  const dates = [...new Set(event.dates ?? [])].sort()
  const isBreak = ['break', 'break_start'].includes(event.type)
  if (dates.length && (event.exportDatesIndividually || (!isBreak && !event.displayAsRange))) {
    return dates.map(date => ({ start: date, end: date }))
  }
  const end = event.endDate ?? dates.at(-1) ?? pairedStudentEventEndDate(event, events) ?? pairedBreakEndDate(event, events)
  return [{ start: event.date, end: end ?? event.date }]
}

export function studentDetailEvents(cal: CalendarDetails) {
  const events = cal.events
    .filter(event => isStudentCalendarEvent(event, cal) && !isPairedStudentEventEnd(event, cal.events))
    .flatMap(event => detailEventRanges(event, cal.events).map(range => ({
      ...event,
      ...range,
      displayName: event.preserveOfficialName ? event.name : normalizeStudentEventName(event),
    })))
  for (const [type, date, name] of [
    ['school_start', cal.firstDay, 'First Day of School'],
    ['school_end', cal.lastDay, 'Last Day of School'],
  ] as const) {
    if (!events.some(event => event.type === type && event.start === date)) {
      events.push({ type, date, start: date, end: date, name, displayName: name })
    }
  }
  return events.sort((a, b) => a.start.localeCompare(b.start))
}

function districtwideClosure(event: DetailEvent) {
  if (event.status === 'TENTATIVE' || event.status === 'CANCELLED') return false
  const signal = `${event.name} ${event.description ?? ''}`
  if (/\b(?:if needed|conditional|possible|tentative|reserved|make[ -]?up|weather day)\b/i.test(signal)) return false
  const audienceName = event.name.replace(/\/\s*(?:elementary|middle|high school) conferences\b/gi, '')
  const limitedAudience = /\b(?:only|some students|except|grades?\s*\d|kindergarten|pre-?k|elementary|middle school|high school)\b/i.test(audienceName)
    || /\b(?:only|some students|except|grades?\s*\d|no[ -]?school (?:for )?(?:elementary|middle|high school|kindergarten)|(?:elementary|middle|high) schools? closed)\b/i.test(event.description ?? '')
  if (limitedAudience
    && !/\b(?:all students|districtwide|k[–-]12|all grades)\b/i.test(signal)) return false
  if (['break', 'break_start', 'holiday', 'closure', 'no_school', 'student_holiday', 'schools_closed', 'schools_offices_closed'].includes(event.type)) return true
  return ['teacher_workday', 'teacher_professional_learning', 'staff_workday', 'staff_development', 'staff_day', 'conference'].includes(event.type)
    && /no[ -]?school|students? (?:do not|don'?t) attend|schools? closed|student holiday|non[ -]?student|pupil[ -]?free/i.test(signal)
}

function groupDates(dates: string[]) {
  return [...new Set(dates)].sort().reduce<Array<{ start: string; end: string }>>((ranges, date) => {
    const previous = ranges.at(-1)
    if (previous && shiftCalendarDate(previous.end, 1) === date) previous.end = date
    else ranges.push({ start: date, end: date })
    return ranges
  }, [])
}

export function extendedTimeOff(cal: CalendarDetails) {
  const closures = studentDetailEvents(cal).filter(districtwideClosure)
  const closureDates = new Set<string>()
  for (const event of closures) {
    for (let date = event.start; date <= event.end; date = shiftCalendarDate(date, 1)) {
      if (date > cal.firstDay && date < cal.lastDay) closureDates.add(date)
    }
  }
  const windows: Array<{ name: string; start: string; end: string; days: number; closures: ReturnType<typeof groupDates>; weekends: ReturnType<typeof groupDates> }> = []
  let dates: string[] = []
  function finishWindow() {
    const published = dates.filter(date => closureDates.has(date))
    if (dates.length >= 4 && published.length) {
      const first = published[0]!
      const last = published.at(-1)!
      const events = closures.filter(event => event.start <= last && event.end >= first)
      const schoolBreak = events.find(event => ['break', 'break_start'].includes(event.type))
      windows.push({
        name: `${schoolBreak?.displayName ?? [...new Set(events.map(event => event.displayName))].join(' / ')} Window`,
        start: dates[0]!,
        end: dates.at(-1)!,
        days: dates.length,
        closures: groupDates(published),
        weekends: groupDates(dates.filter(date => !closureDates.has(date))),
      })
    }
    dates = []
  }
  for (let date = shiftCalendarDate(cal.firstDay, 1); date < cal.lastDay; date = shiftCalendarDate(date, 1)) {
    if (closureDates.has(date) || isCalendarWeekend(date)) dates.push(date)
    else finishWindow()
  }
  finishWindow()
  return windows
}

export function formatCalendarRange(start: string, end = start, weekday = false) {
  const format = (value: string) => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
  if (start !== end) return `${format(start)} – ${format(end)}`
  const day = new Date(`${start}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
  return `${format(start)}${weekday ? ` (${day})` : ''}`
}
