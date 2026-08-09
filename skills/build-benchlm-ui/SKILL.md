---
name: build-benchlm-ui
description: Design, implement, or refactor dense evidence-first AI research, benchmark, leaderboard, comparison, directory, and data-product interfaces using the observable visual and interaction principles distilled from BenchLM.ai. Use when a user asks for a BenchLM-inspired UI, an editorial data dashboard, a trustworthy AI-model comparison surface, or a compact research product with warm paper-like surfaces, hairline borders, restrained teal accents, display/data typography, searchable tables, evidence states, and responsive decision-first information architecture. Do not use to copy BenchLM branding, text, data, logos, or proprietary assets verbatim.
---

# Build BenchLM-Inspired UI

## Purpose

Create a working interface that feels like a rigorous research publication and a compact data product at the same time. Preserve the target product's identity while applying BenchLM's observable design principles: warm editorial surfaces, high information density, restrained color, visible evidence states, and decision-first hierarchy.

This skill distills a public interface. It does not authorize a pixel-perfect clone. Never copy the BenchLM name, logo, published text, datasets, model rankings, or font files unless the user separately supplies them and has the right to use them.

## Required Workflow

1. Inspect the existing project before editing.
   - Identify framework, component library, routing, tokens, fonts, and responsive conventions.
   - Reuse established components where doing so does not erase the intended visual language.
   - If the task names a live reference page, inspect it before implementation when tools permit.
2. Define the page's decision task.
   - Write the primary user question in one sentence.
   - Choose only the modules needed to answer it.
   - Prefer structured facts, comparisons, and provenance over generic explanatory prose.
3. Select a page recipe from [page-recipes.md](references/page-recipes.md).
4. Establish or map tokens using [visual-system.md](references/visual-system.md).
   - Use `assets/benchlm-inspired-foundation.css` as a starting layer when the project has no token system.
   - Adapt token names to the host project rather than maintaining two competing systems.
5. Compose the interface from [components.md](references/components.md).
6. Implement responsive, keyboard, focus, loading, empty, error, and reduced-motion states using [responsive-accessibility.md](references/responsive-accessibility.md).
7. Run the quality gate below. Fix failures before handoff.

## Core Design Invariants

- Use a warm near-white canvas and slightly lighter panels in light mode; use deep blue-black layers in dark mode.
- Let one desaturated teal accent carry navigation state, primary actions, links, focus rings, and key values.
- Use thin borders and tonal surface steps instead of floating shadows. Shadows are rare and shallow.
- Keep radii compact: roughly 4–8px for controls and panels. Avoid bubbly SaaS cards.
- Pair a bold geometric display face with a neutral sans and a tabular/monospace data face.
- Use display type for identity and section headlines, sans for prose, mono/tabular numerals for ranks, scores, dates, prices, and keyboard hints.
- Put the answer before the explanation: decision, score, status, or latest change first; method and caveats follow.
- Make evidence strength visible but separate from the score or conclusion.
- Prefer borders, aligned columns, dividers, and whitespace over decorative illustration.
- Use color semantically and sparingly. Never turn every provider/category into a saturated badge cloud.
- Make dense data scannable through alignment, small labels, tabular numbers, sticky context, and progressive disclosure.
- Keep editorial copy concrete. Avoid hype, generic AI marketing, and self-congratulatory methodology language.

## Information Architecture Rules

Use this default order, then remove anything that does not serve the task:

1. optional source-linked alert strip
2. compact sticky header
3. breadcrumb or section eyebrow
4. decision-first hero
5. global search or primary filter
6. leader/summary panel and metadata strip
7. high-value updates or recommendations
8. primary table, comparison, or directory
9. reading guidance and methodology
10. adjacent exploration paths
11. evidence-rich footer

Do not force every page into this full sequence. A tool page may need only header, task statement, form, result, method note, and footer.

## Implementation Rules

- Build real controls and tables, not screenshot approximations.
- Keep URL-synced filters and shareable views when the product supports routing.
- Use semantic elements: `header`, `nav`, `main`, `section`, `table`, `caption`, `time`, `data`, and `footer` as appropriate.
- Use real `<table>` markup for comparative tabular data. On small screens, allow horizontal scrolling or provide an equivalent compact row view without dropping critical fields.
- Use `font-variant-numeric: tabular-nums` for comparable metrics.
- Keep status semantics explicit in text; never rely on color alone.
- Separate confidence/evidence labels from result values.
- Give every search, filter, select, and icon button an accessible name.
- Use a minimum 44px touch target on compact/mobile navigation and controls.
- Reserve motion for state confirmation, row emphasis, disclosure, and light surface transitions. Avoid ambient blobs, parallax, and looping decoration.
- Preserve the user's data, routes, and unrelated local changes.

## Reference Routing

Read only what the task needs, but read the chosen file completely.

- Brand tokens, typography, spacing, color, borders, dark mode: [visual-system.md](references/visual-system.md)
- Navigation, hero, cards, filters, tables, badges, method blocks, footer: [components.md](references/components.md)
- Leaderboard, comparison, directory, methodology, radar/update, and tool layouts: [page-recipes.md](references/page-recipes.md)
- Breakpoints, keyboard, accessibility, states, motion, visual QA: [responsive-accessibility.md](references/responsive-accessibility.md)
- Observed source pages, extraction notes, and interpretation boundaries: [source-notes.md](references/source-notes.md)

## Quality Gate

Before finishing, confirm all of the following:

- The first viewport answers the primary question or exposes the primary task.
- The accent color has a clear semantic job and is not decorative noise.
- Panels are separated primarily by hairlines and tonal steps, not large shadows.
- Display, body, and data typography have distinct roles.
- Numeric columns align and use tabular figures.
- Dense sections remain legible at 320px, 768px, and wide desktop widths.
- Mobile users can reach search/filter actions without traversing the desktop table.
- Every interactive element has hover, focus-visible, disabled, and loading behavior where relevant.
- Empty, no-result, partial-evidence, and error states are designed.
- Evidence, freshness, source, or review metadata appears near consequential claims.
- The design contains no copied BenchLM logo, copy, data, rankings, or proprietary assets.
- The result still looks like the user's product, not a counterfeit BenchLM page.

## Handoff

Report the implemented page recipe, token mapping, responsive behavior, and validation performed. Call out any interaction or visual state that could not be verified.
