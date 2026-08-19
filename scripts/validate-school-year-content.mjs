import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const guardedDistricts = new Set(['clark-county-school-district'])
const districtContentKeys = [
  'districtFact',
  'about',
  'planningTips',
  'customSections',
  'districtFaqs',
  'faqSchemaQuestions',
  'seoTitle',
  'seoDescription',
]
const ignoredCalendarKeys = new Set([
  'sourceUrl',
  'sourceDocumentPage',
  'sourcePdfUrl',
  'lastCheckedPdfUrl',
  'lastVerifiedAt',
  'sourceCheckedAt',
  'sourceUpdatedAt',
  'dateCreated',
  'datePublished',
  'dateModified',
  'pdfUrl',
  'url',
  'to',
])

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function collectStrings(value, path = [], result = []) {
  if (typeof value === 'string') {
    result.push({ path: path.join('.'), value })
    return result
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectStrings(item, [...path, String(index)], result))
    return result
  }
  if (!value || typeof value !== 'object') return result

  for (const [key, child] of Object.entries(value)) {
    if (ignoredCalendarKeys.has(key)) continue
    collectStrings(child, [...path, key], result)
  }
  return result
}

function yearsIn(value) {
  return [...value.matchAll(/\b20\d{2}\b/g)].map(match => Number(match[0]))
}

const errors = []

for (const institutionId of guardedDistricts) {
  const districtPath = join(root, 'content', 'districts', `${institutionId}.json`)
  const district = readJson(districtPath)
  const inheritedContent = Object.fromEntries(
    districtContentKeys
      .filter(key => district[key] !== undefined)
      .map(key => [key, district[key]])
  )

  for (const item of collectStrings(inheritedContent)) {
    const years = yearsIn(item.value)
    if (years.length) {
      errors.push(`${districtPath}:${item.path} contains year-specific copy (${[...new Set(years)].join(', ')}) that would be inherited by every school-year page`)
    }
  }

  const calendarDir = join(root, 'content', 'calendars', institutionId)
  for (const file of readdirSync(calendarDir).filter(name => name.endsWith('.json'))) {
    const calendarPath = join(calendarDir, file)
    const calendar = readJson(calendarPath)
    const match = calendar.schoolYear?.match(/^(20\d{2})-(20\d{2})$/)
    if (!match) {
      errors.push(`${calendarPath}:schoolYear must use YYYY-YYYY`)
      continue
    }

    const allowedYears = new Set([Number(match[1]), Number(match[2])])
    const comparisonYears = new Set([...allowedYears, Number(match[1]) - 1])
    for (const item of collectStrings(calendar)) {
      const allowedForField = item.path.startsWith('whatsNew.') || item.path.startsWith('diffNotes.')
        ? comparisonYears
        : allowedYears
      const unexpectedYears = yearsIn(item.value).filter(year => !allowedForField.has(year))
      if (unexpectedYears.length) {
        errors.push(`${calendarPath}:${item.path} contains out-of-scope year ${[...new Set(unexpectedYears)].join(', ')}`)
      }
    }
  }
}

if (errors.length) {
  console.error('School-year content validation failed:')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}

console.log('School-year content validation passed.')
