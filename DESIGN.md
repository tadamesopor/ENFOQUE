# Design System: ENFOQUE — Front-End Developer & Photographer Portfolio

> Single source of truth for generating screens in Google Stitch. Every screen
> must obey the atmosphere, tokens, and bans below. When in doubt, choose the
> more restrained, more asymmetric, more confident option.

## 1. Visual Theme & Atmosphere

A dark, instrument-panel portfolio that feels like a calibrated viewfinder —
part terminal readout, part gallery wall. The canvas is deep off-black; type is
warm off-white. Small monospace HUD annotations (bracketed labels, coordinates,
frame counts, timecodes) frame large, quiet display type. The mood is precise
and cinematic, never busy: confident negative space, hairline rules, and
photography treated as the hero content rather than decoration.

- **Density:** 4 / 10 — Balanced, breathing. Large empty zones around big type.
- **Variance:** 8 / 10 — Strongly asymmetric. Offset columns, ragged baselines.
- **Motion:** 6 / 10 — Fluid spring physics; restrained but alive.

## 2. Color Palette & Roles

- **Viewfinder Black** (#0A0A0B) — Primary background surface (Zinc-950 depth).
- **Plate Charcoal** (#141416) — Raised surfaces, cards, panels.
- **Graphite Step** (#1C1C20) — Hover surfaces, secondary panels.
- **Hairline** (rgba(236,233,226,0.12)) — 1px structural rules and dividers.
- **Bone White** (#ECE9E2) — Primary text and display type (never pure white).
- **Ash Grey** (#9B988F) — Secondary text, captions, HUD labels, metadata.
- **Faint Grey** (#67655F) — Tertiary text, disabled, bracket glyphs.
- **Signal Ember** (#C2542F) — THE single accent (saturation ~62%). Active
  status dots, focus rings, current-page underline, hovered timecodes. Used in
  ≤ 5% of any screen. Never as a large fill or a glow.

Constraints: one accent only, no purple/blue "AI neon", no gradients on text,
no pure black (#000000), no pure white (#FFFFFF). One consistent palette across
every screen — no warm/cool grey drift.

## 3. Typography Rules

- **Display / Headlines:** `Cabinet Grotesk` — uppercase, weight 700–800,
  letter-spacing -0.03em, line-height 0.86. Hierarchy comes from weight and
  color, not ever-larger sizes. Headlines are solid Bone White — no fills,
  outlines, gradients, or per-letter effects.
- **Body:** `Satoshi` — weight 400–500, line-height 1.6, max 65 characters per
  line, secondary copy in Ash Grey.
- **Mono / HUD:** `JetBrains Mono` — weight 400, letter-spacing 0.18em,
  uppercase, 11–12px. Used for bracketed labels `[ ONLINE ]`, indices `03 / 09`,
  coordinates `51.05°N // 3.72°E`, lens/frame data `35MM · F1.8`, timecodes.
- **Number rule:** all standalone figures (years, counts, EXIF) use JetBrains
  Mono with tabular figures.
- **Banned:** `Inter`, system-default sans, and all generic serifs
  (`Times New Roman`, `Georgia`, `Garamond`). No serif anywhere in this system.

## 4. Component Stylings

- **Buttons / Links:** Flat, no outer glow. Primary = Bone White fill on
  Viewfinder Black text; secondary = ghost with Hairline border. Active state
  presses -1px (translateY). Inline text links reveal an underline that wipes in
  from the left; current/active uses Signal Ember.
- **Project / Work cards:** No heavy card chrome — a header row (mono index +
  discipline), then the image in a 4:5 frame, then a dotted hairline caption
  rule. On hover the image scales to 1.05 inside an `overflow:hidden` frame and
  a mono "VIEW PROJECT" label + arrow drift up from the bottom edge. Elevation
  via the image itself and the dotted rule, not box-shadows.
- **Photo tiles (Off-Work gallery):** Tonal frames on a 12-column editorial
  grid with mixed aspect ratios (16:10, 4:5, 21:9). Hover reveals mono
  location + lens caption. A frame index `P03` sits top-left.
- **Inputs:** Label above (mono, Ash Grey), field on Plate Charcoal with a
  Hairline border, focus ring in Signal Ember, error text below in Signal Ember.
  No floating labels.
- **Loaders:** Skeleton blocks matching the exact target layout (image frames,
  caption rules). No circular spinners.
- **Empty states:** A composed mono-annotated frame (e.g. `[ NO FRAMES YET ]`)
  with one clear action — never bare "No data".
- **Status indicator:** A small Signal Ember dot with a soft pulse beside a mono
  `[ ONLINE ]` label in the header.

## 5. Layout Principles

- CSS Grid first; no `calc()` percentage math. Contain content to a max-width of
  1600px, centered, with generous gutters (clamp 1.5rem → 3.5rem).
- Hero is **asymmetric / left-weighted**, never centered. Display type anchors
  one side; HUD metadata and a single CTA occupy the opposite corner.
- No overlapping elements. Every label, image, and heading owns a clean spatial
  zone — HUD annotations sit in margins and corners, never on top of type/photos.
- Section breaks use a single full-bleed Hairline rule with a mono section index
  + bracket label pinned to the top-left corner of the section.
- The generic "3 equal cards in a row" is banned. Use staggered/offset columns
  (give alternate cards a top offset) or the 12-column photo grid.
- Full-height sections use `min-h-[100dvh]` — never `h-screen`.

## 6. Motion & Interaction

- **Spring default:** stiffness 100, damping 20 — weighty, premium. No linear
  easing; for tweened reveals use `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Entrance:** display lines rise in from a masked baseline (translateY 110% →
  0); section content staggers in on first view (60–90ms cascade).
- **Scroll-velocity warp (signature):** large headings and image frames take a
  subtle skew (≤ 4°) + scale (≤ 1.05) driven by scroll speed, easing back to
  rest as scrolling slows. Clean transform on the whole element only — NOT a
  per-letter glitch, NOT RGB-split, NOT chromatic aberration. Headlines stay
  solid and legible at all times.
- **Perpetual micro-loops:** the status dot pulses; a live mono clock ticks in
  the header.
- **Performance:** animate `transform` and `opacity` only — never `top`, `left`,
  `width`, `height`. Grain/noise lives on one fixed pseudo-element.
- **Page transitions:** route changes fade/slide; opening a project expands its
  media via a clip + scale reveal.

## 7. Responsive Rules

- Mobile-first collapse (< 768px): all multi-column layouts become a single
  column. No exceptions, no horizontal overflow.
- Headlines scale with `clamp()`; body never below 1rem. Touch targets ≥ 44px.
- Scroll-warp intensity is reduced on small screens; the live cursor effect is
  disabled on touch devices.
- Desktop horizontal nav collapses to a full-screen mono menu.
- Section vertical rhythm scales `clamp(3rem, 8vw, 6rem)`.

## 8. Anti-Patterns (NEVER DO)

- No emojis anywhere.
- No `Inter`; no generic serifs; no system-default fonts for display.
- No pure black (#000000) or pure white (#FFFFFF).
- No purple/blue "AI" neon, no outer-glow or neon shadows.
- No gradient text on headlines; no per-letter glitch / RGB-split / chromatic
  aberration effects of any kind.
- No more than one accent color; keep it under ~5% coverage.
- No centered hero (variance is high here — keep it asymmetric).
- No "3 equal cards" feature row.
- No filler UI text: "Scroll to explore", "Swipe down", bouncing chevrons,
  scroll-arrow icons.
- No overlapping text/images — clean spatial separation always.
- No generic placeholder names ("John Doe", "Acme", "Nexus") or fake round
  numbers ("99.99%", "50% faster").
- No AI copywriting clichés ("Elevate", "Seamless", "Unleash", "Next-Gen").
- No broken Unsplash hotlinks — use `picsum.photos` or local assets for photo
  placeholders.
