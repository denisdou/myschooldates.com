# School-year detail page scope

Reference: https://www.nyschoolcalendar.com/freeport/2026-2027/

The `/:district/:year` page uses this feature order:

1. Breadcrumb, calendar heading, summary, update date, and available school years.
2. First day, winter break, spring break, and last day highlights.
3. PDF download, Google Calendar subscription, Apple Calendar subscription, and ICS download.
4. Key Dates with event, date(s), and status.
5. Correction form with district, school year, and canonical page context.
6. Extended Time Off with published no-school dates, adjacent weekends, and total calendar days.
7. Monthly Calendar with the existing date legend.
8. Calendar Notes with Read more / Read less.
9. Related Calendars and the official district website.
10. About This Calendar with sources, disclaimer, and update date.

Comparison, FAQ, grading periods, year statistics, planning tips, district profiles, custom content sections, and national trends are excluded from this detail view. Their content records and other routes are preserved. FAQ structured data is excluded because the page no longer displays FAQs. Existing calendar metadata, canonical URLs, dataset and event structured data remain.

## Data handling

`app/utils/calendarDetails.ts` resolves paired ranges and explicitly listed dates. Break end matching ignores descriptive suffixes such as `/ Holiday` and `- Schools Closed`, while preserving hyphenated names such as `No-Student` and `Mid-Winter`. The shared pairing helper is also used by event structured data and calendar exports. Discrete recurring dates remain discrete in the monthly view. Extended Time Off includes confirmed districtwide closures and adjoining weekends for windows of at least four days within the student school year. It excludes tentative, conditional, reserved make-up, partial-grade, and early-dismissal dates. Closure dates and adjoining weekends are listed separately.

The PDF action uses the existing source PDF or printable PDF, falling back to the existing generated PDF route. Google and Apple actions subscribe to the existing ICS endpoint; Download ICS remains a file download. The four highlight cards and download actions are available on mobile.

## Correction delivery

The form submits JSON to `POST /api/corrections`. The API validates the payload, applies a five-attempts-per-IP limit over ten minutes, validates Turnstile with Cloudflare Siteverify (including hostname and `calendar-correction` action), and sends plain-text email through Resend. The recipient and sender come only from private server configuration; the visitor’s optional email becomes `reply_to`. No email is sent when configuration or verification fails. API responses are not cached and the endpoint is excluded from prerendering.

Create a managed Turnstile widget for `myschooldates.com` and `www.myschooldates.com` in the [Cloudflare dashboard](https://dash.cloudflare.com/). Set these variables in the deployment environment (see `.env.example`):

- `NUXT_PUBLIC_TURNSTILE_SITE_KEY`: public widget key.
- `NUXT_CORRECTIONS_TURNSTILE_SECRET`: private widget secret.
- `NUXT_CORRECTIONS_RESEND_API_KEY`: private Resend API key.
- `NUXT_CORRECTIONS_FROM`: sender on a domain verified in Resend.
- `NUXT_CORRECTIONS_TO`: recipient, default `hello@myschooldates.com`.

`NUXT_CORRECTIONS_TURNSTILE_HOSTS` is the server-side hostname allowlist. For development, use a separate development widget and add its hostname to this list. Cloudflare’s documented dummy keys work only in development; the production handler rejects dummy secrets. Never put private keys in `runtimeConfig.public` or client code. Set the public Site Key before the production build because detail pages are prerendered. Server secrets must also be set in the running deployment environment; `.env` is not automatically loaded by the built Node server.

Turnstile loads only when the dialog opens, including when opened from the footer. Expired/failed challenges are reset, failed submissions retain the message, and the form prevents concurrent submissions. The response confirms acceptance for review only after the email provider accepts the message. Attachments retain a separate email link, matching the reference page.

The application limiter is per running Node process and resets on restart. If deploying multiple instances, add a shared limiter or a Cloudflare rate-limit rule for `/api/corrections`. Enable `NUXT_CORRECTIONS_TRUST_PROXY=true` only when the origin accepts traffic exclusively from trusted Cloudflare proxies; it then uses `CF-Connecting-IP` as the visitor IP. Otherwise it uses the direct socket IP and ignores forwarded headers.

Validation uses mocked provider responses and never sends live test emails. Run `pnpm test:corrections` for payload validation, rate limits, verification failures, recipient isolation, and provider errors. Actual challenge completion and email delivery require deployment credentials.
Both correction links in the shared footer open the dialog on a school-year detail page and retain their existing email fallback elsewhere.

## Validation

- `pnpm build` for all configured prerender routes.
- Calendar calculations checked against the reference holiday windows, discrete dates, conditional/partial closures, UTC date shifts, and all 493 existing calendar records.
- All 493 rendered detail pages checked for required sections, excluded sections, Dataset schema, and the absence of obsolete FAQ schema.
- The repository-wide application type check has pre-existing errors in other components, composables, routes, and Node type configuration; the changed files were checked separately in its diagnostics.

AUHSD regression coverage: `pnpm test:calendar-details` checks the 2026–27 Thanksgiving, winter, and spring ranges and their 9-, 16-, and 9-day windows, using the existing district-published calendar records. Shorter public holidays remain in Key Dates; Extended Time Off lists windows of at least four days.
