import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const calendarsDir = path.join(rootDir, 'content/calendars')
const districtsDir = path.join(rootDir, 'content/districts')
const outputPath = path.join(rootDir, 'public/data/school-calendar-trends-2026-2027.csv')
const dataOutputPath = path.join(rootDir, 'app/data/school-calendar-trends-2026-2027.json')
const schoolYear = '2026-2027'
const releaseVersion = 'v4.0'
const releaseDate = '2026-08-21'

const breakSignalOverrides = {
  'brunswick-county-schools-calendar': { winter: 'Not listed' },
  'chicago-public-schools-calendar': { spring: 'Not listed' },
  'clark-county-school-district-calendar': { winter: 'Not listed', spring: 'Not listed' },
  'conroe-independent-school-district-calendar': { winter: 'Not listed' },
  'cumberland-county-school-calendar': { spring: 'Mar 15, 2027' },
  'montgomery-county-school-calendar': { spring: 'Mar 31, 2027' },
  'palm-beach-county-school-calendar': { spring: 'Mar 10, 2027' },
  'poway-unified-school-district-calendar': { spring: 'Not listed' },
  'randolph-county-school-system-calendar': { spring: 'Not listed' },
  'sacramento-city-unified-school-calendar': { spring: 'Mar 23, 2027' },
  'san-jose-unified-school-calendar': { winter: 'Feb 15, 2027' },
}

function parseCsvLine(line) {
  const cells = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]

    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        cell += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (character === ',' && !quoted) {
      cells.push(cell)
      cell = ''
    } else {
      cell += character
    }
  }

  cells.push(cell)
  return cells
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`
}

function formatDate(value) {
  if (!value) return 'Not listed'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T12:00:00Z`))
}

function loadExistingLabels() {
  if (!fs.existsSync(outputPath)) return new Map()

  const lines = fs.readFileSync(outputPath, 'utf8').trim().split(/\r?\n/)
  const headers = parseCsvLine(lines[0])
  const districtIndex = headers.indexOf('district')
  const pageIndex = headers.indexOf('myschooldates_page')

  return new Map(lines.slice(1).map((line) => {
    const row = parseCsvLine(line)
    const pathSegments = row[pageIndex].replace(/\/$/, '').split('/')
    const lastSegment = pathSegments.pop()
    const slug = lastSegment === schoolYear ? pathSegments.pop() : lastSegment
    return [slug, row[districtIndex]]
  }))
}

function signalCandidates(calendar, startDate, endDate, signal) {
  const events = [...(calendar.keyDateSummaryItems || []), ...(calendar.events || [])]
  const seen = new Set()

  return events
    .filter(event => event.type === 'break_start' && event.date >= startDate && event.date <= endDate)
    .filter((event) => {
      const key = `${event.date}|${event.name}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((first, second) => {
      const score = (event) => {
        const name = String(event.name || '').toLowerCase()
        const preferredName = signal === 'winter'
          ? /winter|holiday|december|christmas|intersession|vacation/.test(name)
          : /spring|intersession/.test(name)

        return (preferredName ? 30 : 0) + (event.endDate ? 10 : 0)
      }

      return score(second) - score(first)
    })
}

function getBreakSignal(calendar, districtSlug, signal) {
  const override = breakSignalOverrides[districtSlug]?.[signal]
  if (override) return override

  const candidates = signal === 'winter'
    ? signalCandidates(calendar, '2026-12-14', '2026-12-31', signal)
    : signalCandidates(calendar, '2027-03-01', '2027-04-30', signal)

  return formatDate(candidates[0]?.date)
}

function countValues(values) {
  const counts = new Map()

  for (const value of values) {
    counts.set(value, (counts.get(value) || 0) + 1)
  }

  return [...counts.entries()].sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
}

function monthFromDate(value) {
  return value === 'Not listed' ? value : value.split(' ')[0]
}

const existingLabels = loadExistingLabels()
const records = []
const calendarRecords = []

for (const institutionId of fs.readdirSync(calendarsDir)) {
  const calendarPath = path.join(calendarsDir, institutionId, `${schoolYear}.json`)
  const districtPath = path.join(districtsDir, `${institutionId}.json`)

  if (!fs.existsSync(calendarPath) || !fs.existsSync(districtPath)) continue

  const calendar = JSON.parse(fs.readFileSync(calendarPath, 'utf8'))
  const district = JSON.parse(fs.readFileSync(districtPath, 'utf8'))
  const districtLabel = existingLabels.get(district.slug) || district.shortName || district.name

  records.push([
    districtLabel,
    district.state,
    `https://myschooldates.com/${district.slug}/${schoolYear}`,
    formatDate(calendar.firstDay),
    formatDate(calendar.lastDay),
    getBreakSignal(calendar, district.slug, 'winter'),
    getBreakSignal(calendar, district.slug, 'spring'),
  ])
  calendarRecords.push({ calendar, district })
}

