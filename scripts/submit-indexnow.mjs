import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const envPath = join(root, '.env')
const districtsDir = join(root, 'content', 'districts')
const calendarsDir = join(root, 'content', 'calendars')
const defaultSiteUrl = 'https://myschooldates.com'
const defaultEndpoint = 'https://api.indexnow.org/indexnow'
const keyPattern = /^[A-Za-z0-9-]{8,128}$/

if (existsSync(envPath)) process.loadEnvFile(envPath)

const responseHints = {
  400: 'IndexNow rejected the request format.',
  403: 'IndexNow could not validate the key file. Confirm that keyLocation is public and contains the exact key.',
  422: 'A submitted URL does not belong to the host, or the key does not match the IndexNow protocol.',
  429: 'IndexNow rate-limited the request. Wait before trying again.',
}

function printHelp() {
  console.log(`Submit district hub URLs dated on a given day to IndexNow.

Usage:
  pnpm indexnow
  pnpm indexnow -- --date 2026-08-06
  pnpm indexnow -- 2026-08-06 --dry-run

Options:
  --date <YYYY-MM-DD>       Publication date; defaults to the local date
  --dry-run                 Print matching URLs without submitting them
  --site-url <URL>          Canonical site origin (default: ${defaultSiteUrl})
  --key-location <URL>      Public IndexNow key file URL
  --endpoint <URL>          IndexNow endpoint (default: ${defaultEndpoint})
  --help                    Show this help

Environment:
  INDEXNOW_KEY              Required for a live submission
  INDEXNOW_SITE_URL         Optional alternative to --site-url
  INDEXNOW_KEY_LOCATION     Optional alternative to --key-location
  INDEXNOW_ENDPOINT         Optional alternative to --endpoint`)
}

function readOption(args, index, name) {
  const value = args[index + 1]
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value`)
  return value
}

function parseArgs(args) {
  const options = { dryRun: false }
  let positionalDate

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--') continue
    else if (arg === '--help' || arg === '-h') options.help = true
    else if (arg === '--dry-run') options.dryRun = true
    else if (arg === '--date') options.date = readOption(args, index++, '--date')
    else if (arg.startsWith('--date=')) options.date = arg.slice('--date='.length)
    else if (arg === '--site-url') options.siteUrl = readOption(args, index++, '--site-url')
    else if (arg.startsWith('--site-url=')) options.siteUrl = arg.slice('--site-url='.length)
    else if (arg === '--key-location') options.keyLocation = readOption(args, index++, '--key-location')
    else if (arg.startsWith('--key-location=')) options.keyLocation = arg.slice('--key-location='.length)
    else if (arg === '--endpoint') options.endpoint = readOption(args, index++, '--endpoint')
    else if (arg.startsWith('--endpoint=')) options.endpoint = arg.slice('--endpoint='.length)
    else if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`)
    else if (!positionalDate) positionalDate = arg
    else throw new Error(`Unexpected argument: ${arg}`)
  }

  if (options.date && positionalDate) {
    throw new Error('Provide the date either positionally or with --date, not both')
  }
  options.date ||= positionalDate
  return options
}

function localIsoDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function validateDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) throw new Error(`Invalid date "${value}". Expected YYYY-MM-DD.`)

  const [, year, month, day] = match.map(Number)
  const parsed = new Date(year, month - 1, day)
  if (
    parsed.getFullYear() !== year
    || parsed.getMonth() !== month - 1
    || parsed.getDate() !== day
  ) {
    throw new Error(`Invalid calendar date: ${value}`)
  }
}

