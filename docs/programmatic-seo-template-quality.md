# Programmatic SEO Template Quality

This note defines the quality controls for scaling district calendar pages without making every page read like the same template with a different district name.

## District Uniqueness Signals

Each district page should include at least one district-specific editorial signal before it is treated as a production-quality page.

Recommended fields:

- `calendarDistinctiveFactors`: machine-readable reasons the district calendar is different.
- `calendarPattern`: the main calendar pattern, such as `early_july_start`, `august_start`, `balanced_calendar`, `year_round`, or `weather_makeup_buffer`.
- `alternatePrograms`: special calendars or programs that materially affect date selection.
- `districtUniqueStory`: a structured story object with `audience`, `districtType`, `calendarDifference`, and `planningImpact`.
- `localCalendarInsight`: a structured insight with `difference`, `familyImpact`, and `planningAdvice`.
- `regionalPlanningContext`: one concise local planning note tied to the district's region.
- `seoQualitySignals`: a compact pre-publish quality gate for automated checks.

Example:

```json
{
  "calendarDistinctiveFactors": [
    "early_july_start",
    "grades_7_12_only",
    "omchs_alternate_calendar"
  ],
  "calendarPattern": "early_july_start_traditional_7_12",
  "alternatePrograms": ["OMCHS"],
  "districtUniqueStory": {
    "audience": "San Diego South Bay families with students in grades 7-12",
    "districtType": "grades_7_12_union_high_school_district",
    "calendarDifference": "The regular student calendar starts in late July and the district also publishes a separate OMCHS calendar.",
    "planningImpact": "Families often need to confirm which student calendar applies before planning summer activities, childcare, work schedules, or travel."
  },
  "localCalendarInsight": {
    "difference": "The regular Sweetwater UHSD 7-12 calendar starts in late July while many nearby San Diego-area districts begin in August.",
    "familyImpact": "Families may have fewer weeks between summer activities and the first student day than they would in nearby August-start districts.",
    "planningAdvice": "Confirm the regular 7-12 or OMCHS calendar before booking camps, travel, childcare, or work schedule changes."
  },
  "regionalPlanningContext": "San Diego South Bay families may compare Sweetwater UHSD with nearby August-start districts before planning summer activities, childcare, work schedules, and travel."
}
```

Minimum production rule:

- An official calendar page or official school-year document is present.
- Core dates and attendance labels are supported by the cited source; derived counts define their scope.
- The school-year record explicitly decides which optional modules are useful for that district and year.
- District-specific complexity is explained only when the official materials provide evidence for it.
- Historical comparisons appear only when both years have reliable provenance.
- Profile statistics shown to users include a source URL and do not conflict with district master data.
- FAQ count follows real user questions; there is no minimum question count.
- Rendered output is checked for district-master fallback text that the school-year record did not intentionally select.

Example quality gate:

```json
{
  "seoQualitySignals": {
    "hard": {
      "hasOfficialSource": true,
      "schemaComplete": true,
      "comparisonPolicyDefined": true
    },
    "soft": {
      "uniqueFactors": 3,
      "hasLocalInsight": true,
      "faqCount": 14
    },
    "score": {
      "uniqueFactorScore": 8,
      "weights": {
        "alternate_calendar": 3,
        "calendar_pattern_difference": 3,
        "regional_insight": 2
      }
    }
  }
}
```

Hard signals are publish gates. A page should not ship when an official source or required structured data is missing. Soft signals are quality signals that can send a page to editorial review without blocking all publication. `uniqueFactorScore` should reflect factor strength, not only factor count; one strong alternate-calendar or calendar-pattern distinction can be more valuable than several generic local notes.

## Conditional FAQ Rules

Do not generate every possible FAQ for every district. Some questions are useful only when the page has enough district-specific support.

- Bell schedule FAQ: include only when the page has campus-specific guidance, official bell schedule source data, or a district-specific reason to answer it.
- Alternate calendar FAQ: include only when the district publishes alternate calendars, tracks, magnet calendars, middle college calendars, or year-round calendars.
- Future year FAQ: include only when the page links to an official calendar source that commonly publishes future-year calendars.
- School tomorrow FAQ: include only when the page uses a current official alert or closure feed with a visible last-checked time. A disclaimer alone is not enough.

## District Master Fallback Rules

District master content is a safe fallback, not a second layer of SEO copy. It may be inherited by future or historical school-year pages, so it must remain stable, concise, and year-agnostic.

- `districtFact`: use sourced entity facts. Do not turn the field into a list of planning use cases.
- `about`: keep only stable district context and the distinction between districtwide and campus-specific dates.
- `planningTips`: use no more than three direct actions unless a school-year record supplies verified, year-specific guidance.
- `compareIntro`: describe the comparison task and source scope once. Do not repeat district names as a keyword list.
- `customSections`: do not store generic Planning, Living, Calendar Highlights, Update Policy, or “closed tomorrow” modules in the district master.
- Year-specific policy changes, alternate calendars, unusual attendance rules, and date interpretations belong in the school-year record.
- If a fallback module has no useful factual content, omit it rather than relying on every school-year file to hide it.

Rendered-page QA must inspect both visible HTML and hydrated district data. A hidden legacy block is not a current on-page defect, but it is a content-governance defect when it could reappear through fallback behavior.

### Fallback QA checklist

- [ ] A new school-year record without overrides does not render generic About, Planning, or Comparison copy.
- [ ] District master statistics match their cited official profile source.
- [ ] Master copy contains no stale school year, event date, comparison value, or source version.
- [ ] Optional modules are evidence-triggered, not enabled to keep page structures uniform.
- [ ] Hiding a module is not the only protection against low-value master content; the fallback itself is publishable or absent.

## Comparison Quality Threshold

Show nearby district comparisons only when each comparison target has enough verified data to be useful.

Minimum comparison fields:

- first day
- last day
- spring break or another major break

Display rule:

- `same_state = true`
- `same_region = true`
- `calendar_data_score >= threshold`
- comparison target has the minimum verified fields above

Avoid comparison modules when nearby district data is missing, stale, or not geographically relevant. In those cases, prefer a state hub link or methodology link over a weak comparison table.

Comparison overrides are editorial data, not gap-filling placeholders. Every `comparisonValueOverrides` entry must:

- be scoped to a specific school-year record
- be supported by an official district calendar or calendar page listed in the page's sources
- have a current `lastVerifiedAt` review date for that school year
- preserve the official date range without silently inferring missing dates

When districts use different names for equivalent break periods, use a neutral or combined visible row label and explain the naming difference in the comparison note. Do not relabel a district's official `Fall Break` as `Thanksgiving Break` solely to normalize the table.

Example policy field:

```json
{
  "comparisonDisplayPolicy": {
    "sameStateRequired": true,
    "sameRegionRequired": true,
    "minimumVerifiedFields": [
      "first_day",
      "last_day",
      "spring_break_or_major_break"
    ]
  }
}
```

## Page-Level Guardrails

- Do not add more modules after a page already covers dates, PDF/ICS, planning, FAQ, comparison, and verification.
- Prefer one strong district-specific insight over several generic planning paragraphs.
- Keep FAQ Schema aligned with visible FAQ when explicit FAQ allowlists are used.
- Keep JSON-LD structure stable unless the visible page content changes materially.
- Do not require every district page to reach the same H2 count, FAQ count, word count, or module order.
- Do not use `planning window`, `highest-impact`, `highest-value`, `calendar snapshot`, or similar abstract wording when a direct date or attendance statement is available.
