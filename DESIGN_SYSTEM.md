# Darfin Design System

The canonical visual language for all Darfin surfaces — landing, app shell, company analysis, disclosure, community, and paper trading. Audited from `src/app/shared/lib/uiRecipes.js`, `Layout.jsx`, and company-analysis as the reference implementation.

> **Previously:** `/trading` ran a separate inline-style fintech palette (documented in [DESIGN.md](DESIGN.md)). As of 2026-07 it has been migrated to this system. DESIGN.md is kept as historical audit reference.

Scope: Tailwind 4 utility classes. Import recipes from `src/app/shared/lib/uiRecipes.js` — do not re-derive values by eye.

---

## 1. Principles

1. **Restrained weight, generous space.** Nothing on the landing page is bolder than `font-semibold` (600). Hierarchy comes from size, color, and whitespace — not weight. (The one exception: the `Darfin` wordmark and tiny avatar initials use `font-bold`.)
2. **Slate for structure, blue for action.** Neutrals are always `slate-*`. Blue (`blue-600`) appears only where something is interactive or where AI insight is highlighted. If it's blue, you can click it or the AI wrote it.
3. **Every color has a dark twin.** Dark mode is class-based (`next-themes` toggles `.dark`). Every color utility ships with its `dark:` pair at the call site — there is no "light-only" component.
4. **Real product as illustration.** Marketing visuals are working mockups of actual product UI (browser-chrome frames, real tickers, real filing excerpts) — never abstract illustration or stock art.
5. **Korean-first typography.** `word-break: keep-all` is set globally on `body` (`globals.css`). Numerals always get `tabular-nums`. Copy lives in `src/app/shared/i18n/locales/{ko,en}.js` — never hardcode strings.
6. **Motion is quiet and skippable.** Entries fade/rise 16px in 350ms; hovers lift with a spring. Every animation checks `useReducedMotion()` and collapses to the end state.

---

## 2. Color

Tailwind palette references (light → dark pair). No raw hex anywhere on this surface.

### 2.1 Neutrals (structure)

| Role | Light | Dark |
|---|---|---|
| Page background | `bg-slate-50` | `dark:bg-slate-950` |
| Card / header surface | `bg-white` | `dark:bg-slate-900` |
| Subtle fill (tab tracks, chips) | `bg-slate-100/80` or `bg-slate-50` | `dark:bg-slate-800/80` / `dark:bg-slate-800` |
| Border (cards, header) | `border-slate-200` | `dark:border-slate-800` |
| Hairline (inside cards) | `border-slate-100`, `divide-slate-100` | `dark:border-slate-800`, `dark:divide-slate-800` |
| Heading text | `text-slate-900` | `dark:text-slate-100` |
| Body text | `text-slate-600` | `dark:text-slate-400` (nav: `dark:text-slate-300`) |
| Secondary text | `text-slate-500` | `dark:text-slate-400` |
| Meta / eyebrow / captions | `text-slate-400` | `dark:text-slate-500` |
| Disabled-ish glyphs | `text-slate-300` | `dark:text-slate-600` |

### 2.2 Brand

| Role | Light | Dark |
|---|---|---|
| Primary action fill | `bg-blue-600` hover `bg-blue-700` | same (white text holds contrast) |
| Action link text | `text-blue-600` hover `text-blue-700` | `dark:text-blue-400` hover `dark:text-blue-300` |
| Hero gradient text | `from-blue-600 to-cyan-500` (`bg-clip-text text-transparent`) | `dark:from-blue-400 dark:to-cyan-300` |
| AI-insight tint (callout bg) | `bg-blue-50/60` border `border-blue-100` | `dark:bg-blue-950/30` border `dark:border-blue-900/50` |
| Info badge | `bg-blue-50` text `blue-700` border `blue-200` | `dark:bg-blue-950/40` text `dark:blue-300` border `dark:blue-800` |

### 2.3 Semantic accents

Follows **Korean market convention: red = up/buy, blue = down/sell.**

| Meaning | Utilities |
|---|---|
| Price up / buy / high impact | `red-400`–`red-500` (text `red-600` / `dark:red-400`) |
| Medium impact / management emphasis | `amber-400` (text `amber-600` / `dark:amber-400`), badge `bg-amber-50 text-amber-700 border-amber-200` (+ dark `950/40`, `300`, `800`) |
| Neutral / governance | `slate-300` / `dark:slate-600` |
| Chart down-bars | `bg-blue-200 dark:bg-blue-900/60` (up-bars `bg-red-200 dark:bg-red-900/50`) |
| Positive P&L text | `text-red-500 dark:text-red-400` (Korean convention — red is a gain) |

