import { CorrectionError, createCorrectionRateLimiter, deliverCorrection, missingCorrectionConfig, parseCorrectionPayload, resolveCorrectionConfig } from '../utils/calendarCorrection'

const limitSubmission = createCorrectionRateLimiter()

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  const cloudflare = event.context.cloudflare
  const config = resolveCorrectionConfig(useRuntimeConfig(event).corrections, cloudflare?.env)
  try {
    const origin = getHeader(event, 'origin')
    if (origin && origin !== getRequestURL(event).origin && !['https://myschooldates.com', 'https://www.myschooldates.com'].includes(origin)) {
      throw new CorrectionError(403, 'Please submit corrections from MySchoolDates.')
    }
    if (!getHeader(event, 'content-type')?.toLowerCase().startsWith('application/json')) {
      throw new CorrectionError(415, 'Please submit the correction as JSON.')
    }
    const ip = config.trustProxy || Boolean(cloudflare?.request)
      ? getHeader(event, 'cf-connecting-ip') || getRequestIP(event) || 'unknown'
      : getRequestIP(event) || 'unknown'
    limitSubmission(ip)
    if (Number(getHeader(event, 'content-length')) > 16_384) {
      throw new CorrectionError(413, 'The correction is too long. Please shorten your message.')
    }
    const stream = getRequestWebStream(event)
    if (!stream) throw new CorrectionError(400, 'Please provide a valid correction.')
    const reader = stream.getReader()
    const chunks: Uint8Array[] = []
    let length = 0
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > 16_384) {
        void reader.cancel()
        throw new CorrectionError(413, 'The correction is too long. Please shorten your message.')
      }
      chunks.push(value)
    }
    const bytes = new Uint8Array(length)
    let offset = 0
    for (const chunk of chunks) {
      bytes.set(chunk, offset)
      offset += chunk.byteLength
    }
    const raw = new TextDecoder().decode(bytes)
    let body: unknown
    try {
      body = JSON.parse(raw)
    } catch {
      throw new CorrectionError(400, 'Please provide a valid correction.')
    }
    const payload = parseCorrectionPayload(body)
    const missing = missingCorrectionConfig(config)
    if (missing.length) console.error(`[corrections] Missing runtime variables: ${missing.join(', ')}`)
    return await deliverCorrection(payload, config)
  } catch (error) {
    if (error instanceof CorrectionError) {
      if (error.retryAfter) setHeader(event, 'Retry-After', error.retryAfter)
      throw createError({ statusCode: error.statusCode, message: error.message })
    }
    throw createError({ statusCode: 500, message: 'We couldn’t process your correction. Please try again later.' })
  }
})
