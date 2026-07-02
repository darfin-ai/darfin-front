# Darfin Design System

Audited from the running app at `/trading` (모의투자) and its sub-pages, cross-referenced against the rest of the codebase. This document has two jobs:

1. **Describe** the visual language actually implemented on `/trading` — colors, type, spacing, components — as the de facto system for that surface.
2. **Flag** where it diverges from the rest of the app, and where it's inconsistent with itself, so those gaps are visible before anyone builds on top of it.

> **Headline finding:** this codebase runs **two unrelated design systems** side by side. `/trading` and its sub-pages (`내 주식`, `관심`, `모의 자금`, `AI 분석`) are hand-rolled with inline `style={{}}` objects and a bespoke fintech palette. Everything else (`/company`, `/community`, `/disclosure`, `/mypage`, the shared `Layout` shell) uses Tailwind + shadcn/ui with a slate/blue palette and a `default_shadcn_theme.css` token set. Neither imports from the other. See [§7 Audit Findings](#7-audit-findings).

---

## 1. Where things live

| Layer | Location | Styling approach |
|---|---|---|
| App shell (header/nav/footer) | `src/app/shared/components/Layout.jsx` | Tailwind classes, `slate-*` / `blue-*` |
| shadcn primitives (unused by trading) | `src/app/shared/components/ui/*.jsx` | Tailwind + CSS vars from `src/styles/theme.css` |
| Global CSS tokens | `src/styles/theme.css`, `default_shadcn_theme.css` | oklch-based shadcn tokens (`--primary`, `--card`, etc.) |
| **Trading feature (this doc's focus)** | `src/app/features/paper-trading/**` | Inline `style={{}}`, constants in `components/ui.jsx` |

Trading pages: `Home.jsx` (홈), `Detail.jsx` (종목 상세), `Invest.jsx` (내 주식 / 관심 / 모의 자금 / 체결내역), `AIReports.jsx` (AI 분석). Shared primitives for all of them live in `components/ui.jsx`.

---

## 2. Color

### 2.1 Trading system tokens (`components/ui.jsx:9-14`)

Only five colors are actually exported as named constants — everything else below is a hardcoded hex literal repeated inline across the four page files.

| Token | Value | Usage |
|---|---|---|
| `INK` | `#191F28` | Primary text, headline numerals |
| `SUB` | `#8B95A1` | Secondary/meta text, placeholders |
| `BRAND` | `#1B64DA` | Primary actions, active tab underline, links, focus accents |
| `UP` | `#F04452` (red) | Price increase **and** destructive actions (reset, delete) |
| `DOWN` | `#3182F6` (blue) | Price decrease |

`UP`/`DOWN` follow **Korean market convention** (red = up, blue = down) — the inverse of US/Western charting. This is correct for a KRX-facing product but worth calling out since it reads as "backwards" to anyone used to green/red conventions.

### 2.2 Unnamed tokens in active use (not exported, but used repeatedly)

Frequency from a grep across `paper-trading/`:

| Hex | Count | Apparent role |
|---|---|---|
| `#4E5968` | 40 | Tertiary body text — sits between `INK` and `SUB` but has no name |
| `#F2F4F6` | 30 | Neutral fill (segmented control track, chip bg, progress track) |
| `#E5E8EB` | 16 | Default border (inputs, ghost buttons, step buttons) |
| `#F9FAFB` | 15 | Subtle panel fill (stat tiles, empty rows) |
| `#EFF5FF` | 10 | Blue-tint background (DOWN badges, info tags, selected states) |
| `#EEF1F4` | 9 | Hairline divider (below header, between cards) |
| `#C5CBD3` | 6 | Disabled icon / placeholder glyph |
| `#F5A623` | 5 | Amber — MA5 line, mid-tier health score |
| `#B0B8C1` | 5 | Inactive tab label, disabled button text |
| `#FFF5F6` / `#FEF0F1` | 8 | Red-tint background (UP badges, reset/danger surfaces) |
| `#F6F8FA` | 4 | Row divider inside dense lists |
| `#1FA463` | 4 | Success green — market-open dot, top health tier |
| `#C2740B` on `#FFF6E6`/`#FFF8EC` | ~6 | "Advice" callout accent (AI Reports only) |
| `#7C3AED` | 3 | Purple — MA20 line, one donut slice |

**Semantic colors, informally:**

- **Success / open market:** `#1FA463`
- **Warning / mid-tier:** `#F5A623`
- **Danger:** overloaded onto `UP` (`#F04452`) — same color as "price rose." A reset-account button and a stock's daily gain use the identical red.
- **Info:** `BRAND` on `#EFF5FF`
- **Advice (AI Reports-only accent):** `#C2740B` on `#FFF6E6` — a sixth semantic color that doesn't appear anywhere else in the app.

### 2.3 Chart & data-viz palette

`DONUT_COLORS` (`Invest.jsx:33`) — 8-step categorical palette for portfolio composition:
`#1B64DA, #F04452, #F5A623, #7C3AED, #1FA463, #FF7A45, #00B8D9, #8B95A1`

Candlestick chart (`CandleChart` in `ui.jsx`) uses `UP`/`DOWN` for candle bodies and volume bars, plus `#F5A623` (MA5) and `#7C3AED` (MA20) as fixed, non-token overlay colors.

### 2.4 Gradients

Two brand gradients, both used for hero/feature surfaces, values duplicated inline rather than named:
- Hero (logged out): `linear-gradient(120deg,#1B64DA 0%,#2E7DF0 55%,#3D8BFF 100%)`
- Hero (logged in): `linear-gradient(120deg,#103E8C 0%,#1B64DA 60%,#2E7DF0 100%)`
- Soft card wash (Funds guide, AI Reports intro): `linear-gradient(135deg,#F4F8FF,#fff)`

### 2.5 Contrast with the rest of the app

The shadcn/Tailwind side (`Layout.jsx`, company-analysis, community) uses `slate-900/600/500/400` for text, `slate-50/100/200` for surfaces, and `blue-600/700` for brand — a cooler, more muted palette than trading's saturated `#1B64DA` / `#F04452`. There is no shared token bridging the two (see §7).

---

## 3. Typography

No typeface is declared anywhere in `paper-trading/` — it inherits the browser/system default (`src/styles/fonts.css` is empty; `theme.css` sets `--font-size: 16px` as a base but trading pages hardcode `px` sizes directly rather than referencing it). There is no font-family override in `index.html` either, so trading renders in the OS default sans-serif.

**Observed type scale** (all inline `fontSize`, in px — no scale variable exists):

| Size | Weight | Example use |
|---|---|---|
| 40 | 800 | Hero asset total (`InvestHero`) |
| 36 | 800 | Page-level total (Portfolio, Funds) |
| 32 | 800 | Hero headline (logged-out) |
| 30 | 800 | Stock detail price |
| 26 | 800 | `PageShell` title |
| 24 | 800 | Index card value, stock name |
| 22 | 800 | Watch rail title |
| 20 | 800 | `SectionTitle` |
| 19 | 800 | `Tab` label |
| 17–18 | 700–800 | Card titles, `PanelTitle`, metric values |
| 15–16 | 700–800 | Row primary text, buttons |
| 13–14 | 600–700 | Body copy, secondary values |
| 11–12 | 600–700 | Meta text, table headers, badges |

**Weight vocabulary:** effectively binary — `700` (semibold, most labels/values) and `800` (bold, headlines/emphasis/CTAs). Regular (`400`/`600`) is reserved for muted/secondary text only. There is no `500`/`600` step in practice despite `600` appearing occasionally for table headers.

**Letter-spacing:** large numerals (24px+) get `-0.02em` to `-0.03em` tightening — a consistent, deliberate touch for headline figures (asset totals, prices, index values).

**Line-height:** body copy explanations use `1.5`–`1.7`; everything else is effectively `1` or unset.

By contrast, the shadcn side inherits a real type scale from `theme.css` (`h1`–`h4`, `--text-2xl`/`--text-xl`/etc., `font-weight-medium: 500` / `font-weight-normal: 400`) — trading opts out of all of it.

---

## 4. Spacing, radius, elevation

### 4.1 Radius

No radius scale exists — values are chosen per-component from a loose set:

| Radius | Used for |
|---|---|
| `6–8px` | Badges, tags, small chips |
| `9–10px` | Inputs, segmented-control buttons, step buttons |
| `12px` | Ghost/primary buttons, list rows, stat tiles |
| `14px` | Large CTAs (order submit, hero CTA), modal-internal cards |
| `20px` | `Card` (the base container — every card in the feature) |
| `24px` | `PageShell` hero banner, `Modal` |
| `999px` | Pills, segmented "sort" toggles, subtab buttons |
| `50%` | `Avatar`, circular icon badges |

`Card`'s own radius (20px) doesn't match any button or input radius — nothing shares a consistent step ratio.

### 4.2 Shadow

Three ad hoc elevation values, no scale:
- `0 1px 3px rgba(0,0,0,0.08)` — active segment in a segmented control (button "lift")
- `0 12px 32px rgba(0,0,0,0.12)` — search results dropdown
- `0 24px 60px rgba(0,0,0,0.2)` — modal
- `0 -4px 20px rgba(0,0,0,0.05)` — bottom market ticker (upward shadow)

### 4.3 Layout

- Page max-width: **1480px**, centered, `padding: 28px 28px 80–100px` (`PageShell`, `Home`, `Detail`).
- Two-column detail layouts: content `1fr` + fixed sidebar (`380px` order panel, `392px` insight rail) with `gap: 20–28px`.
- Sticky sidebars use `position: sticky; top: 84px` (clears the 64px global header + sub-nav).
- Dense data rows use CSS grid with explicit pixel/fr column templates defined as constants, e.g. `RANK_COLS = '28px 28px 40px 1fr 112px 86px 120px 96px'` (`Home.jsx:145`) — effective but means every table's column layout is a one-off, unreusable string.

The shadcn shell instead uses Tailwind's `max-w-7xl` (1280px) — trading's 1480px container is **wider than the header/footer that wraps it**, so the trading page content doesn't align to the same vertical guides as the chrome around it.

---

## 5. Components

All defined in `paper-trading/components/ui.jsx` unless noted. None are shared with, or built on, the shadcn primitives in `shared/components/ui/`.

| Component | Purpose | Notes |
|---|---|---|
| `Card` | Base container: white, `1px solid #EEF1F4`, `20px` radius, `24px` padding | Padding overridden ad hoc via `style` prop on ~half of call sites |
| `PageShell` | Page title + optional subtitle + right-aligned action, wraps children | Used by all `Invest.jsx` and `AIReports.jsx` pages, not `Home`/`Detail` |
| `Pill` | Pill-shaped toggle button (filter tabs like 거래대금/거래량) | `active` prop swaps fill between `BRAND`/color and `#F2F4F6` |
| `Tab` / segmented `SubNav` tabs | Underline-style tab, `BRAND` active indicator | Two independent tab implementations exist — `Tab()` in ui.jsx and the inline tab buttons in `TradingApp.jsx`'s `SubNav` — visually similar but not the same component |
| `Heart` | Watchlist favorite toggle, filled/outline SVG | Stops propagation internally — always safe inside a clickable row |
| `Avatar` | Circular stock logo with graceful fallback to a colored initial | Falls back to a deterministic 2-color hash (`avatarColor`) on image error |
| `Sparkline` | Minimal SVG line+gradient-fill chart | Used in market index cards, watch rail |
| `CandleChart` | Full OHLC candlestick + volume + MA overlay + crosshair tooltip | ~180 lines, single component, not decomposed; hover/tooltip logic is bespoke SVG math |
| `Donut` | SVG ring chart via stroke-dasharray | Used once (portfolio composition) |
| `Modal` | Centered overlay, click-outside + Escape to close | Fixed width prop, no size variants beyond a raw number |
| `Empty` | Centered empty-state card with optional CTA | |
| `Metric` | Label-over-value stat pair | |
| `LoginGate` | Empty-state prompting login | **Defined twice** — once exported from `ui.jsx:378`, once redefined locally and unexported in `Invest.jsx:136`. Identical implementation, duplicated. `AIReports.jsx` imports the shared one; `Invest.jsx` uses its own copy. |
| `iconBtn` / `ghostBtn` / `primaryBtn` | Style-object "button variants" (not components — plain objects spread into `style`) | No disabled/hover states baked in; each call site re-implements hover via inline `onMouseEnter`/`onMouseLeave` DOM mutation |
| `SectionTitle` / `PanelTitle` | Heading with a small brand-colored accent bar + optional right-aligned action | Two near-identical implementations (`Home.jsx` vs `Detail.jsx`) instead of one shared component |

### 5.1 Buttons — no formal variant system

Buttons are assembled per call-site from raw style objects. Observed heights alone: `34, 36, 38, 40, 44, 46, 48, 52, 54px` — no consistent size scale (no small/medium/large tier). Primary CTA color also isn't fixed: main actions use `BRAND`, but the order panel's submit button dynamically becomes `UP` (buy) or `DOWN` (sell) depending on state — correct semantically, but means "primary button" has three possible colors depending on context, undocumented anywhere.

### 5.2 Iconography

All icons are hand-written inline SVG (stroke-based, `strokeWidth 2–2.4`, `strokeLinecap round`) — no icon library is used inside `paper-trading/`, despite `lucide-react` already being a project dependency and used throughout `Layout.jsx` and other features. Sizes are inconsistent per instance (`13, 14, 15, 16, 18, 20, 22, 26px`) rather than drawing from a fixed icon-size scale.

---

## 6. Patterns & interaction language

- **Segmented controls** (period selector, order type, sort order, BUY/SELL): a `#F2F4F6` track with a white `background: #fff` pill that has a small shadow (`0 1px 3px rgba(0,0,0,0.08)`) on the active option — this is the single most repeated interaction pattern in the feature (7+ independent implementations across the four pages, always hand-rolled inline rather than shared).
- **Hover on rows:** raw DOM manipulation via `onMouseEnter`/`onMouseLeave` setting `e.currentTarget.style.background` — not CSS `:hover`, so it won't respond to focus-visible/keyboard nav and bypasses any theming.
- **Toast/confirmation:** order fills show an inline dismissing banner inside the panel itself (`OrderPanel`'s local `toast` state, auto-clears after 2.6s) — separate from the app-wide `sonner` Toaster already wired up in `Layout.jsx`. Two toast systems exist in the app; trading doesn't use the global one.
- **Two-step destructive confirm:** `ResetModal` (Funds 자금 초기화) requires clicking through a warning step, then typing the literal word "초기화" to confirm — the most defensive UX pattern in the app, appropriately reserved for the one truly irreversible action.
- **Empty/loading states:** consistently copy-driven ("데이터를 불러오는 중입니다...", "첫 글을 남겨보세요") rather than skeleton loaders — no loading skeleton exists anywhere in the feature except the AI report's spinner (`.spin` keyframe in `src/styles/index.css`).
- **Sticky ticker bar:** `MarketTicker` in `Home.jsx` is `position: fixed`, slides up from the bottom once `scrollY > 320`. It renders unconditionally at the bottom of `Home` only — index/rate info duplicated between the top `MiniIndexCard`s and this ticker.

---

## 7. Audit findings

Ordered roughly by impact.

1. **Two disconnected design systems.** Trading (`paper-trading/`) is 100% inline-style with its own palette; the rest of the app (`Layout`, company-analysis, community, filings, account) is Tailwind + shadcn/ui (`slate`/`blue` palette, `default_shadcn_theme.css` tokens, `text-2xl`/`h1`-driven type scale). A user moving from `/company` to `/trading` crosses into a visually different product — different blue (`#1B64DA` vs Tailwind `blue-600` `#2563EB`), different border color, different radius scale, different button shapes (pill vs rounded-md).
2. **No design tokens file for trading.** All 30+ colors are hex literals repeated across `Home.jsx`, `Detail.jsx`, `Invest.jsx`, `AIReports.jsx`. Only 5 (`INK/SUB/BRAND/UP/DOWN`) are named constants; the rest (`#4E5968`, `#F2F4F6`, `#E5E8EB`, `#F9FAFB`, `#EFF5FF`, `#FEF0F1`…) are copy-pasted hex strings with no single source of truth. Changing the brand blue today means a find-and-replace across 4 files.
3. **`UP` color is overloaded.** `#F04452` means both "stock price increased" and "destructive action" (Funds 자금 초기화 button, error copy). These are unrelated meanings sharing one token — a red CTA next to a red gain badge reads ambiguously.
4. **Duplicate `LoginGate` implementation** — identical component defined once in `ui.jsx` (exported) and again locally in `Invest.jsx` (unexported). `AIReports.jsx` uses the shared one, `Invest.jsx`/`Watchlist`/`Funds`/`Trades` use the local copy. Harmless today, but a future edit to one will silently not apply to the other.
5. **No button variant system.** 8+ distinct heights, ad hoc radii, and 3 different "primary" colors depending on buy/sell/default context, all assembled inline per call site rather than through `primaryBtn`/`ghostBtn` consistently — those two style objects exist but are inconsistently applied (many buttons ignore them entirely and hand-roll their own style block).
6. **Hover states bypass CSS**, using direct `style.background` mutation in `onMouseEnter`/`onMouseLeave`. This means no `:focus-visible` equivalent, no CSS transition, and keyboard-only users get no visual feedback on these rows (accessibility gap).
7. **Icon system fragmentation.** `lucide-react` is a project dependency and used in `Layout.jsx`/elsewhere, but trading hand-draws every icon as inline SVG instead — duplicated effort, inconsistent sizing/stroke weight, harder to swap or theme.
8. **Two toast systems.** The app has a global `sonner`-based `Toaster` (mounted in `Layout.jsx`, used for login/logout messages), but the order panel's buy/sell confirmation uses its own local, differently-styled inline toast. A user sees two visually distinct "toast" languages depending on which action triggered it.
9. **Container width mismatch.** Trading pages center content at `max-w: 1480px`; the global header/footer shell centers at Tailwind's `max-w-7xl` (1280px). Trading content is measurably wider than the chrome that frames it, so page edges don't align vertically when scrolling past the header.
10. **No typography scale reference.** `theme.css` defines a real scale (`--text-2xl` etc., weight tokens `400`/`500`) that the rest of the app inherits through bare `h1`–`h4`/`button`/`input` selectors; trading never uses it, hardcoding every `fontSize`/`fontWeight` pair instead (effectively reinventing a scale that lands on `700`/`800` only, skipping `500`/`600`).
11. **No dark-mode support in trading**, despite the app already shipping a full `.dark` token override in `theme.css`/`default_shadcn_theme.css` for the shadcn side. Trading's colors are hardcoded light-mode hexes with no `.dark` branch.
12. **Sixth ad hoc semantic color.** AI Reports introduces an "Advice" accent (`#C2740B` / `#FFF6E6`/`#FFF8EC`) that exists nowhere else in the app — a one-off addition to the informal color vocabulary rather than reuse of `#F5A623` (which already serves as this feature's "warning/amber").

---

## 8. Recommendations (if unifying is in scope)

- Promote the informal token list in §2.2 to real named constants (or CSS custom properties) alongside `INK/SUB/BRAND/UP/DOWN` in `ui.jsx`, and split `UP` into separate `POSITIVE` (price) and `DANGER` (destructive-action) tokens even though they currently share a hex value.
- Decide whether trading should visually merge with the shadcn shell (adopt `slate`/Tailwind tokens) or the rest of the app should adopt trading's fintech palette for anything finance-related — but stop growing the gap. At minimum, align the container max-width (1480 vs 1280) so page edges line up with the header/footer.
- Consolidate the segmented-control pattern (§6) into one shared `SegmentedControl` component — it's independently reimplemented at least 7 times.
- Replace inline SVG icons with `lucide-react` (already a dependency) to cut duplicated icon code and get consistent stroke/size defaults for free.
- Route the order-fill confirmation through the existing global `sonner` `Toaster` instead of a bespoke local toast.
- Delete the duplicate `LoginGate` in `Invest.jsx` and import the one from `ui.jsx`.
