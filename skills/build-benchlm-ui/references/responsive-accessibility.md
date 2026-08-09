# Responsive, Interaction, and Accessibility

## Responsive Breakpoints

Treat these as behavior thresholds, not mandatory framework constants.

- `<= 360px`: tighten button text and padding; preserve 44px targets.
- `<= 420px`: prioritize message truncation in announcement strips.
- `<= 720px`: switch major grids to one column; hide desktop command bar only if a mobile search action remains; reduce section spacing; convert metadata strips to two columns.
- `721–1040px`: tablet navigation and two-column card grids; avoid the widest table configurations.
- `>= 1041px`: full navigation, utility separators, and wide comparison/table layouts.
- Container max width: approximately 1120px, with 16–24px side padding.

## Keyboard Behavior

- Provide a skip link as the first focusable control.
- All navigation dropdowns, dialogs, comboboxes, disclosures, table controls, and copy/export actions must be keyboard reachable.
- A global search shortcut may use `⌘ K`/`Ctrl K`; do not capture it while the user is typing in an editable field.
- Escape closes transient overlays and returns focus to the trigger.
- Arrow-key behavior for comboboxes and menus should follow ARIA authoring practices.
- Preserve a logical focus order matching the visual order.

## Focus and Pointer States

- Use a 2px accent focus ring with sufficient offset against both canvas and panel surfaces.
- Do not remove outlines without an equivalent `:focus-visible` treatment.
- Hover may shift ink, border, or panel tone.
- Active buttons may translate down 1px.
- Never use hover alone to expose a required action on touch devices.

## Semantics

- Use one H1 and ordered heading levels.
- Give data tables a caption or associated heading.
- Use `scope="col"` and `scope="row"` where appropriate.
- Announce filter result counts with a polite live region.
- Use `<time datetime>` for refresh dates and release dates.
- Use `<data value>` or explicit accessible labels for normalized scores and monetary units when useful.
- Mark purely decorative icons `aria-hidden="true"`.
- Status badges must include visible text.

## Data Table Accessibility

- Do not build a comparison table from unlabelled CSS grid cells when native table semantics work.
- If a mobile card representation replaces the table, keep equivalent labels and reading order.
- For horizontal scrolling, provide a visible overflow cue and keep the first meaningful column sticky.
- Use `aria-sort` on sortable headers.
- Sorting must not erase active filters.
- A missing measurement must be communicated as `Not measured`, `Not reported`, or another precise state—not just `—` for screen readers.

## Forms and Filters

- Every control needs a visible label or reliably associated accessible label.
- Placeholder text is not a label.
- Keep errors adjacent to the relevant control and summarize them at the top for long forms.
- Preserve entered values after validation failures.
- Announce loading and result completion.
- Use native inputs/selects unless a custom control is required by the interaction.

## Required Product States

Design and implement these when relevant:

- initial/loading skeleton using panel tones and hairlines
- empty dataset with a next action
- no search results with active-filter summary and clear action
- partial evidence / estimated result
- stale source warning
- network or export failure
- disabled comparison until valid selections
- successful copy/download confirmation

Do not substitute a spinner for a state that needs explanatory text.

## Motion

- Default duration: 150ms.
- Use motion only for disclosure, selection, focus transfer, progress, or state confirmation.
- Avoid scale-up card hover, background particle fields, scrolling marquees, and continuously animated gradients.
- Under `prefers-reduced-motion: reduce`, remove smooth scrolling and nonessential transitions.

## Contrast

- Test muted and dim text, especially 10–11px labels, against both light and dark panels.
- Accent-colored text on warm panels must meet WCAG AA for its size/weight.
- Do not use faint ink for essential data.
- Provider colors must not be the only provider identifier.

## Visual QA Checklist

Check at minimum 320×568, 390×844, 768×1024, 1280×800, and a wide desktop viewport.

- Header remains usable and does not wrap into accidental two-line nav.
- Hero does not force the primary task below the fold without reason.
- Search and primary filters remain discoverable.
- Table headers align with body columns.
- Numeric values do not jump because of proportional figures.
- Long model/provider names truncate or wrap predictably.
- Popovers remain inside the viewport.
- Sticky elements do not cover anchors or focused controls.
- Dark mode preserves hierarchy and chart/status meaning.
- Zoom at 200% does not lose content or functionality.
- Reduced-motion mode remains understandable.

## Content QA Checklist

- Every consequential score, claim, release, or price has a visible source/freshness path.
- Confidence language does not masquerade as performance.
- Rankings explain their method and sorting basis.
- Empty/missing data is not converted into zero.
- Marketing CTAs appear after useful evidence, not before it.
- Labels are concrete: `Output price / 1M tokens`, not `Affordable`.
- Copy avoids hype, generic AI slogans, and invented certainty.
