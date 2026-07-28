import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const districtsDir = join(root, 'content', 'districts')
const calendarsDir = join(root, 'content', 'calendars')
const outputPath = join(root, '.output', 'server', 'calendar-route-manifest.json')

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

if (!existsSync(districtsDir) || !existsSync(calendarsDir)) {
  throw new Error('Missing content/districts or content/calendars directory')
}

const districts = []
const calendarsByInstitutionYear = {}

for (const file of readdirSync(districtsDir)) {
  if (!file.endsWith('.json')) continue
  const district = readJson(join(districtsDir, file))
  if (district.institutionId && district.slug) districts.push(district)
}

for (const institutionId of readdirSync(calendarsDir)) {
  const institutionDir = join(calendarsDir, institutionId)
  if (!existsSync(institutionDir)) continue

  for (const file of readdirSync(institutionDir)) {
    if (!file.endsWith('.json')) continue
    const calendar = readJson(join(institutionDir, file))
    if (!calendar.schoolYear) continue
    calendarsByInstitutionYear[`${institutionId}:${calendar.schoolYear}`] = calendar
  }
}

mkdirSync(join(root, '.output', 'server'), { recursive: true })
writeFileSync(outputPath, JSON.stringify({ districts, calendarsByInstitutionYear }), 'utf8')

console.log(`Generated calendar route manifest with ${districts.length} districts and ${Object.keys(calendarsByInstitutionYear).length} calendars`)