function parseUrl(value, label) {
  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error(`${label} must be an absolute URL: ${value}`)
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${label} must use HTTP or HTTPS`)
  }
  return url
}

function normalizeSiteUrl(value) {
  const url = parseUrl(value, 'Site URL')
  if (url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Site URL must be an origin without a path, query, or fragment')
  }
  return url.origin
}

function findDistrictsByDate(publicationDate) {
  if (!existsSync(districtsDir) || !existsSync(calendarsDir)) {
    throw new Error('Missing content/districts or content/calendars directory')
  }

  const districtsByInstitutionId = new Map()
  for (const file of readdirSync(districtsDir)) {
    if (!file.endsWith('.json')) continue
    const path = join(districtsDir, file)
    const district = JSON.parse(readFileSync(path, 'utf8'))
    if (!district.institutionId) throw new Error(`District record has no institutionId: ${path}`)
    if (!district.slug) throw new Error(`District record has no slug: ${path}`)
    districtsByInstitutionId.set(district.institutionId, {
      name: district.name || file,
      slug: district.slug,
    })
  }

  const matchingInstitutionIds = new Set()
  for (const institutionDir of readdirSync(calendarsDir)) {
    const institutionPath = join(calendarsDir, institutionDir)
    if (!existsSync(institutionPath)) continue

    for (const file of readdirSync(institutionPath)) {
      if (!file.endsWith('.json')) continue
      const path = join(institutionPath, file)
      const calendar = JSON.parse(readFileSync(path, 'utf8'))
      if (calendar.datePublished === publicationDate && calendar.institutionId) {
        matchingInstitutionIds.add(calendar.institutionId)
      }
    }
  }

  return [...matchingInstitutionIds].map((institutionId) => {
    const district = districtsByInstitutionId.get(institutionId)
    if (!district) {
      throw new Error(`Published calendar has no matching district record: ${institutionId}`)
    }
    return district
  })
}

function validateKeyLocation(keyLocation, siteUrl) {
  const keyUrl = parseUrl(keyLocation, 'Key location')
  const site = new URL(siteUrl)
  if (keyUrl.origin !== site.origin) {
    throw new Error('Key location must use the same origin as the submitted URLs')
  }
  if (!/^\/[^/]+\.txt$/.test(keyUrl.pathname) || keyUrl.search || keyUrl.hash) {
    throw new Error('Key location must be a root-level .txt file so it can authorize all district URLs')
  }
  return keyUrl.href
}

async function submitUrls({ endpoint, key, keyLocation, siteUrl, urls }) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(siteUrl).host,
      key,
      keyLocation,
      urlList: urls,
    }),
  })

  if (response.status === 200 || response.status === 202) return response.status

  const responseBody = (await response.text()).trim()
  if (response.status === 403 && responseBody.includes('UserForbiddedToAccessSite')) {
    throw new Error(
      'Bing rejected the site ownership binding even though the published key file passed preflight. '
      + 'Verify myschooldates.com directly in Bing Webmaster Tools, wait for verification propagation, '
      + 'or rotate the IndexNow key if the rejection persists.',
    )
  }
  const hint = responseHints[response.status] || `IndexNow returned HTTP ${response.status}.`
  throw new Error(responseBody ? `${hint} Response: ${responseBody}` : hint)
}

async function verifyPublishedKeyFile(keyLocation, key) {
  let response
  try {
    response = await fetch(keyLocation, { redirect: 'follow' })
  } catch (error) {
    throw new Error(`Could not fetch the published IndexNow key file: ${error.message}`)
  }

  if (!response.ok) {
    throw new Error(
      `Published IndexNow key file returned HTTP ${response.status}. `
      + 'Run pnpm indexnow:prepare, deploy the generated public file, and try again.',
    )
  }

  const publishedKey = (await response.text()).trim()
  if (publishedKey !== key) {
    throw new Error('Published IndexNow key file does not contain the same key as INDEXNOW_KEY')
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    printHelp()
    return
  }

  const publicationDate = options.date || localIsoDate()
  validateDate(publicationDate)

  const siteUrl = normalizeSiteUrl(options.siteUrl || process.env.INDEXNOW_SITE_URL || defaultSiteUrl)
  const districts = findDistrictsByDate(publicationDate)
  const urls = districts.map(district => `${siteUrl}/${district.slug}`)

  console.log(`Publication date: ${publicationDate}`)
  console.log(`Calendar source: ${calendarsDir}`)
  console.log(`District slug source: ${districtsDir}`)
  if (urls.length === 0) {
    console.log('No district hub URLs found for this date. Nothing to submit.')
    return
  }

  console.log(`District hub URLs (${urls.length}):`)
  for (const [index, url] of urls.entries()) {
    console.log(`- ${districts[index].name}: ${url}`)
  }

  if (options.dryRun) {
    console.log('Dry run complete. No request was sent.')
    return
  }
  if (urls.length > 10_000) {
    throw new Error('IndexNow accepts at most 10,000 URLs per POST request')
  }

  const key = process.env.INDEXNOW_KEY
  if (!key) throw new Error('INDEXNOW_KEY is required for a live submission')
  if (!keyPattern.test(key)) {
    throw new Error('INDEXNOW_KEY must be 8-128 characters using only letters, numbers, and dashes')
  }

  const endpoint = parseUrl(
    options.endpoint || process.env.INDEXNOW_ENDPOINT || defaultEndpoint,
    'IndexNow endpoint',
  ).href
  const keyLocation = validateKeyLocation(
    options.keyLocation || process.env.INDEXNOW_KEY_LOCATION || `${siteUrl}/${key}.txt`,
    siteUrl,
  )
  await verifyPublishedKeyFile(keyLocation, key)
  const status = await submitUrls({ endpoint, key, keyLocation, siteUrl, urls })
  const statusText = status === 202 ? 'accepted; key validation is pending' : 'accepted'
  console.log(`IndexNow submission ${statusText} (HTTP ${status}).`)
}

main().catch((error) => {
  console.error(`IndexNow submission failed: ${error.message}`)
  process.exitCode = 1
})
