# Visual System

## Design Character

The interface should feel like a research desk rather than a glossy analytics SaaS app: warm paper, dark ink, ruled dividers, compact editorial typography, and one calm signal color. Density is intentional, but hierarchy must remain obvious.

## Color System

The following values are faithful starting points derived from the public BenchLM surface. Rename or map them to the target project's tokens.

### Light mode

| Role | HSL | Approximate use |
| --- | --- | --- |
| Canvas | `50 23% 95%` | page background |
| Panel | `45 100% 99%` | cards, header, popovers |
| Panel 2 | `60 12% 92%` | headers, selected rows, inset bands |
| Panel 3 | `70 10% 89%` | stronger neutral state |
| Hairline | `70 7% 84%` | standard dividers |
| Strong hairline | `103 5% 72%` | inputs and emphasized frames |
| Ink | `150 9% 9%` | headings and primary text |
| Muted ink | `140 4% 28%` | body copy |
| Dim ink | `137 3% 41%` | metadata |
| Faint ink | `103 5% 72%` | low-emphasis labels |
| Accent | `177 71% 25%` | teal actions, links, key values |
| Positive | `136 42% 30%` | verified/success states |
| Warning | `25 74% 37%` | caution or stale evidence |
| Danger | `5 50% 38%` | failures or incidents |
| Info | `215 50% 40%` | neutral information |

### Dark mode

| Role | HSL |
| --- | --- |
| Canvas | `222 33% 6%` |
| Panel | `220 27% 9%` |
| Panel 2 | `221 27% 12%` |
| Panel 3 | `220 28% 15%` |
| Hairline | `216 25% 16%` |
| Strong hairline | `218 22% 21%` |
| Ink | `218 19% 92%` |
| Muted ink | `218 15% 66%` |
| Dim ink | `218 13% 41%` |
| Faint ink | `217 14% 29%` |
| Accent | `178 35% 52%` |
| Positive | `119 29% 61%` |
| Warning | `31 53% 64%` |
| Danger | `9 44% 61%` |
| Info | `210 42% 66%` |

### Usage discipline

- Keep the canvas and panels warm, not pure white.
- Do not use gradients as primary structure.
- Accent usage should generally stay below 10% of the visible surface.
- Provider/category colors may identify a compact avatar or a single data mark. They should not tint whole cards.
- In dark mode, preserve the same tonal hierarchy instead of simply inverting colors.

## Typography

Use three functional roles:

1. **Display:** bold geometric grotesk for wordmark, H1, H2, and strong editorial statements. BenchLM publicly uses Cabinet Grotesk. Use it only if properly licensed; otherwise choose a similar licensed display grotesk.
2. **Body/UI:** neutral modern sans. BenchLM publicly uses Satoshi. Suitable alternatives include Inter, Geist Sans, IBM Plex Sans, or the product's existing sans.
3. **Data:** monospace or tabular sans for ranks, scores, price, latency, dates, keyboard shortcuts, IDs, and compact labels. Geist Mono, IBM Plex Mono, or SFMono are good choices.

Suggested scale:

| Use | Size | Weight | Notes |
| --- | --- | --- | --- |
| H1 | `clamp(2rem, 4vw, 3rem)` | 700–800 | line-height 1.03; tracking `-0.03em` |
| H2 | `clamp(1.4rem, 2vw, 2rem)` | 700 | tight line-height |
| H3/card title | 14–18px | 600–700 | short labels |
| Body | 15px | 400 | line-height 1.6 |
| UI text | 12–13px | 500–600 | controls, navigation |
| Metadata | 10–11px | 400–600 | use sparingly |
| Data value | 12–16px | 500–700 | mono/tabular figures |

Avoid oversized marketing typography. The display headline should be compact enough to leave room for a meaningful task or evidence panel in the first viewport.

## Geometry

- Content container: about `1120px` max width.
- Reading measure: 60–68 characters for prose.
- Hero split: roughly 60/40 or `minmax(0, 1fr) 330px` when a summary panel is present.
- Standard radius: 6px.
- Compact radius: 2–4px for badges, avatars, and dense controls.
- Large radius: 8px for search and principal panels. Rarely exceed 12px.
- Border: 1px hairline; use stronger hairline for inputs and primary frames.
- Shadow: none by default; popovers may use a small `shadow-sm`.

## Spacing

Use an approximately 4px base grid.

- Tight inline gap: 4–6px.
- Control gap: 8–12px.
- Card padding: 12–16px.
- Section internal padding: 16–24px.
- Section separation: 40–64px desktop, 28–40px mobile.
- Header main row: about 66px high on desktop.
- Touch targets: minimum 44px on mobile.

Dense does not mean cramped. Reduce decorative padding before reducing label/value separation.

## Surface Hierarchy

1. Canvas establishes the editorial field.
2. Panel holds discrete tools, tables, cards, and header content.
3. Panel 2 marks headers, active rows, filter trays, and comparison conclusions.
4. Panel 3 is reserved for stronger selections or nested evidence blocks.
5. Hairlines create most grouping. Do not wrap every paragraph in a card.

## Iconography

- Prefer simple stroke icons at 14–18px.
- Provider identities can use compact 24–28px monogram tiles with a 1px border.
- Use chevrons, search, filter, external-link, download, copy, and disclosure icons.
- Avoid decorative 3D icons, oversized illustrations, or multicolor icon badges.

## Motion

- Default transitions: 150ms, standard ease-in-out.
- Pressed buttons may translate down by 1px.
- Hover should change border, ink, or background tone; avoid scaling cards.
- Disclosures should animate opacity/height only when it does not disturb table reading.
- Respect `prefers-reduced-motion` and eliminate nonessential transitions.