### 2.4 Avatar gradient palette

8-step categorical palette for company avatar badges, indexed `i % 8`. Must match `CompanyQuickLinks.jsx` on `/company` — change in both places or neither:

```
from-blue-500 to-blue-600      from-violet-500 to-violet-600
from-teal-500 to-teal-600      from-amber-500 to-amber-600
from-rose-500 to-rose-600      from-indigo-500 to-indigo-600
from-emerald-500 to-emerald-600  from-cyan-500 to-cyan-600
```

### 2.5 Inverted section (final CTA)

One section per page may invert: `bg-slate-900`, white heading, `text-slate-400` body, primary button becomes `bg-white text-slate-900 hover:bg-slate-100`, secondary becomes `bg-white/10 border-white/20 text-white hover:bg-white/15`. It does not change in dark mode (already dark).

---

## 3. Typography

**Typeface:** system sans (`font-sans` on the Layout root; `fonts.css` is intentionally empty). Do not add a webfont without updating this doc.

**Global rules:** `word-break: keep-all` on `body`. All numerals (prices, tickers, counts, dates) get `tabular-nums`.

### 3.1 Scale

| Level | Classes | Notes |
|---|---|---|
| Hero H1 | `text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold tracking-tight leading-[1.15]` | 56px desktop. Two lines max; second line may take the gradient treatment |
| Section H2 | `text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight` | the `SECTION_TITLE` constant |
| Feature-row H3 | `text-2xl font-semibold` | walkthrough rows |
| Card H3 | `text-sm font-medium` | lens cards, list rows |
| Section desc | `text-base text-slate-500 dark:text-slate-400 leading-relaxed` | the `SECTION_DESC` constant |
| Eyebrow | `text-xs font-medium text-slate-400 dark:text-slate-500 mb-2` | the `EYEBROW` constant; numbered form: `01 · 기업 분석` |
| Body small | `text-sm leading-relaxed` | bullets, card copy |
| Meta / captions | `text-xs` | timestamps, tickers, footnotes |
| Micro (inside mockups) | `text-[11px]` / `text-[10px] leading-snug` | only inside `BrowserChrome` mockups, never for real UI copy |
| Uppercase kicker | `text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.14em]` | used once, above the DART logo |

**Weights:** `font-medium` (500) for labels/links/buttons, `font-semibold` (600) for all headings and emphasized values. Nothing heavier (see §1.1).

**Line length:** hero subtitle `max-w-[36rem]`; centered section intros `max-w-[45rem] mx-auto`; hero text block `max-w-[44rem]`.

---

## 4. Layout & spacing

### 4.1 Containers (`globals.css`)

```css
.container-sm  /* 720px  — hero copy, reading blocks, pricing teaser, final CTA */
.container     /* 1200px — every standard section */
.container-lg  /* 1280px — wide layouts (rarely needed) */
/* all: margin-inline auto; padding-inline clamp(1.25rem, 4vw, 2.5rem) */
```

The app shell (header/footer inner) also uses `.container`, so marketing content and chrome share vertical guides.

### 4.2 Section rhythm

- Standard section: `py-14 sm:py-16` (the `SECTION` constant). Hero: `pt-10 sm:pt-12 pb-14 sm:pb-16`. Low-key teaser rows: `py-10`.
- Centered section header (eyebrow + H2 + desc): `max-w-[45rem] mx-auto text-center` with `mb-8` (before dense content) or `mb-12` (before a walkthrough).
- Stacked feature rows: `space-y-16 lg:space-y-20`.

### 4.3 Two-column split (hero, walkthrough rows)

```
grid grid-cols-1 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-10 lg:gap-16 items-center
```

Text gets the narrow column (~486px at 1200), mockup the wide one. Alternate sides per row with `lg:order-2` on odd indices. Keep `minmax(0,…)` — it lets the mockup shrink instead of overflowing.

### 4.4 Radius scale

| Radius | Use |
|---|---|
| `rounded-md` (6px) | buttons, links-as-buttons, list-row hover surfaces, active tab pill |
| `rounded-lg` (8px) | tab tracks, mobile-menu rows, mockup buy/sell buttons |
| `rounded-xl` (12px) | **cards — the base container** (`CARD` constant), stat bands |
| `rounded-full` | badges, pills, avatars, header auth buttons |

### 4.5 Elevation

Shadows are near-absent by design; borders do the work.

