# darfin-front

React 18 SPA for Korean disclosure analysis, paper trading, and investor community.

## Commands

```bash
npm run dev      # Vite dev server, default :5173
npm run build    # Production build
```

API base URL: `VITE_API_BASE_URL` or `http://localhost:8080` (see `src/app/shared/api/apiClient.js`).

## Structure

```
src/app/
  pages/           # Landing page only (Home.jsx)
  features/        # Feature-sliced modules
    company-analysis/  # /company — largest feature
    filings/           # /disclosure
    paper-trading/     # /trading
    community/         # /community
    auth/              # Login, signup, OAuth
    account/           # MyPage, subscription
  shared/
    components/    # Layout, shadcn ui/
    api/           # apiClient.js, authApi.js
  routes.jsx       # React Router v7 config
src/mocks/         # API contracts + landing demo data
src/styles/        # Tailwind 4, theme.css tokens
```

## Read before changing

| Area | Doc |
|------|-----|
| Design system (colors, typography, dual-system audit) | [DESIGN.md](DESIGN.md) |
| Company analysis data contract | [src/mocks/companyAnalysis/types.js](src/mocks/companyAnalysis/types.js) |
| Workspace architecture | [../docs/architecture.md](../docs/architecture.md) |

## Conventions

- Functional components, feature code in `src/app/features/{name}/`
- **Tailwind + slate/blue palette** for Layout, company-analysis, community, filings, account
- **Inline `style={{}}` only in `paper-trading/`** — legacy fintech palette (see DESIGN.md §2)
- Korean user-facing copy; **red = price up, blue = price down** (KRX convention)
- Shared UI primitives in `src/app/shared/components/ui/` (shadcn/Radix)
- API calls via `apiClient.js` (fetch + Bearer token + auto-refresh)
- Path alias: `@` → `src/`

## Routes

| Path | Feature |
|------|---------|
| `/` | Landing |
| `/company`, `/company/:id` | Company analysis |
| `/disclosure`, `/disclosure/:id` | Filing viewer |
| `/trading` | Paper trading (internal sub-nav, not URL-based) |
| `/community` | Community Q&A |
| `/login`, `/signup` | Auth |

## Do not

- Add inline styles outside `paper-trading/` without strong reason
- Change mock types in `types.js` without coordinating `darfin-main` API
- Use axios — project uses native `fetch` via `apiClient.js`
- Add tests unless requested (no test infra yet)

## Related repos

- `../darfin-main` — Spring API this front calls
- `../darfin-company-analysis` — pipeline that feeds `/company` data
