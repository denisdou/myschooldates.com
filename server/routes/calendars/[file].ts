import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

type DistrictRecord = {
  institutionId: string
  name: string
  shortName?: string
  slug: string
}

type CalendarEvent = {
  date: string
  name: string
  type: string
  description?: string
  calendarExportDescription?: string
  endDate?: string
  dates?: string[]
  preserveOfficialName?: boolean
  exportDatesIndividually?: boolean
  showDuringBreak?: boolean
  hideFromCalendarExport?: boolean
  calendarExportTracks?: string[]
  status?: 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED'
}

type CalendarRecord = {
  institutionId?: string
  schoolYear: string
  firstDay?: string
  lastDay?: string
  totalSchoolDays?: number
  calendarTrackDownloads?: Array<{ id: string; label: string }>
  events: CalendarEvent[]
}

type CalendarManifest = {
  districts: DistrictRecord[]
  calendarsByInstitutionYear: Record<string, CalendarRecord>
}

let manifestCache: CalendarManifest | null = null

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

function escapePdfText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function wrapText(value: string, maxLength = 82) {
  const words = value.split(/\s+/)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxLength && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }

  if (current) lines.push(current)
  return lines
}

function getBreaks(events: CalendarEvent[]) {
  return events
    .filter(event => event.type === 'break_start')
    .map((start) => {
      const normalizedStart = normalizeCalendarName(start).toLowerCase()
      const end = events.find(event =>
        event.type === 'break_end' &&
        event.date >= start.date &&
        normalizeCalendarName(event).toLowerCase() === normalizedStart
      )
      return {
        name: start.name,
        start: start.date,
        end: explicitEventEnd(start) ?? end?.date ?? start.date,
      }
    })
}

function explicitEventEnd(event: CalendarEvent) {
  if (event.endDate) return event.endDate
  if (event.dates?.length) return [...event.dates].sort().at(-1) ?? event.date
  return null
}