records.sort((first, second) => first[1].localeCompare(second[1]) || first[0].localeCompare(second[0]))

const uniquePages = new Set(records.map(row => row[2]))
if (uniquePages.size !== records.length) {
  throw new Error(`Expected unique ${schoolYear} records; found ${records.length} rows and ${uniquePages.size} unique pages.`)
}

const headers = ['district', 'state', 'myschooldates_page', 'first_day', 'last_day', 'winter_break_signal', 'spring_break_signal']
const output = [headers, ...records].map(row => row.map(csvCell).join(',')).join('\n') + '\n'

if (process.argv.includes('--check')) {
  const current = fs.readFileSync(outputPath, 'utf8')
  if (current !== output) {
    console.error('School calendar trends CSV is out of date. Run pnpm trends:refresh.')
    process.exit(1)
  }
} else {
  fs.writeFileSync(outputPath, output)
}

const explicitDayCounts = calendarRecords.filter(({ calendar }) => calendar.totalSchoolDays != null)
const summary = {
  records: records.length,
  states: new Set(records.map(row => row[1])).size,
  startMonths: countValues(records.map(row => monthFromDate(row[3]))),
  topFirstDays: countValues(records.map(row => row[3])).slice(0, 10),
  endMonths: countValues(records.map(row => monthFromDate(row[4]))),
  topLastDays: countValues(records.map(row => row[4])).slice(0, 10),
  winterBreakSignals: countValues(records.map(row => row[5])).slice(0, 10),
  springBreakSignals: countValues(records.map(row => row[6])).slice(0, 15),
  stateCounts: countValues(records.map(row => row[1])),
  instructionalDayCounts: countValues(calendarRecords.map(({ calendar }) => calendar.totalSchoolDays == null ? 'Not listed' : String(calendar.totalSchoolDays))),
  explicitInstructionalDayCounts: explicitDayCounts.length,
  sourcePdfCount: calendarRecords.filter(({ calendar }) => Boolean(calendar.sourcePdfUrl)).length,
}

const generatedData = {
  version: releaseVersion,
  datePublished: '2026-07-27',
  dateModified: releaseDate,
  reviewedThrough: releaseDate,
  nextReview: '2027-01-01',
  records: records.map(row => ({
    district: row[0],
    state: row[1],
    page: row[2],
    firstDay: row[3],
    lastDay: row[4],
    winterBreakSignal: row[5],
    springBreakSignal: row[6],
  })),
  summary,
}

const dataOutput = JSON.stringify(generatedData, null, 2) + '\n'

console.log(JSON.stringify(summary, null, 2))

if (process.argv.includes('--check')) {
  const currentData = fs.readFileSync(dataOutputPath, 'utf8')
  if (currentData !== dataOutput) {
    console.error('School calendar trends generated data is out of date. Run pnpm trends:refresh.')
    process.exit(1)
  }
} else {
  fs.mkdirSync(path.dirname(dataOutputPath), { recursive: true })
  fs.writeFileSync(dataOutputPath, dataOutput)
}
