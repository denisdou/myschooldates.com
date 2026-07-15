# Project Index

Last indexed: 2026-07-15

## Project Summary

MySchoolDates is a Nuxt 4 static site for US public school district calendars. The product is content-driven: district identity, state pages, and per-school-year calendar data live as JSON files under `content/`, while Nuxt pages and components render searchable district/state landing pages, year-specific calendar pages, SEO metadata, schema markup, sitemap XML, and calendar export tools.

## Tech Stack

- Runtime: Nuxt 4, Vue 3, TypeScript
- Content layer: `@nuxt/content` data collections
- Styling: Tailwind CSS
- Package manager: pnpm
- Static output: Nuxt/Nitro prerendering

Useful commands:

```bash
pnpm dev
pnpm build
pnpm generate
pnpm preview
```

There is no dedicated test script in `package.json` at the time of indexing.

## Top-Level Structure

```text
app/                 Nuxt app source: pages, layout, components, composables, utils
content/             JSON content collections: districts, states, calendars
docs/                Product, SEO, audit, and implementation notes
public/              Static assets: icons, logos, robots, manifest
scripts/             Maintenance scripts for content generation
server/routes/       Nitro server routes, currently sitemap XML
content.config.ts    Nuxt Content collection schemas
nuxt.config.ts       Nuxt modules, head metadata, prerender route list
package.json         Scripts and dependencies
```

Generated/local directories such as `.nuxt/`, `.output/`, `node_modules/`, and `.playwright-mcp/` are present but are not source-of-truth code.

## Current Content Footprint

At indexing time:

- District JSON files: 31
- State JSON files: 5
- Calendar JSON files: 75
- Total source files under `content/`: 111

Note: the homepage currently displays "30 school districts" and "9 states", which does not match the source counts above. Treat this as a maintenance item when updating homepage copy.

## Content Model

Defined in `content.config.ts`.

`districts`

- Source: `content/districts/*.json`
- Key fields: `institutionId`, `name`, `slug`, `state`, `stateCode`, `officialWebsite`, `currentSchoolYear`
- Optional enrichment: `shortName`, `logo`, `studentCount`, `schoolCount`, `about`, `planningTips`, `livingHere`, `districtFaqs`, `relatedDistricts`, `sources`, `hiddenSections`, `customSections`

`states`

- Source: `content/states/*.json`
- Key fields: `stateSlug`, `stateName`, `stateCode`, `about`, `quickFacts`, `planningTips`, `commonHolidays`, `faqs`, `relatedStates`

`calendars`

- Source: `content/calendars/*/*.json`
- Key fields: `institutionId`, `schoolYear`, `firstDay`, `lastDay`, `events`
- Optional enrichment: `totalSchoolDays`, `teacherWorkDays`, `semesters`, `sourceUrl`, `sourcePdfUrl`, `lastVerifiedAt`, `calendarNotes`, `calendarFaqs`, `yearNumbers`, `whatsNew`, `alternateCalendars`, `seoTitle`, `seoDescription`

Calendar events use these event types:

```text
school_start, school_end, school_resume, school_reopen,
holiday, no_school, student_holiday,
break_start, break_end,
early_release, early_dismissal,
academic, observance, teacher_workday,
makeup_day, quarter_end, semester_end, graduation
```

## Routing Index

`app/pages/index.vue`

- Homepage
- Loads all districts with `queryCollection('districts')`
- Provides search, popular district links, state grouping, and homepage SEO/schema

`app/pages/[district]/index.vue`

- Dual-purpose route:
  - State page when `[district]` matches a state slug derived from district states
  - District current-year page when `[district]` matches a district slug
- Loads all districts, the matched district, all calendars for that district, and optional state page data
- Renders state comparison cards/tables or the district current calendar page
- Builds district/state SEO metadata, canonical URLs, breadcrumbs, item list schema, organization schema, FAQ schema, and event schema

`app/pages/[district]/[year].vue`

- Year-specific calendar page for archived or future years
- Loads district by slug, calendar by `institutionId + schoolYear`, related district calendars, and previous-year calendar for comparison
- Current-year canonical points to the district hub URL; non-current years canonicalize to `/{slug}/{year}`
- Renders the same calendar modules with year context and structured data

Static legal/editorial pages:

- `app/pages/about.vue`
- `app/pages/editorial-policy.vue`
- `app/pages/privacy.vue`
- `app/pages/terms.vue`

## Shared Logic

`app/composables/useDistrictPage.ts`

- Date formatting helpers
- Day-count helpers
- Break range extraction from `break_start` / `break_end` pairs
- Second-semester start inference
- FAQ generation helper
- ICS download generation
- Event type labels and Tailwind color classes