- Card resting: `shadow-sm dark:shadow-none` (only on hero demo card; plain `CARD` has none).
- Hover lift (mockups): animated to `0 20px 40px -12px rgba(15,23,42,0.12), 0 0 0 1px rgba(148,163,184,0.15)`, resting `0 1px 3px 0 rgba(15,23,42,0.06)`.
- Active segmented-tab pill: `shadow-sm`.

---

## 5. Component recipes

Source of truth: constants at the top of `Home.jsx`. Copy exactly.

### 5.1 Buttons (fixed size: `h-10 px-5 text-sm font-medium rounded-md`)

```
BTN_PRIMARY   inline-flex items-center justify-center gap-2 h-10 px-5 bg-blue-600
              hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors
BTN_SECONDARY inline-flex items-center justify-center gap-2 h-10 px-5 border border-slate-200
              dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50
              dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium
              rounded-md transition-colors
```

Primary carries a trailing `<ArrowRight size={16} />`. Header auth buttons are the exception: `rounded-full`, `py-2 px-3/4`.

### 5.2 Links

```
LINK_ACTION  inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400
             hover:text-blue-700 dark:hover:text-blue-300 transition-colors     + <ChevronRight size={15–16} />
LINK_SUBTLE  inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500
             hover:text-slate-600 dark:hover:text-slate-300 transition-colors   + <ArrowRight size={14} />
```

### 5.3 Card

```
CARD  rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900
```

Internal structure uses hairlines, not nested cards: `divide-y divide-slate-100 dark:divide-slate-800`; header/footer strips `border-b`/`border-t border-slate-100 dark:border-slate-800` with `px-5 py-2.5–3.5`.

### 5.4 Badges & pills (`rounded-full px-2 py-0.5 text-xs font-medium border`)

| Variant | Classes |
|---|---|
| Info / brand | `bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800` |
| Working / analyzing | same shape in `amber-*` |
| Neutral | `bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700` |
| Muted tag (no border) | `bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] px-2 py-1` |

### 5.5 Avatar badge

```
flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br
text-xs font-semibold text-white  +  AVATAR_PALETTE[i % 8]
```

Label = first 2 characters of company short name (`avatarLabel()`). Smaller contexts use `h-8 w-8 text-[10px]`.

### 5.6 AI summary callout

The signature element — marks AI-generated insight, always with a `Lightbulb` icon:

```
flex gap-2 rounded-md border border-blue-100 dark:border-blue-900/50
bg-blue-50/60 dark:bg-blue-950/30 px-3 py-2 (or py-2.5)
```

Icon `Lightbulb size={13–14} className="mt-0.5 shrink-0 text-blue-500 dark:text-blue-400"`; bold lead-in `font-medium text-blue-700 dark:text-blue-300` ("AI 요약."), then plain `text-slate-700 dark:text-slate-300`.

### 5.7 Segmented tabs

```
track:  flex gap-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-lg p-1 text-xs font-medium
active: flex-1 text-center py-1.5 bg-white dark:bg-slate-900 rounded-md
        text-slate-900 dark:text-slate-100 shadow-sm
idle:   flex-1 text-center py-1.5 text-slate-400 dark:text-slate-500
```

### 5.8 Browser-chrome mockup frame (`BrowserChrome` in Home.jsx)

`CARD` + `overflow-hidden min-h-[360px] sm:min-h-[400px]`; title bar `px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b` with three `h-2.5 w-2.5 rounded-full` dots (`red-300`, `amber-300`, `emerald-300`) and a `text-xs font-medium text-slate-400 truncate` label; body `p-5 flex flex-col flex-1 justify-between`. Hover state animates the lift shadow (§4.5).

### 5.9 Feed rows (disclosures list)

Wrapper `CARD p-2` + `divide-y`; each row is a `Link`:
`group flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md transition-colors`, ending in `ChevronRight` that tints blue on `group-hover`. Column pattern: avatar → fixed `w-28` name/ticker → `flex-1 min-w-0 truncate` title → time + chevron.

### 5.10 Stat band (credibility strip)

Seamless bordered grid: `grid sm:grid-cols-3 gap-px rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800 overflow-hidden`; cells `bg-white dark:bg-slate-900 px-5 py-4 text-center` — the `gap-px` + tinted wrapper bg renders hairline dividers. Values `text-lg font-semibold tabular-nums`, animated count-up (§6).

### 5.11 Icons

`lucide-react` only. Sizes: 14–16 inline with text, 15 in bullet checks (`Check` in `text-blue-500 dark:text-blue-400 mt-0.5 shrink-0`), 16 in nav/feature lists, 20 for the account icon, 22 for the hamburger.

### 5.12 Header / nav (Layout.jsx)

