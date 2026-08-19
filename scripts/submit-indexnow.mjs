import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const envPath = join(root, '.env')
const districtsDir = join(root, 'content', 'districts')
const calendarsDir = join(root, 'content', 'calendars')
const statesDir = join(root, 'content', 'states')
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
  console.log(`Submit structured content URLs to IndexNow.

Usage:
  pnpm indexnow
  pnpm indexnow -- --date 2026-08-06
  pnpm indexnow -- 2026-08-06 --dry-run
  pnpm indexnow -- --all

Options:
  --date <YYYY-MM-DD>       Content creation date; defaults to the local date
  --all                     Submit all state, district, and school-year URLs
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
  const options = { all: false, dryRun: false }
  let positionalDate

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--') continue
    else if (arg === '--help' || arg === '-h') options.help = true
    else if (arg === '--all') options.all = true
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
  if (options.all && options.date) {
    throw new Error('Use either --all or a publication date, not both')
  }
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

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    throw new Error(`Could not read JSON content ${path}: ${error.message}`)
  }
}

function contentCreationDate(record, fallbackField) {
  return record.dateCreated || record.datePublished || (fallbackField ? record[fallbackField] : undefined)
}

function readDistricts() {
  if (!existsSync(districtsDir)) throw new Error('Missing content/districts directory')
  const districtsByInstitutionId = new Map()
  for (const file of readdirSync(districtsDir).sort()) {
    if (!file.endsWith('.json')) continue
    const path = join(districtsDir, file)
    const district = readJson(path)
    if (!district.institutionId) throw new Error(`District record has no institutionId: ${path}`)
    if (!district.slug) throw new Error(`District record has no slug: ${path}`)
    if (districtsByInstitutionId.has(district.institutionId)) {
      throw new Error(`Duplicate district institutionId: ${district.institutionId}`)
    }
    districtsByInstitutionId.set(district.institutionId, {
      institutionId: district.institutionId,
      name: district.name || file,
      slug: district.slug,
      state: district.state,
      stateCode: district.stateCode,
      creationDate: contentCreationDate(district),
    })
  }
  return districtsByInstitutionId
}

function readStates() {
  if (!existsSync(statesDir)) throw new Error('Missing content/states directory')
  const states = []
  const statesByIdentity = new Map()

  for (const file of readdirSync(statesDir).sort()) {
    if (!file.endsWith('.json')) continue
    const path = join(statesDir, file)
    const state = readJson(path)
    if (!state.stateSlug) throw new Error(`State record has no stateSlug: ${path}`)
    if (!state.stateName) throw new Error(`State record has no stateName: ${path}`)

    const item = {
      name: state.stateName,
      slug: state.stateSlug,
      stateCode: state.stateCode,
      creationDate: contentCreationDate(state, 'lastVerifiedAt'),
    }
    states.push(item)
    statesByIdentity.set(`name:${state.stateName.toLowerCase()}`, item)
    statesByIdentity.set(`slug:${state.stateSlug.toLowerCase()}`, item)
    if (state.stateCode) statesByIdentity.set(`code:${state.stateCode.toUpperCase()}`, item)
  }

  return { states, statesByIdentity }
}

function readCalendars() {
  if (!existsSync(calendarsDir)) throw new Error('Missing content/calendars directory')
  const calendars = []

  for (const entry of readdirSync(calendarsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))) {
    const institutionPath = join(calendarsDir, entry.name)

    for (const file of readdirSync(institutionPath).sort()) {
      if (!file.endsWith('.json')) continue
      const path = join(institutionPath, file)
      const calendar = readJson(path)
      if (!calendar.institutionId) throw new Error(`Calendar record has no institutionId: ${path}`)
      if (!calendar.schoolYear) throw new Error(`Calendar record has no schoolYear: ${path}`)
      calendars.push({
        institutionId: calendar.institutionId,
        schoolYear: calendar.schoolYear,
        creationDate: contentCreationDate(calendar),
      })
    }
  }

  return calendars
}

function resolveDistrictState(district, statesByIdentity) {
  if (district.stateCode) {
    const state = statesByIdentity.get(`code:${district.stateCode.toUpperCase()}`)
    if (state) return state
  }
  if (district.state) {
    return statesByIdentity.get(`name:${district.state.toLowerCase()}`)
      || statesByIdentity.get(`slug:${district.state.toLowerCase()}`)
  }
}

function collectContentUrls({ all, creationDate, siteUrl }) {
  const districtsByInstitutionId = readDistricts()
  const { states, statesByIdentity } = readStates()
  const calendars = readCalendars()
  const urlsByPath = new Map()

  const addUrl = (path, type, label) => {
    if (!urlsByPath.has(path)) {
      urlsByPath.set(path, { type, label, url: `${siteUrl}${path}` })
    }
  }
  const addState = state => state && addUrl(`/${state.slug}`, 'State page', state.name)
  const addDistrict = district => addUrl(`/${district.slug}`, 'District hub', district.name)

  for (const state of states) {
    if (all || state.creationDate === creationDate) addState(state)
  }

  for (const district of districtsByInstitutionId.values()) {
    if (all || district.creationDate === creationDate) {
      addDistrict(district)
      addState(resolveDistrictState(district, statesByIdentity))
    }
  }

  for (const calendar of calendars) {
    if (!all && calendar.creationDate !== creationDate) continue
    const district = districtsByInstitutionId.get(calendar.institutionId)
    if (!district) {
      throw new Error(`Calendar has no matching district record: ${calendar.institutionId}`)
    }
    addDistrict(district)
    addUrl(
      `/${district.slug}/${calendar.schoolYear}`,
      'School-year page',
      `${district.name} ${calendar.schoolYear}`,
    )
    addState(resolveDistrictState(district, statesByIdentity))
  }

  const typeOrder = new Map([
    ['State page', 0],
    ['District hub', 1],
    ['School-year page', 2],
  ])
  return [...urlsByPath.values()].sort((a, b) => {
    const typeDifference = typeOrder.get(a.type) - typeOrder.get(b.type)
    return typeDifference || a.label.localeCompare(b.label) || a.url.localeCompare(b.url)
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

  const creationDate = options.all ? undefined : options.date || localIsoDate()
  if (creationDate) validateDate(creationDate)

  const siteUrl = normalizeSiteUrl(options.siteUrl || process.env.INDEXNOW_SITE_URL || defaultSiteUrl)
  const contentUrls = collectContentUrls({ all: options.all, creationDate, siteUrl })
  const urls = contentUrls.map(item => item.url)

  console.log(`Submission scope: ${options.all ? 'all structured content pages' : `content created on ${creationDate}`}`)
  console.log(`Content sources: ${districtsDir}, ${calendarsDir}, ${statesDir}`)
  if (urls.length === 0) {
    console.log(options.all
      ? 'No structured content URLs found. Nothing to submit.'
      : 'No structured content URLs found for this date. Nothing to submit.')
    return
  }

  console.log(`Content URLs (${urls.length}):`)
  for (const item of contentUrls) {
    console.log(`- ${item.type} — ${item.label}: ${item.url}`)
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