`app/utils/calendarHelpers.ts`

- Calendar-specific helper functions.

`app/utils/yearNumbers.ts`

- Year comparison / year-number helper functions.

## Component Index

Calendar display and planning:

- `DistrictKeyDateCards.vue`
- `DistrictTodayStatus.vue`
- `DistrictAllDates.vue`
- `DistrictYearDiff.vue`
- `DistrictYearNumbers.vue`
- `DistrictOtherCalendars.vue`
- `CalendarExportShare.vue`

District context and content:

- `DistrictProfile.vue`
- `DistrictQuickFacts.vue`
- `DistrictCalendarAbout.vue`
- `DistrictLivingHere.vue`
- `DistrictPlanningTips.vue`
- `DistrictCustomSections.vue`
- `DistrictFaq.vue`
- `DistrictSources.vue`
- `DistrictDataQuality.vue`

Discovery/navigation:

- `Breadcrumb.vue`
- `DistrictComparison.vue`
- `DistrictRelatedDistricts.vue`

## Prerendering And Sitemap

`nuxt.config.ts`

- Enables `@nuxtjs/tailwindcss` and `@nuxt/content`
- Sets global head metadata, icons, manifest, Google Analytics, and default social metadata
- Uses route rules to prerender all routes
- Also contains a manual `nitro.prerender.routes` list for states, district hubs, and year pages

`server/routes/sitemap.xml.ts`

- Dynamically reads `content/districts`, `content/calendars`, and `content/states`
- Emits:
  - Home URL
  - State URLs
  - District current-year hub URLs
  - Non-current calendar year URLs

Maintenance note: when adding new districts or state pages, the dynamic sitemap should pick them up automatically, but `nuxt.config.ts` still has a manual prerender route list that may need updating for predictable static generation.

## Adding A District

1. Add `content/districts/{institutionId}.json`.
2. Add one or more calendar files under `content/calendars/{institutionId}/{schoolYear}.json`.
3. Ensure `district.institutionId` matches the calendar folder and calendar `institutionId`.
4. Set `district.slug` to the public URL slug.
5. Set `district.currentSchoolYear` to one of the available calendar years.
6. Add or verify the state file in `content/states/{stateSlug}.json` if the state is new.
7. Update `nuxt.config.ts` prerender route list if static generation requires explicit coverage.
8. Check homepage constants if the district should appear in popular lists or state order.
9. Run `pnpm build` or `pnpm generate`.

## Adding A Calendar Year

1. Add `content/calendars/{institutionId}/{schoolYear}.json`.
2. Include `firstDay`, `lastDay`, and ordered `events`.
3. Use paired `break_start` and `break_end` names, where the end event is named like `"Spring Break End"`.
4. Include `sourceUrl`, `sourcePdfUrl`, and `lastVerifiedAt` when available.
5. Add `calendarFaqs`, `calendarNotes`, `yearNumbers`, or `whatsNew` for higher-quality SEO/content.
6. If the new year becomes current, update `content/districts/{institutionId}.json`.
7. Update manual prerender routes in `nuxt.config.ts` when needed.

## Maintenance Scripts

`scripts/gen-calendar-notes.mjs`

- Copies/adapts `calendarNotes` from a district's `2026-2027` calendar to other years.
- Rewrites school-year strings, first/last day dates, spring break dates, Good Friday references, and remaining standalone year numbers.
- Writes JSON files in place, so review git diff carefully after running it.

## Documentation Index

High-signal docs:

- `docs/myschooldates.prd.md`: product requirements
- `docs/information-architecture.md`: core IA and platform module model
- `docs/data-sources.md`: source strategy
- `docs/url-slug-specification.md`: URL and slug rules
- `docs/district-prioritization.md`: district expansion priorities
- `docs/expansion-districts.md`: expansion list
- `docs/content-roadmap-4weeks.md`: content roadmap

Planning/audit docs live under `docs/plans/`, including Houston ISD audit rounds and dynamic metrics design/implementation notes.

## Known Maintenance Notes

- `README.md` is still the default Nuxt starter README and does not describe this product.
- Homepage hardcoded stats appear stale versus current content counts.
- `nuxt.config.ts` has a long manual prerender route list; this can drift from `content/`.
- Some homepage popular IDs reference districts that may not exist in current content, such as `nyc-doe`, `chicago-public-schools`, and `clark-county`; computed filters prevent crashes, but these entries will not render.
- The current git worktree has pre-existing changes: `docs/content-roadmap-4weeks.md` modified and `content/calendars/union-county/` untracked.

