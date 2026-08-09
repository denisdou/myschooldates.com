# Component Patterns

## Alert Strip

Use for a source-linked release, pricing change, incident, or time-sensitive product notice.

- Place above the main header.
- Use a very light accent wash and accent-tinted bottom border.
- Keep label, concise message, and CTA on one line at desktop.
- Truncate the message before hiding the CTA.
- Do not use it for generic marketing announcements.

## Sticky Header

- Use a panel-colored surface at roughly 95% opacity with light backdrop blur.
- Keep a 1px bottom hairline.
- Wordmark uses display typography at about 19px.
- Active navigation gets stronger ink and a 2px accent underline.
- Desktop navigation has a 66px target height; mobile uses a compact menu/search action with 44px targets.
- Separate utility/commercial links with a short vertical hairline rather than a pill group.

## Decision-First Hero

The hero should answer, not tease.

- Eyebrow or breadcrumb first.
- H1 with a maximum width near 22 characters when possible.
- One paragraph, about 65 characters wide, stating the scope and decision value.
- Add a global search/command control when the product has many entities.
- Pair the copy with a compact leaders, summary, evidence, or latest-changes panel when useful.
- Follow with a metadata strip for refresh date, coverage count, method, or status.

Avoid generic calls to "discover," "unlock," or "transform."

## Command Search

- Full-width up to about 620px.
- 48px minimum height, 8px radius, strong hairline.
- Search icon/label at left, keyboard hint such as `⌘ K` at right.
- On mobile, collapse to a 44px icon button or a full-width control immediately below the header.
- Results should group entities and expose type/provider/status as secondary text.

## Summary Panel

Use for top-ranked entities, a comparison verdict, or latest verified updates.

- Panel frame with strong hairline and 8px radius.
- Header sits on Panel 2 with title left and method/source link right.
- Rows use a grid such as `rank | identity | value`.
- Rank is tiny mono, identity is 24–28px monogram plus label, value is right aligned mono.
- Close with a short explanation or caveat separated by a top hairline.

## Metadata Strip

Use a border-only row rather than cards.

- Three to five columns on desktop; two columns on mobile.
- Label in 10px dim text; value in 12px mono or semibold sans.
- Use vertical dividers between items.
- Hide the least important item on narrow screens instead of compressing all values.

## Evidence/Status Badge

Badges communicate provenance or lifecycle, not decoration.

- Compact 10–11px text, 2–4px radius, 1px border.
- Include text such as `Supported`, `Estimated`, `Current`, `Superseded`, `Source confirmed`, or `Display only`.
- Use positive/accent for stronger evidence, neutral for estimated, warning for stale, danger for incidents.
- Pair color with text and, where appropriate, a tooltip explaining the criterion.

Never combine score and confidence into one color scale.

## Decision Cards

Use for a small set of recommended picks or category leaders.

- Prefer a continuous bordered row or asymmetrical grid over floating identical cards.
- Lead with the decision label (`Best value`, `Fastest measured`).
- State the selection criterion in one sentence.
- Show entity, primary metric, evidence state, and source freshness.
- If the card cannot explain why it won, it is not decision-ready.

## Filter Bar

- Put search first, then primary select, then `More filters` disclosure.
- Make the active filter state visible in the URL when possible.
- Show the result count and sorting logic near the table.
- Provide `Clear all` only when filters are active.
- On mobile, keep search visible and move secondary filters into a bottom sheet or disclosure panel.

## Dense Leaderboard Table

Use real table semantics.

- Sticky or persistent column context for rank/model when the table is wide.
- Left-align names and categorical values; right-align metrics.
- Use tabular figures and mono for prices, scores, dates, speed, and latency.
- Keep row height around 44–52px.
- Use hairline row separators and a subtle panel-2 hover state.
- Put model/provider identity together; separate lifecycle and evidence status.
- Use em dashes or `Not measured` deliberately and consistently.
- Provide an explicit explanation of rank and evidence immediately above or below the table.
- Paginate or progressively load large datasets; do not render hundreds of heavy rows at once without virtualization.

On narrow screens, choose one of two strategies:

1. horizontal scrolling with the identity column sticky, or
2. compact row cards containing rank, identity, score, and the two most decision-relevant metrics, with a disclosure for the rest.

Do not silently discard columns that affect the decision.

## Directory Card

For providers, categories, benchmark families, or tools:

- Make the whole card/link target clickable.
- Title and top entity/metric appear first.
- Secondary stats form a small ruled grid, not a pill collection.
- Use a consistent comparison denominator across all cards.
- Search comes before the directory grid.

## Comparison Builder

- Present two comboboxes with a centered `versus` label.
- Prevent the same entity from being selected twice.
- Disable the CTA until both values are valid.
- On result pages, state the verdict before the metric table.
- Pair each conclusion with exact units and evidence coverage.
- Offer popular comparisons only after the primary task.

## Methodology Block

- Use short thesis sections, not a wall of documentation.
- Separate score, evidence strength, freshness, and runtime concepts.
- Show method version and dataset refresh as compact metadata.
- For long benchmark families, group `Weighted`, `Display only`, and `Subfamilies` visually.
- Make caveats easy to find without forcing them into every row.

## Newsletter/Commercial CTA

- Place after users receive meaningful data value.
- Use a ruled band or panel rather than a bright marketing gradient.
- State cadence, subject matter, proof, and unsubscribe expectation.
- Avoid modal interruption during research tasks.

## Evidence-Rich Footer

- Start with a short product statement and evidence promise.
- Include data coverage and refresh metadata before the link directory.
- Group links by exploration, rankings, dashboards, and research/tools.
- End with methodology/copyright line and legal/editorial links.
- Keep the footer dense but use section headings and generous vertical separation.
