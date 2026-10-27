import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

// Load the server's standalone TypeScript logic without introducing a test framework.
const source = ts.transpile(readFileSync(new URL('../server/utils/calendarCorrection.ts', import.meta.url), 'utf8'), {
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ES2022,
})
const { parseCorrectionPayload, createCorrectionRateLimiter, deliverCorrection, resolveCorrectionConfig, missingCorrectionConfig } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const payload = {
  message: 'The listed holiday date is incorrect.',
  email: 'parent@example.org',
  district: 'Example School District',
  school_year: '2026-2027',
  page_url: 'https://myschooldates.com/example-school-district-calendar/2026-2027',
  turnstile_token: 'fixture-token',
}
const config = {
  resendApiKey: 'fixture-api-key',
  from: 'MySchoolDates <corrections@myschooldates.com>',
  to: 'hello@myschooldates.com',
  turnstileSecret: 'fixture-secret',
  turnstileHosts: 'myschooldates.com,www.myschooldates.com',
}
const verified = { success: true, hostname: 'myschooldates.com', action: 'calendar-correction' }
const failWith = code => error => error.statusCode === code

function mockRequest(verification = verified, mailStatus = 200) {
  const calls = []
  return {
    calls,
    request: async (url, options) => {
      calls.push({ url, body: JSON.parse(options.body), headers: options.headers })
      return url.includes('siteverify')
        ? Response.json(verification)
        : Response.json(mailStatus === 200 ? { id: 'fixture-email-id' } : { message: 'Provider failure' }, { status: mailStatus })
    },
  }
}

test('accepts the public form fields and allows an omitted reply address', () => {
  assert.deepEqual(parseCorrectionPayload(payload), payload)
  assert.equal(parseCorrectionPayload({ ...payload, email: undefined }).email, '')
})

test('rejects malformed input, header injection, foreign URLs, mismatched years, and missing tokens', () => {
  for (const body of [null, [], { ...payload, message: '' }, { ...payload, message: 'x'.repeat(2001) },
    { ...payload, email: 'parent@example.org\r\nBcc: attacker@example.org' },
    { ...payload, district: 'District\r\nInjected header' },
    { ...payload, school_year: '2026-2028' },
    { ...payload, page_url: 'https://example.org/example/2026-2027' },
    { ...payload, page_url: 'https://myschooldates.com/example/2025-2026' },
    { ...payload, page_url: 'https://myschooldates.com:444/example/2026-2027' },
    { ...payload, turnstile_token: '' },
  ]) assert.throws(() => parseCorrectionPayload(body), failWith(400))
})

test('limits each IP to five attempts, isolates other visitors, and permits a new window', () => {
  const consume = createCorrectionRateLimiter()
  for (let i = 0; i < 5; i++) consume('visitor-one', 1000)
  assert.throws(() => consume('visitor-one', 1001), error => error.statusCode === 429 && error.retryAfter === 600)
  consume('visitor-two', 1001)
  consume('visitor-one', 601000)
})

test('does not contact either provider until required server configuration exists', async () => {
  for (const key of Object.keys(config)) {
    const mock = mockRequest()
    await assert.rejects(deliverCorrection(payload, { ...config, [key]: '' }, mock.request), failWith(503))
    assert.equal(mock.calls.length, 0)
  }
})

test('failed, expired, wrong-host, and wrong-action verification never send email', async () => {
  for (const verification of [
    { ...verified, success: false, 'error-codes': ['timeout-or-duplicate'] },
    { ...verified, hostname: 'attacker.example.org' },
    { ...verified, action: 'other-form' },
    { success: true },
  ]) {
    const mock = mockRequest(verification)
    await assert.rejects(deliverCorrection(payload, config, mock.request), failWith(400))
    assert.equal(mock.calls.length, 1)
  }
})