`h-16` bar, `bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50`, inner `.container`. Nav link: `text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400`. **Nav is auth-adaptive:** logged out → `기능` dropdown (shadcn `dropdown-menu`) + `요금제` link; logged in → flat feature links (labels visible from `xl`), pricing inside the account dropdown. Dropdown triggers add `data-[state=open]:text-blue-600` and a chevron with `group-data-[state=open]:rotate-180`.

---

## 6. Motion (motion/react)

Every animated block must handle `useReducedMotion()` → render the end state, no tweens.

| Pattern | Spec |
|---|---|
| Section/card entry | `initial={{ opacity: 0, y: 16 }}` → `whileInView` `{ opacity: 1, y: 0 }`, `viewport={{ once: true }}`, `duration: 0.35, ease: "easeOut"` |
| List stagger | same, `delay: i * 0.06` (rows) or `i * 0.08` (stats); small rows use `y: 8, duration: 0.25` |
| Hover lift (mockups) | spring `stiffness: 260, damping: 22` to `y: -6, scale: 1.015, rotate: ±0.5–0.6` (tilt direction alternates per row) |
| Count-up stat | rAF loop, cubic ease-out `1-(1-t)^3`, 1.4–2.2s, triggers on `useInView` once |
| Streaming text (hero demo) | 16ms/char with a pulsing 2px caret |
| Marquee | duplicated row, `translateX(0 → -50%)`, `42s linear infinite`, reverse for second row; edge fade via absolute `w-10 sm:w-16 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent` |
| Mobile menu | `AnimatePresence`, `opacity/y ±8`, `0.2s easeOut` |

Interaction triggers: desktop = `onMouseEnter` on the whole row (activates the paired mockup's `active` animations); touch (`(hover: none)`) = tap-to-replay.

---

## 7. Content & i18n rules

- All copy through `useLocale().t()` — keys in `locales/ko.js` + `locales/en.js`, always added in pairs.
- Numbers: `toLocaleString("ko-KR")` + `tabular-nums`.
- Trust markers are part of the visual language: DART logo attribution above the hero H1, `출처`/접수번호 footers on demo cards, "모의투자 · 실제 돈 아님" disclaimers. Don't strip them for visual cleanliness.
- Eyebrows are numbered in flows (`01 · 기업 분석`) and plain for standalone sections.
- Section headline formula: verb-led, benefit-first, ~15–20 Korean chars (e.g. "실제 돈 없이, 먼저 연습해보세요").

---

## 8. Audit notes (as of 2026-07)

Minor inconsistencies found while extracting this system — acceptable today, listed so they don't propagate:

1. **Final CTA H2 skips a step** — `text-2xl sm:text-3xl` (no `lg:text-4xl`), one size below `SECTION_TITLE`. Looks intentional (inverted section is quieter); pick one and keep it.
2. **Two shades of "example" blue badge** — hero demo badge uses `text-blue-600`, mockup KOSPI badge `text-blue-700`. Same component role; should share one recipe.
3. **`theme.css`/shadcn tokens are mostly dead weight on this surface** — landing uses raw slate/blue utilities, not `--primary`/`--card` vars (which are near-black defaults, not Darfin blue). Only portal components (dropdown, dialog) consume them. If shadcn primitives get used more widely, re-point `--primary` at blue-600 first.
4. **Footer links are `href="#"` placeholders** (terms/privacy/API).
5. **Card padding varies** — `p-2` (feed wrapper), `p-3` (badges), `p-4` (lens cards), `p-5` (mockup bodies), `px-5 py-4` (stats). Defensible per density, but new cards should pick from these five, not invent a sixth.
6. **The `/trading` feature has been migrated** to this system (see `uiRecipes.js` + `paper-trading/components/ui.jsx`). [DESIGN.md](DESIGN.md) documents the pre-migration audit.

---

## 9. Quick-start checklist for a new section

1. Wrap in `<section className="py-14 sm:py-16">` + `.container` (or `.container-sm` for reading-width).
2. Header: `EYEBROW` → `SECTION_TITLE` → `SECTION_DESC`, centered `max-w-[45rem] mx-auto` if the section is symmetric.
3. Content in `CARD`s; hairlines (`divide-slate-100 dark:divide-slate-800`) instead of nested boxes.
4. One `LINK_ACTION` or `BTN_PRIMARY` per section — a single obvious next step.
5. Entry animation: `opacity 0→1, y 16→0, 0.35s`, `viewport once`, honor `useReducedMotion`.
6. Every color utility has its `dark:` pair. Check both themes before shipping.
7. Copy goes into both locale files; numerals get `tabular-nums`.
