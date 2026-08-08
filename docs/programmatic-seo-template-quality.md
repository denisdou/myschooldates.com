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

- `calendarDistinctiveFactors`: at least 3 values.
- `districtUniqueStory`: present with all four story fields.
- `localCalendarInsight`: present with `difference`, `familyImpact`, and `planningAdvice`.
- `regionalPlanningContext`: present.
- `sourceUrl` or official calendar source: present.
- Visible FAQ: at least 8 useful questions, with FAQ Schema kept aligned when allowlists are used.

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
- School tomorrow FAQ: include only with a clear disclaimer that emergency closures and same-day announcements must be verified with official district channels.

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