test('uses only the server recipient and sender; visitor email becomes reply_to', async () => {
  const mock = mockRequest()
  const safe = parseCorrectionPayload({ ...payload, to: 'attacker@example.org', from: 'attacker@example.org' })
  assert.deepEqual(await deliverCorrection(safe, config, mock.request), { success: true })
  assert.equal(mock.calls.length, 2)
  assert.equal(mock.calls[0].body.response, payload.turnstile_token)
  const email = mock.calls[1].body
  assert.deepEqual(email.to, [config.to])
  assert.equal(email.from, config.from)
  assert.equal(email.reply_to, payload.email)
  assert(email.text.includes(payload.message) && email.text.includes(payload.page_url))
  assert(!JSON.stringify(email).includes(payload.turnstile_token))
  assert(!JSON.stringify(email).includes(config.turnstileSecret))
})

test('reports verification network failures and mail provider failures without success', async () => {
  await assert.rejects(deliverCorrection(payload, config, async () => { throw new Error('Network failure') }), failWith(503))
  const mock = mockRequest(verified, 503)
  await assert.rejects(deliverCorrection(payload, config, mock.request), failWith(502))
})

test('production rejects Cloudflare dummy secrets', async () => {
  const mock = mockRequest()
  await assert.rejects(deliverCorrection(payload, { ...config, turnstileSecret: '1x0000000000000000000000000000000AA' }, mock.request), failWith(503))
  assert.equal(mock.calls.length, 0)
})


test('Cloudflare request bindings supply private values when runtimeConfig defaults are empty', async () => {
  const base = { resendApiKey: '', from: '', to: 'hello@myschooldates.com', turnstileSecret: '', turnstileHosts: 'myschooldates.com', trustProxy: true }
  const resolved = resolveCorrectionConfig(base, {
    NUXT_CORRECTIONS_RESEND_API_KEY: config.resendApiKey,
    NUXT_CORRECTIONS_FROM: config.from,
    NUXT_CORRECTIONS_TO: 'configured-recipient@example.org',
    NUXT_CORRECTIONS_TURNSTILE_SECRET: config.turnstileSecret,
    NUXT_CORRECTIONS_TURNSTILE_HOSTS: config.turnstileHosts,
    NUXT_CORRECTIONS_TRUST_PROXY: 'false',
  })
  assert.deepEqual(resolved, { ...config, to: 'configured-recipient@example.org', trustProxy: false })
  assert.deepEqual(missingCorrectionConfig(resolved), [])
  assert.equal(base.resendApiKey, '')
  const mock = mockRequest()
  assert.deepEqual(await deliverCorrection(payload, resolved, mock.request), { success: true })
  assert.equal(mock.calls.length, 2)
})

test('Node config remains supported and an explicitly empty Cloudflare secret fails closed', () => {
  assert.deepEqual(resolveCorrectionConfig(config), { ...config, trustProxy: false })
  const resolved = resolveCorrectionConfig(config, { NUXT_CORRECTIONS_RESEND_API_KEY: '   ' })
  assert.equal(resolved.resendApiKey, '')
  assert.deepEqual(missingCorrectionConfig(resolved), ['NUXT_CORRECTIONS_RESEND_API_KEY'])
})

test('Cloudflare bindings remain isolated between requests and missing diagnostics contain no values', () => {
  const first = resolveCorrectionConfig(config, { NUXT_CORRECTIONS_RESEND_API_KEY: 'request-one-secret' })
  const second = resolveCorrectionConfig(config, { NUXT_CORRECTIONS_RESEND_API_KEY: 'request-two-secret', NUXT_CORRECTIONS_FROM: '' })
  assert.equal(first.resendApiKey, 'request-one-secret')
  assert.equal(second.resendApiKey, 'request-two-secret')
  assert.deepEqual(missingCorrectionConfig(second), ['NUXT_CORRECTIONS_FROM'])
  assert.equal(config.resendApiKey, 'fixture-api-key')
  assert(!JSON.stringify(missingCorrectionConfig(second)).includes('request-two-secret'))
})
