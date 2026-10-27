export type CorrectionPayload = {
  message: string
  email: string
  district: string
  school_year: string
  page_url: string
  turnstile_token: string
}

export type CorrectionConfig = {
  resendApiKey: string
  from: string
  to: string
  turnstileSecret: string
  turnstileHosts: string
}

const correctionEnvNames = {
  resendApiKey: 'NUXT_CORRECTIONS_RESEND_API_KEY',
  from: 'NUXT_CORRECTIONS_FROM',
  to: 'NUXT_CORRECTIONS_TO',
  turnstileSecret: 'NUXT_CORRECTIONS_TURNSTILE_SECRET',
  turnstileHosts: 'NUXT_CORRECTIONS_TURNSTILE_HOSTS',
} as const

export function resolveCorrectionConfig(base: CorrectionConfig & { trustProxy?: boolean }, bindings?: Record<string, unknown>) {
  function text(key: keyof typeof correctionEnvNames) {
    const value = bindings?.[correctionEnvNames[key]]
    if (value === undefined) return base[key].trim()
    return typeof value === 'string' ? value.trim() : ''
  }
  const proxy = bindings?.NUXT_CORRECTIONS_TRUST_PROXY
  return {
    resendApiKey: text('resendApiKey'),
    from: text('from'),
    to: text('to'),
    turnstileSecret: text('turnstileSecret'),
    turnstileHosts: text('turnstileHosts'),
    trustProxy: proxy === undefined ? base.trustProxy === true : proxy === true || proxy === 'true',
  }
}

export function missingCorrectionConfig(config: CorrectionConfig) {
  return (Object.keys(correctionEnvNames) as Array<keyof typeof correctionEnvNames>)
    .filter(key => !config[key].trim())
    .map(key => correctionEnvNames[key])
}

export class CorrectionError extends Error {
  constructor(public statusCode: number, message: string, public retryAfter?: number) {
    super(message)
  }
}

export function parseCorrectionPayload(body: unknown): CorrectionPayload {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new CorrectionError(400, 'Please provide a valid correction.')
  }
  const input = body as Record<string, unknown>
  function field(name: string, maxLength: number, optional = false) {
    const value = input[name]
    if (optional && (value === undefined || value === '')) return ''
    if (typeof value !== 'string' || !value.trim() || value.length > maxLength) {
      throw new CorrectionError(400, `Please check the ${name.replaceAll('_', ' ')} field.`)
    }
    return value.trim()
  }
  const payload = {
    message: field('message', 2000),
    email: field('email', 254, true),
    district: field('district', 200),
    school_year: field('school_year', 9),
    page_url: field('page_url', 500),
    turnstile_token: field('turnstile_token', 2048),
  }
  if (payload.email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(payload.email)) {
    throw new CorrectionError(400, 'Please enter a valid email address.')
  }
  if (/[\r\n\x00-\x1f]/.test(payload.district)) {
    throw new CorrectionError(400, 'Please provide a valid district name.')
  }
  const years = payload.school_year.match(/^(\d{4})-(\d{4})$/)
  if (!years || Number(years[2]) !== Number(years[1]) + 1) {
    throw new CorrectionError(400, 'Please provide a valid school year.')
  }
  let page: URL
  try {
    page = new URL(payload.page_url)
  } catch {
    throw new CorrectionError(400, 'Please provide a valid calendar page.')
  }
  if (page.protocol !== 'https:' || !['myschooldates.com', 'www.myschooldates.com'].includes(page.hostname)
    || page.username || page.password || page.port || page.search || page.hash
    || !new RegExp(`^/[a-z0-9-]+/${payload.school_year}/?$`).test(page.pathname)) {
    throw new CorrectionError(400, 'Please provide a MySchoolDates calendar page for this school year.')
  }
  payload.page_url = page.href
  return payload
}

export function createCorrectionRateLimiter(max = 5, windowMs = 10 * 60 * 1000) {
  const entries = new Map<string, { count: number; expires: number }>()
  let lastCleanup = 0
  return (key: string, now = Date.now()) => {
    if (now - lastCleanup >= 60_000 || entries.size >= 10_000) {
      for (const [ip, entry] of entries) if (entry.expires <= now) entries.delete(ip)
      lastCleanup = now
    }
    let entry = entries.get(key)
    if (entry && entry.expires <= now) {
      entries.delete(key)
      entry = undefined
    }
    if (!entry) {
      if (entries.size >= 10_000) throw new CorrectionError(429, 'Too many submissions. Please try again later.', 60)
      entry = { count: 0, expires: now + windowMs }
      entries.set(key, entry)
    }
    if (entry.count >= max) {
      throw new CorrectionError(429, 'Too many submissions. Please try again later.', Math.max(1, Math.ceil((entry.expires - now) / 1000)))
    }
    entry.count++
  }
}

export async function deliverCorrection(payload: CorrectionPayload, config: CorrectionConfig, request = fetch) {
  if (missingCorrectionConfig(config).length) {
    throw new CorrectionError(503, 'The correction form is temporarily unavailable. Please try again later.')
  }
  // Cloudflare publishes dummy keys for local testing. Never accept them in production.
  if (!import.meta.dev && (/^\d+x0{10,}/.test(config.turnstileSecret) || config.resendApiKey === 'test')) {
    throw new CorrectionError(503, 'The correction form is temporarily unavailable. Please try again later.')
  }
  let verification: { success?: boolean; hostname?: string; action?: string }
  try {
    const response = await request('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: config.turnstileSecret, response: payload.turnstile_token }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) throw new Error('Verification unavailable')
    verification = await response.json()
  } catch {
    throw new CorrectionError(503, 'Verification is temporarily unavailable. Please try again.')
  }
  const hosts = config.turnstileHosts.split(',').map(host => host.trim().toLowerCase()).filter(Boolean)
  if (!verification.success || !verification.hostname || !hosts.includes(verification.hostname.toLowerCase())
    || verification.action !== 'calendar-correction') {
    throw new CorrectionError(400, 'Verification expired or failed. Please verify again.')
  }
  try {
    const response = await request('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: config.from,
        to: [config.to],
        ...(payload.email ? { reply_to: payload.email } : {}),
        subject: `Calendar correction — ${payload.district} ${payload.school_year}`,
        text: [
          `Page: ${payload.page_url}`,
          `District: ${payload.district}`,
          `School year: ${payload.school_year}`,
          `Reply to: ${payload.email || 'Not provided'}`,
          '',
          payload.message,
        ].join('\n'),
      }),
      signal: AbortSignal.timeout(15_000),
    })
    if (!response.ok) throw new Error('Email submission failed')
    const result = await response.json() as { id?: string }
    if (!result.id) throw new Error('Email submission failed')
  } catch {
    throw new CorrectionError(502, 'We couldn’t send your correction. Please try again later.')
  }
  return { success: true }
}
