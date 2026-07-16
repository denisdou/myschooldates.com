import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

type DistrictRecord = {
  institutionId: string
  name: string
  slug: string
}

type CalendarEvent = {
  date: string
  name: string
  type: string
  description?: string
}

type CalendarRecord = {
  schoolYear: string
  events: CalendarEvent[]
}

function parseDate(date: string) {
  return new Date(`${date}T00:00:00`)
}

function dateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function compactDate(date: string) {
  return date.replace(/-/g, '')
}

function escapeText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function getBreaks(events: CalendarEvent[]) {
  return events
    .filter(event => event.type === 'break_start')
    .map((start) => {
      const end = events.find(event =>
        event.type === 'break_end' &&
        event.date >= start.date &&
        event.name.replace(/\s+End$/i, '').toLowerCase() === start.name.toLowerCase()
      )
      return {
        name: start.name,
        start: start.date,
        end: end?.date ?? start.date,
      }
    })
}

function isCoveredByBreak(event: CalendarEvent, events: CalendarEvent[]) {
  if (event.type === 'break_start' || event.type === 'break_end' || event.type === 'school_resume') return false
  return getBreaks(events).some(breakRange =>
    event.date >= breakRange.start &&
    event.date <= breakRange.end
  )
}

function findCalendarFile(root: string, fileParam: string) {
  const normalizedFileParam = fileParam.replace(/\.ics$/i, '')
  const match = normalizedFileParam.match(/^(.+)-(\d{4}-\d{4})$/)
  if (!match) return null

  const [, slug, schoolYear] = match
  const districtDir = join(root, 'content', 'districts')

  for (const file of readdirSync(districtDir)) {
    if (!file.endsWith('.json')) continue
    const district = JSON.parse(readFileSync(join(districtDir, file), 'utf-8')) as DistrictRecord
    if (district.slug !== slug) continue

    const calendarPath = join(root, 'content', 'calendars', district.institutionId, `${schoolYear}.json`)
    if (!existsSync(calendarPath)) return null

    return {
      district,
      calendarPath,
      schoolYear,
    }
  }

  return null
}

function buildIcs(district: DistrictRecord, calendar: CalendarRecord) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MySchoolDates//School Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(`${district.name} ${calendar.schoolYear}`)}`,
  ]

  const breaks = getBreaks(calendar.events)
  const eventsForExport = calendar.events.filter(event =>
    event.type !== 'break_end' &&
    !isCoveredByBreak(event, calendar.events)
  )

  for (const event of eventsForExport) {
    const breakRange = event.type === 'break_start'
      ? breaks.find(item => item.name === event.name && item.start === event.date)
      : null
    const eventEndDate = breakRange?.end ?? event.date
    const nextDay = parseDate(eventEndDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const start = compactDate(event.date)
    const end = compactDate(dateKey(nextDay))
    const uidSlug = district.slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase()

    lines.push(
      'BEGIN:VEVENT',
      `DTSTAMP:${start}T000000Z`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${escapeText(`${event.name} - ${district.name}`)}`,
      ...(event.description ? [`DESCRIPTION:${escapeText(event.description)}`] : []),
      `UID:${start}-${end}-${event.type}-${uidSlug}@myschooldates.com`,
      'END:VEVENT',
    )
  }

  lines.push('END:VCALENDAR')
  return `${lines.join('\r\n')}\r\n`
}

export default defineEventHandler((event) => {
  const fileParam = getRouterParam(event, 'file') ?? ''
  const root = process.cwd()
  const match = findCalendarFile(root, fileParam)

  if (!match) {
    throw createError({ statusCode: 404, statusMessage: 'Calendar file not found' })
  }

  const calendar = JSON.parse(readFileSync(match.calendarPath, 'utf-8')) as CalendarRecord
  const body = buildIcs(match.district, calendar)
  const filename = `${match.district.slug}-${match.schoolYear}.ics`

  setHeader(event, 'Content-Type', 'text/calendar; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
  setHeader(event, 'X-Robots-Tag', 'noindex')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  return body
})
