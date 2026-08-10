import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
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

function findDocumentPdfUrl(html, linkText) {
  const linkIndex = html.indexOf(linkText)
  if (linkIndex === -1) return null

  const documentPayload = html.slice(linkIndex, linkIndex + 5000)
  const pdfUrl = documentPayload.match(/https?:\/\/[^"'\\\s<]+\.pdf(?:\?[^"'\\\s<]*)?/i)?.[0]
  return pdfUrl
    ?.replace(/\\u0026/gi, '&')
    .replace(/&amp;/gi, '&')
    ?? null
}

async function fetchSource(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'MySchoolDates source monitor/1.0' },
    redirect: 'follow',
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response
}

async function verifyResourceUuid(source, label) {
  if (!uuidPattern.test(source.expectedResourceUuid ?? '')) {
    throw new Error(`invalid expectedResourceUuid in ${relative(root, source.path)}`)
  }

  const actualResourceUuid = findResourceUuid(await (await fetchSource(source.checkUrl)).text(), source.linkText)
  if (!actualResourceUuid) throw new Error(`could not find “${source.linkText}” at ${source.checkUrl}`)
  if (actualResourceUuid !== source.expectedResourceUuid) {
    throw new Error(`resource UUID changed from ${source.expectedResourceUuid} to ${actualResourceUuid}`)
  }

  console.log(`OK ${label}: resource UUID ${actualResourceUuid}`)
}

async function verifyDocumentPdf(source, label) {
  if (!source.expectedPdfUrl || !/^[0-9a-f]{64}$/i.test(source.expectedChecksumSha256 ?? '')) {
    throw new Error(`invalid document-pdf monitor configuration in ${relative(root, source.path)}`)
  }

  const actualPdfUrl = findDocumentPdfUrl(await (await fetchSource(source.checkUrl)).text(), source.linkText)
  if (!actualPdfUrl) throw new Error(`could not find a PDF for “${source.linkText}” at ${source.checkUrl}`)
  if (actualPdfUrl !== source.expectedPdfUrl) {
    throw new Error(`PDF URL changed from ${source.expectedPdfUrl} to ${actualPdfUrl}`)
  }

  const pdfResponse = await fetchSource(actualPdfUrl)
  const actualChecksum = createHash('sha256')
    .update(Buffer.from(await pdfResponse.arrayBuffer()))
    .digest('hex')
  if (actualChecksum !== source.expectedChecksumSha256) {
    throw new Error(`PDF checksum changed from ${source.expectedChecksumSha256} to ${actualChecksum}`)
  }

  console.log(`OK ${label}: document PDF URL and SHA-256 match`)
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
  if (!source.checkUrl || !source.linkText) {
    console.error(`FAIL ${label}: invalid sourceResourceMonitor configuration in ${relative(root, source.path)}`)
    failures += 1
    continue
  }

  try {
    const monitorType = source.type ?? (source.expectedResourceUuid ? 'resource-uuid' : 'document-pdf')
    if (monitorType === 'resource-uuid') await verifyResourceUuid(source, label)
    else if (monitorType === 'document-pdf') await verifyDocumentPdf(source, label)
    else throw new Error(`unsupported monitor type “${monitorType}”`)
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
