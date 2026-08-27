export type StudentCalendarEvent = {
  date?: string
  endDate?: string
  dates?: string[]
  name: string
  type: string
  description?: string
  labelType?: string
  badgeLabel?: string
  hideFromAllDates?: boolean
  hideFromKeyDates?: boolean
  hideFromMonthlyList?: boolean
}

const studentDateTypes = new Set([
  'school_start', 'school_end', 'school_resume', 'school_reopen', 'school_return',
  'holiday', 'closure', 'no_school', 'student_holiday', 'schools_closed',
  'operational_closure', 'partial_closure',
  'break', 'break_start',
  'academic', 'testing', 'assessment', 'observance', 'orientation',
  'early_release', 'early_dismissal', 'early_close', 'half_day_dismissal', 'late_start',
  'semester_start', 'semester_end', 'quarter_start', 'quarter_end',
  'grading_period_start', 'grading_period_end',
  'graduation', 'conference', 'makeup_day', 'contingency',
  'weather_day', 'weather_makeup', 'inclement_weather_day',
])

const staffDateTypes = new Set([
  'teacher_workday', 'staff_development', 'staff_workday', 'staff_day',
  'teacher_professional_learning',
])

type RangeMarker = {
  base: string
  phase: 'start' | 'end'
}

function rangeMarker(name: string): RangeMarker | null {
  const match = name.match(/^(.*?)\s+(Begins|Starts|Ends)$/i)
  if (!match?.[1] || !match[2]) return null
  const base = match[1].replace(/\s+/g, ' ').trim()
  if (!/\b(?:administration|testing|assessment|exams?|registration|graduation|window)\b/i.test(base)) return null
  return {
    base,
    phase: /ends/i.test(match[2]) ? 'end' : 'start',
  }
}

function sameRangeMarker(event: StudentCalendarEvent, base: string, phase: RangeMarker['phase']) {
  const marker = rangeMarker(event.name)
  return marker?.phase === phase && marker.base.toLowerCase() === base.toLowerCase()
}

export function pairedStudentEventEndDate(event: StudentCalendarEvent, events: StudentCalendarEvent[]) {
  const marker = rangeMarker(event.name)
  if (!event.date || marker?.phase !== 'start') return undefined
  const startDate = event.date

  const nextStart = events
    .filter(candidate => candidate.date && candidate.date > startDate && sameRangeMarker(candidate, marker.base, 'start'))
    .sort((a, b) => a.date!.localeCompare(b.date!))[0]
  return events
    .filter(candidate =>
      candidate.date &&
      candidate.date >= startDate &&
      (!nextStart?.date || candidate.date < nextStart.date) &&
      sameRangeMarker(candidate, marker.base, 'end')
    )
    .sort((a, b) => a.date!.localeCompare(b.date!))[0]?.date
}

export function isPairedStudentEventEnd(event: StudentCalendarEvent, events: StudentCalendarEvent[]) {
  const marker = rangeMarker(event.name)
  if (!event.date || marker?.phase !== 'end') return false
  const endDate = event.date
  return events.some(candidate =>
    candidate.date &&
    candidate.date <= endDate &&
    sameRangeMarker(candidate, marker.base, 'start') &&
    pairedStudentEventEndDate(candidate, events) === endDate
  )
}

export function normalizeStudentEventName(event: Pick<StudentCalendarEvent, 'name'>) {
  return event.name
    .replace(/\b(Begins|Begin|Starts|Start|Continues|Continued|Ends|End)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isConferenceEarlyDismissalEvent(event: Pick<StudentCalendarEvent, 'name' | 'type'>) {
  const isConference = /parent[ -]?teacher|conferences?/i.test(event.name)
  const isEarlyDismissal = ['early_release', 'early_dismissal', 'early_close', 'half_day_dismissal'].includes(event.type)
    || /early[ -]?(?:release|dismissal|closing)|half[ -]?day/i.test(event.name)
  return isConference && isEarlyDismissal
}

export function isStudentKeyDate(event: StudentCalendarEvent) {
  return isStudentCalendarEvent(event) && !event.hideFromKeyDates && !isConferenceEarlyDismissalEvent(event)
}

export function isStudentCalendarEvent(event: StudentCalendarEvent) {
  if (!event.date || event.hideFromAllDates || event.type === 'break_end') return false

  const eventSignal = [event.name, event.labelType, event.badgeLabel]
    .filter(Boolean)
    .join(' ')
  const description = event.description ?? ''
  const nonNegatedDescription = description.replace(/\b(?:do(?:es)?|is|are|was|were)\s+not\b[^.;]*/gi, '')
  const scheduleImpactPattern = /no[ -]?(?:school|classes|students?|elementary|middle|high|preschool|pre-?kindergarten|pre-?k|4k|ecse)|non[ -]?student|student holiday|schools? closed|early[ -]?(?:release|dismissal|closing)|half[ -]?day|students? (?:do not|don'?t) attend|staggered (?:start|opening)|assigned (?:smaller-group )?sessions?/i
  const isConference = event.type === 'conference' || /parent[ -]?teacher|conferences?/i.test(`${eventSignal} ${description}`)
  const hasScheduleImpact = scheduleImpactPattern.test(eventSignal) || scheduleImpactPattern.test(nonNegatedDescription)
  const isInternalOnly = /^(?:elementary|secondary) grades due$|^FTE (?:period|survey|week)|^four-day work week|^professional development$|^record keeping \/|^school-based professional development$/i.test(event.name)
    || /classified school employee week|day of the teacher observance/i.test(event.name)

  if (isConference && ['academic', 'conference'].includes(event.type) && !hasScheduleImpact) return false
  if (isInternalOnly && !hasScheduleImpact) return false
  if (event.type === 'event' && rangeMarker(event.name)) return true
  if (studentDateTypes.has(event.type)) return true
  if (!staffDateTypes.has(event.type)) return false

  const studentSignal = [event.name, event.description, event.labelType, event.badgeLabel]
    .filter(Boolean)
    .join(' ')
  return /no[ -]?school|non[ -]?student|students? (?:do not|don'?t) attend|schools? closed|pupil[ -]?free/i.test(studentSignal)
}