function normalizeCalendarName(event: CalendarEvent) {
  if (event.preserveOfficialName) return event.name.trim()
  return event.name
    .replace(/\b(Begins|Begin|Starts|Start|Ends|End)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isRangeEndEvent(event: CalendarEvent, events: CalendarEvent[]) {
  if (event.type !== 'teacher_workday' && event.type !== 'teacher_professional_learning') return false
  if (!/\bends?\b/i.test(event.name)) return false
  const normalizedEnd = normalizeCalendarName(event).toLowerCase()
  return events.some(candidate =>
    candidate.type === event.type &&
    candidate.date <= event.date &&
    /\b(begins?|starts?)\b/i.test(candidate.name) &&
    normalizeCalendarName(candidate).toLowerCase() === normalizedEnd
  )
}

function rangeEndFor(event: CalendarEvent, events: CalendarEvent[]) {
  const explicitEnd = explicitEventEnd(event)
  if (explicitEnd) return explicitEnd

  if ((event.type === 'teacher_workday' || event.type === 'teacher_professional_learning') && /\b(begins?|starts?)\b/i.test(event.name)) {
    const normalizedStart = normalizeCalendarName(event).toLowerCase()
    const end = events.find(candidate =>
      candidate.type === event.type &&
      candidate.date >= event.date &&
      /\bends?\b/i.test(candidate.name) &&
      normalizeCalendarName(candidate).toLowerCase() === normalizedStart
    )
    return end?.date ?? event.date
  }

  return event.date
}

function isCoveredByBreak(event: CalendarEvent, events: CalendarEvent[]) {
  if (event.type === 'break_start' || event.type === 'break_end' || event.type === 'school_resume') return false
  return getBreaks(events).some(breakRange =>
    event.date >= breakRange.start &&
    event.date <= breakRange.end
  )
}

function readJson<T>(path: string) {
  return JSON.parse(readFileSync(path, 'utf-8')) as T
}

function buildManifestFromContent(root: string): CalendarManifest | null {
  const districtsDir = join(root, 'content', 'districts')
  const calendarsDir = join(root, 'content', 'calendars')
  if (!existsSync(districtsDir) || !existsSync(calendarsDir)) return null

  const districts: DistrictRecord[] = []
  const calendarsByInstitutionYear: Record<string, CalendarRecord> = {}

  for (const file of readdirSync(districtsDir)) {
    if (!file.endsWith('.json')) continue
    const district = readJson<DistrictRecord>(join(districtsDir, file))
    if (district.institutionId && district.slug) districts.push(district)
  }

  for (const institutionId of readdirSync(calendarsDir)) {
    const institutionDir = join(calendarsDir, institutionId)
    if (!existsSync(institutionDir)) continue

    for (const file of readdirSync(institutionDir)) {
      if (!file.endsWith('.json')) continue
      const calendar = readJson<CalendarRecord>(join(institutionDir, file))
      if (!calendar.schoolYear) continue
      calendarsByInstitutionYear[`${institutionId}:${calendar.schoolYear}`] = calendar
    }
  }

  return { districts, calendarsByInstitutionYear }
}

function parseStoredJson<T>(value: unknown): T | null {
  if (typeof value === 'string') return JSON.parse(value) as T
  if (value instanceof Uint8Array) return JSON.parse(new TextDecoder().decode(value)) as T
  if (value && typeof value === 'object') return value as T
  return null
}

async function buildManifestFromServerAssets(): Promise<CalendarManifest | null> {
  const value = await useStorage('assets:server').getItem('calendar-route-manifest.json')
  const manifest = parseStoredJson<CalendarManifest>(value)
  if (!manifest?.districts?.length || !Object.keys(manifest.calendarsByInstitutionYear ?? {}).length) return null
  return manifest
}

async function readManifest() {
  const isDevelopment = process.env.NODE_ENV !== 'production'
  if (!isDevelopment && manifestCache) return manifestCache

  if (isDevelopment) {
    const currentContent = buildManifestFromContent(process.cwd())
    if (currentContent) return currentContent
  }

  const routeDir = dirname(fileURLToPath(import.meta.url))
  const candidates = [
    join(routeDir, '..', '..', '..', 'calendar-route-manifest.json'),
    join(process.cwd(), 'calendar-route-manifest.json'),
    join(process.cwd(), '.output', 'server', 'calendar-route-manifest.json'),
  ]

  for (const path of candidates) {
    if (!existsSync(path)) continue
    const manifest = readJson<CalendarManifest>(path)
    manifestCache = manifest
    return manifest
  }

  const bundledManifest = await buildManifestFromServerAssets()
  if (bundledManifest) {
    manifestCache = bundledManifest
    return manifestCache
  }

  const fallback = buildManifestFromContent(process.cwd())
  if (fallback) {
    manifestCache = fallback
    return manifestCache
  }

  throw createError({ statusCode: 500, statusMessage: 'Calendar manifest not available' })
}

async function findCalendar(fileParam: string) {
  const normalizedFileParam = fileParam.replace(/\.(ics|pdf)$/i, '')
  const match = normalizedFileParam.match(/^(.+)-(\d{4}-\d{4})(?:-([a-z0-9-]+))?$/)
  if (!match) return null

  const manifest = await readManifest()
  const [, slug, schoolYear, requestedTrack] = match
  const district = manifest.districts.find(item => item.slug === slug)
  if (!district) return null

  const calendar = manifest.calendarsByInstitutionYear[`${district.institutionId}:${schoolYear}`]
  if (!calendar) return null
  const track = requestedTrack
    ? calendar.calendarTrackDownloads?.find(item => item.id === requestedTrack)
    : undefined
  if (requestedTrack && !track) return null

  return {
    district,
    calendar,
    schoolYear,
    track,
  }
}

function buildIcs(district: DistrictRecord, calendar: CalendarRecord, track?: { id: string; label: string }) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MySchoolDates//School Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(`${district.name} ${calendar.schoolYear}${track ? ` — ${track.label}` : ''}`)}`,
  ]

  const breaks = getBreaks(calendar.events)
  const eventsForExport = calendar.events
    .filter(event =>
      !event.hideFromCalendarExport &&
      (!track || !event.calendarExportTracks?.length || event.calendarExportTracks.includes(track.id)) &&
      event.type !== 'break_end' &&
      !isRangeEndEvent(event, calendar.events) &&
      (event.showDuringBreak || event.type === 'observance' || !isCoveredByBreak(event, calendar.events))
    )
    .flatMap(event => event.exportDatesIndividually && event.dates?.length
      ? event.dates.map(date => ({ ...event, date, endDate: undefined, dates: undefined }))
      : [event])

  for (const event of eventsForExport) {
    const breakRange = event.type === 'break_start'
      ? breaks.find(item => item.name === event.name && item.start === event.date)
      : null
    const eventEndDate = breakRange?.end ?? rangeEndFor(event, calendar.events)
    const nextDay = parseDate(eventEndDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const start = compactDate(event.date)
    const end = compactDate(dateKey(nextDay))
    const uidSlug = district.slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
    const summaryName = event.type === 'teacher_workday' || event.type === 'teacher_professional_learning' || event.type === 'break_start'
      ? normalizeCalendarName(event)
      : event.name
    const eventStatus = event.status && ['TENTATIVE', 'CONFIRMED', 'CANCELLED'].includes(event.status)
      ? event.status
      : null
    const eventDescription = event.calendarExportDescription ?? event.description

    lines.push(
      'BEGIN:VEVENT',
      `DTSTAMP:${start}T000000Z`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${escapeText(`${summaryName} - ${district.name}`)}`,
      ...(eventStatus ? [`STATUS:${eventStatus}`] : []),
      ...(eventDescription ? [`DESCRIPTION:${escapeText(eventDescription)}`] : []),
      `UID:${start}-${end}-${event.type}${track ? `-${track.id}` : ''}-${uidSlug}@myschooldates.com`,
      'END:VEVENT',
    )
  }

  lines.push('END:VCALENDAR')
  return `${lines.join('\r\n')}\r\n`
}

function buildPdf(district: DistrictRecord, calendar: CalendarRecord) {
  const title = `${district.shortName ?? district.name} Calendar ${calendar.schoolYear}`
  const subtitle = 'Printable school calendar generated by MySchoolDates from reviewed district calendar records.'
  const keyDates = [
    calendar.firstDay ? `First day of school: ${calendar.firstDay}` : null,
    calendar.lastDay ? `Last day of school: ${calendar.lastDay}` : null,
    calendar.totalSchoolDays ? `Instructional days: ${calendar.totalSchoolDays}` : null,
  ].filter(Boolean) as string[]
  const eventLines = calendar.events.map(event => `${event.date}  ${event.name}${event.description ? ` - ${event.description}` : ''}`)
  const lines = [
    title,
    subtitle,
    '',
    ...keyDates,
    '',
    'Important Dates',
    ...eventLines,
    '',
    'Source note: This printable PDF is generated by MySchoolDates for family planning. The official district calendar remains the source of record for revisions and last-minute changes.',
  ].flatMap(line => line ? wrapText(line) : [''])

  const pages: string[] = []
  let commands = [
    'BT',
    '/F1 18 Tf',
    '72 740 Td',
    `(${escapePdfText(lines[0] ?? title)}) Tj`,
    '/F1 10 Tf',
  ]
  let y = 716

  for (const line of lines.slice(1)) {
    if (y < 72) {
      commands.push('ET')
      pages.push(commands.join('\n'))
      commands = ['BT', '/F1 10 Tf', '72 740 Td']
      y = 740
    } else {
      commands.push('0 -16 Td')
      y -= 16
    }
    commands.push(`(${escapePdfText(line)}) Tj`)
  }

  commands.push('ET')
  pages.push(commands.join('\n'))

  const objects: string[] = []
  const addObject = (body: string) => {
    objects.push(body)
    return objects.length
  }

  const catalogId = addObject('<< /Type /Catalog /Pages 2 0 R >>')
  const pagesId = addObject('')
  const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  const pageIds: number[] = []

  for (const pageContent of pages) {
    const contentId = addObject(`<< /Length ${Buffer.byteLength(pageContent, 'utf8')} >>\nstream\n${pageContent}\nendstream`)
    const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`)
    pageIds.push(pageId)
  }

  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`
  objects[catalogId - 1] = '<< /Type /Catalog /Pages 2 0 R >>'

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'))
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`
  }
  const xrefOffset = Buffer.byteLength(pdf, 'utf8')
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`

  return Buffer.from(pdf, 'utf8')
}

export default defineEventHandler(async (event) => {
  const fileParam = getRouterParam(event, 'file') ?? ''
  const match = await findCalendar(fileParam)

  if (!match) {
    throw createError({ statusCode: 404, statusMessage: 'Calendar file not found' })
  }

  const isPdfRequest = fileParam.toLowerCase().endsWith('.pdf')
  const trackSuffix = match.track ? `-${match.track.id}` : ''
  const filename = `${match.district.slug}-${match.schoolYear}${trackSuffix}.${isPdfRequest ? 'pdf' : 'ics'}`

  if (isPdfRequest) {
    const body = buildPdf(match.district, match.calendar)
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', `inline; filename="${filename}"`)
    setHeader(event, 'X-Robots-Tag', 'noindex')
    setHeader(event, 'Cache-Control', 'public, max-age=3600')
    return body
  }

  const body = buildIcs(match.district, match.calendar, match.track)
  setHeader(event, 'Content-Type', 'text/calendar; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
  setHeader(event, 'X-Robots-Tag', 'noindex')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  return body
})
