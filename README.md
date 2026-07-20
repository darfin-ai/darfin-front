# darfin-front

React 18 + Vite 기반 SPA. 기업 분석/공시(DART) 조회, 모의투자, 커뮤니티, 계정/구독 관리를 제공하는 금융 정보 플랫폼입니다.

## Tech Stack

- **Framework**: React 18, Vite 6
- **Routing**: react-router v7 (`createBrowserRouter`)
- **Styling**: Tailwind CSS v4 + shadcn/radix 기반 UI 프리미티브, 일부 MUI 병행
- **State/Data**: axios, `@stomp/stompjs` (실시간 시세 WebSocket)
- **Charts**: recharts
- **Payments**: `@tosspayments/tosspayments-sdk`
- **Package manager**: pnpm

## Getting Started

```bash
pnpm install
pnpm dev      # 개발 서버 (기본 포트 5173)
pnpm build    # 프로덕션 빌드 (dist/)
```

### 환경 변수 (`.env.local`)

| 변수 | 설명 |
|---|---|
| `VITE_API_BASE_URL` | 백엔드 API 베이스 URL |
| `VITE_TOSS_CLIENT_KEY` | 토스페이먼츠 클라이언트 키 |
| `VITE_SITE_URL` | (선택) SEO용 사이트 URL, 미설정 시 기본값 사용 |
| `VITE_ALLOW_INDEXING` | (선택) `"true"`일 때만 검색엔진 인덱싱 허용 |

## 프로젝트 구조

```
├── index.html / src/main.jsx     # 앱 진입점
├── vite.config.js                # @ alias(→src), SEO 플러그인(robots.txt/sitemap.xml 생성), figma 에셋 리졸버
├── public/                       # 정적 자산
└── src/
    ├── app/
    │   ├── App.jsx                # Provider 조립: ThemeProvider → LocaleProvider → AuthProvider → RouterProvider
    │   ├── routes.jsx             # 전체 라우트 정의 (Layout 하위에 모든 페이지)
    │   ├── pages/                 # feature에 속하지 않는 최상위 페이지 (Home, Pricing, LegalPage)
    │   ├── features/              # 도메인 단위 모듈 (아래 참고)
    │   └── shared/                # 전역 공용 모듈 (아래 참고)
    ├── mocks/                     # 목업 데이터 (companyAnalysis, landing)
    └── styles/                    # 전역 스타일 (globals/theme/tailwind/fonts)
```

### `src/app/features/` — 기능(도메인) 모듈

각 feature는 대체로 `api/`(서버 통신), `components/`(UI 조각), `pages/`(라우트 화면), `lib/`(도메인 로직/훅), `index.js`(공개 export)로 구성되며, 외부에는 `index.js`를 통해서만 노출됩니다.

| feature | 역할 |
|---|---|
| `account/` | 마이페이지, 구독 관리, 결제 콜백, 요금제 정의 |
| `auth/` | 로그인/회원가입/비밀번호 재설정/OAuth 콜백, `AuthContext` |
| `community/` | 게시판 목록/상세/글쓰기 |
| `company-analysis/` | 기업 검색·상세 분석(재무 추이, 리스크, 사업부문, 주주현황, AI 추론 체인). `components/dart/`는 DART 전자공시 데이터 전용 패널 |
| `filings/` | 공시 검색/뷰어, 원문 문서 렌더링 |
| `paper-trading/` | 모의투자 앱. `stompClient.js`(실시간 시세), `aiEngine.js`(AI 리포트), `store/`(상태 관리) |

### `src/app/shared/` — 전역 공용 모듈

| 폴더 | 역할 |
|---|---|
| `api/` | axios 클라이언트 및 도메인별 API (auth, billing, subscription, token, user) |
| `components/` | `Layout`, `ThemeToggle`, `LocaleToggle`, `DarfinLogo` |
| `components/ui/` | shadcn/radix 기반 UI 프리미티브 (button, dialog, table, sidebar 등) |
| `i18n/` | 다국어 처리. `locales/en`, `locales/ko`에 도메인별 번역 분리 |
| `hooks/` | `usePageMeta`, `useJsonLd` (SEO 메타/구조화 데이터) |
| `lib/` | `tossBilling.js`, `siteUrl.js`, `uiRecipes.js`, `userText.js` |
| `utils/` | `dateUtils.js` |
| `types/` | 공용 타입/상수 정의 |

## 참고 문서

- `DESIGN.md`, `DESIGN_SYSTEM.md` — 디자인 시스템 가이드
- `default_shadcn_theme.css` — 테마 원본
