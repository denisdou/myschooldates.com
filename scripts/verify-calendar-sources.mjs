import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const calendarsDir = join(root, 'content', 'calendars')
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function normalizeLinkText(value) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function findResourceUuid(html, linkText) {
  const anchors = html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)
  for (const match of anchors) {
    if (normalizeLinkText(match[2] ?? '') !== linkText) continue
    const attributes = match[1] ?? ''
    const dataUuid = attributes.match(/data-resource-uuid=["']([^"']+)["']/i)?.[1]
    const hrefUuid = attributes.match(/\/fs\/resource-manager\/view\/([0-9a-f-]{36})/i)?.[1]
    return dataUuid ?? hrefUuid ?? null
  }
  return null
}

if (!existsSync(calendarsDir)) {
  throw new Error('Missing content/calendars directory')
}

const monitoredSources = []
for (const institutionId of readdirSync(calendarsDir)) {
  const institutionDir = join(calendarsDir, institutionId)
  if (!existsSync(institutionDir)) continue

  for (const file of readdirSync(institutionDir)) {
    if (!file.endsWith('.json')) continue
    const path = join(institutionDir, file)
    const calendar = readJson(path)
    if (!calendar.sourceResourceMonitor) continue
    monitoredSources.push({
      path,
      schoolYear: calendar.schoolYear,
      institutionId,
      ...calendar.sourceResourceMonitor,
    })
  }
}

if (!monitoredSources.length) {
  console.log('No calendar source monitors are configured.')
  process.exit(0)
}

let failures = 0
for (const source of monitoredSources) {
  const label = `${source.institutionId} ${source.schoolYear}`
  if (!source.checkUrl || !source.linkText || !uuidPattern.test(source.expectedResourceUuid ?? '')) {
    console.error(`FAIL ${label}: invalid sourceResourceMonitor configuration in ${relative(root, source.path)}`)
    failures += 1
    continue
  }

  try {
    const response = await fetch(source.checkUrl, {
      headers: { 'user-agent': 'MySchoolDates source monitor/1.0' },
      redirect: 'follow',
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const actualResourceUuid = findResourceUuid(await response.text(), source.linkText)
    if (!actualResourceUuid) {
      console.error(`FAIL ${label}: could not find “${source.linkText}” at ${source.checkUrl}`)
      failures += 1
      continue
    }
    if (actualResourceUuid !== source.expectedResourceUuid) {
      console.error(`FAIL ${label}: resource UUID changed from ${source.expectedResourceUuid} to ${actualResourceUuid}`)
      failures += 1
      continue
    }

    console.log(`OK ${label}: ${actualResourceUuid}`)
  }
  catch (error) {
    console.error(`FAIL ${label}: ${error instanceof Error ? error.message : String(error)}`)
    failures += 1
  }
}

if (failures) {
  console.error(`${failures} calendar source monitor${failures === 1 ? '' : 's'} require review.`)
  process.exit(1)
}

console.log(`Verified ${monitoredSources.length} calendar source monitor${monitoredSources.length === 1 ? '' : 's'}.`)
