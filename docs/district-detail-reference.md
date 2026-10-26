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

`app/utils/calendarDetails.ts` resolves paired ranges and explicitly listed dates. Discrete recurring dates remain discrete in the monthly view. Extended Time Off includes confirmed districtwide closures and adjoining weekends for windows of at least four days within the student school year. It excludes tentative, conditional, reserved make-up, partial-grade, and early-dismissal dates. Closure dates and adjoining weekends are listed separately.

The PDF action uses the existing source PDF or printable PDF, falling back to the existing generated PDF route. Google and Apple actions subscribe to the existing ICS endpoint; Download ICS remains a file download. The four highlight cards and download actions are available on mobile.

## Correction delivery

The repository has no correction submission API or outbound email service. The form uses the existing `hello@myschooldates.com` mailbox through a prefilled email draft. Its button and feedback explicitly tell visitors to complete sending in their email app; opening the draft is never reported as successful delivery. The optional reply address, correction text, page URL, district, and school year are included. Attachments are added in the email app. A direct in-page submission service would require a receiving endpoint and is not configured by this change.

Both correction links in the shared footer open the dialog on a school-year detail page and retain their existing email fallback elsewhere.

## Validation

- `pnpm build` for all configured prerender routes.
- Calendar calculations checked against the reference holiday windows, discrete dates, conditional/partial closures, UTC date shifts, and all 493 existing calendar records.
- All 493 rendered detail pages checked for required sections, excluded sections, Dataset schema, and the absence of obsolete FAQ schema.
- The repository-wide application type check has pre-existing errors in other components, composables, routes, and Node type configuration; the changed files were checked separately in its diagnostics.
