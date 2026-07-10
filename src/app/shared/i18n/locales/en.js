import { common } from "./en/common.js";
import { authRecovery } from "./en/authRecovery.js";
import { community } from "./en/community.js";
import { billing } from "./en/billing.js";
import { company } from "./en/company.js";
import { trading } from "./en/trading.js";
import { disclosure } from "./en/disclosure.js";
import { account } from "./en/account.js";
import { seo } from "./en/seo.js";
import { legal } from "./en/legal.js";

export const en = {
  seo,
  legal,
  nav: {
    company: "Companies",
    disclosure: "Filings",
    trading: "Trading",
    community: "Community",
    features: "Features",
    pricing: "Pricing",
    login: "Log in",
    signup: "Start for free",
    logout: "Log out",
    mypage: "My page",
    searchPlaceholder: "Search by company name or ticker (e.g. Samsung)",
    searchPlaceholderShort: "Search company or ticker",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    subscription: "Subscription",
  },
  footer: {
    terms: "Terms of service",
    privacy: "Privacy policy",
    api: "API documentation",
    copyright: "© 2026 darfin. All rights reserved.",
  },
  prefs: {
    themeLight: "Light mode",
    themeDark: "Dark mode",
    languageKo: "한국어",
    languageEn: "English",
  },
  auth: {
    signup: {
      title: "Create account",
      subtitle: "Start your investment journey with Darfin.",
      profileOptional: "Choose a photo",
      profilePhoto: "Profile photo",
      profileChange: "Choose a different photo",
      name: "Full name",
      nickname: "Nickname",
      phone: "Phone",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm password",
      namePlaceholder: "Jane Doe",
      nicknamePlaceholder: "Nickname",
      phonePlaceholder: "010-0000-0000",
      emailPlaceholder: "hello@darfin.com",
      passwordPlaceholder: "8+ characters",
      confirmPlaceholder: "Confirm password",
      passwordMismatch: "Passwords do not match.",
      submit: "Create account",
      submitting: "Creating account...",
      hasAccount: "Already have an account?",
      loginLink: "Log in",
      success: "Account created. Please log in.",
      fail: "Sign-up failed.",
      emailTaken: "This email is already in use.",
      imageTypeError: "Only image files can be uploaded.",
      imageSizeError: "Images must be 5MB or smaller.",
      profilePreviewAlt: "Profile preview",
    },
    login: {
      email: "Email",
      password: "Password",
      submit: "Log in with email",
      submitting: "Logging in...",
      fail: "Log in failed.",
      forgotId: "Find account",
      resetPassword: "Reset password",
      signup: "Sign up",
      socialDivider: "Or continue with",
      kakao: "Continue with Kakao",
      google: "Continue with Google",
    },
  },
  landing: {
    hero: {
      titleLine1: "For individual investors",
      titleLine2: "Filing & company analysis AI",
      subtitle:
        "Stop spending hours in hundred-page quarterly reports. We surface what changed—grounded in original DART filings, not summaries alone.",
      ctaSignup: "Start for free",
      ctaLogin: "Log in",
      ctaCompany: "Explore company analysis",
      ctaTrading: "Try paper trading",
      signupNote: "No credit card · Company, disclosure, and community features are free",
      trustedDataFrom: "Trusted data from",
      dartLogoAlt: "DART — Financial Supervisory Service electronic disclosure system",
      scrollToDemo: "Scroll to demo",
    },
    demo: {
      analyzing: "Analyzing",
      example: "AI analysis demo",
      tabBefore: "Source filing",
      tabAfter: "AI analysis",
      tapReplay: "Tap to replay the analysis",
      aiSummary: "AI summary.",
      source: "Source",
      rceptNo: "Filing no.",
      snapshot: {
        companyName: "Samsung Electronics",
        ticker: "005930",
        sourceLabel: "Samsung Electronics Q1 2026 report (DART)",
        rceptNo: "20260515002181",
        sectionLabel: "II. Business overview > 4. Revenue & orders",
        highlight: "₩133.87 trillion",
        sourceText:
          "a. Revenue performance In Q1 2026 (FY58), revenue was ₩133.87 trillion, up 69.2% YoY. " +
          "By segment, DX rose 1.8%, DS 225.2%, SDC 14.1%, and Harman 11.9%. " +
          "(1) Revenue by major product (2) Revenue by type (3) Revenue by region " +
          "b. Sales channels (1) Domestic (2) Overseas (3) Channel mix " +
          "c. Sales terms and conditions " +
          "d. Major customers In Q1 2026, key customers included Alphabet, Amazon, and Apple (alphabetical). " +
          "The top five customers accounted for roughly 23% of total revenue.",
        summaryPreview:
          "Q1 2026 revenue rose 69.2% YoY to ₩133.87 trillion. DS share jumped to 61%, and current assets and total assets improved materially...",
        hops: [
          { sectionLabel: "II. Products & services", excerpt: "DS segment 61%, memory price +146%" },
          { sectionLabel: "III. Consolidated balance sheet", excerpt: "Current assets +23.6%, total assets +11.7%" },
          { sectionLabel: "II. R&D activities", excerpt: "R&D expense ₩11.34 trillion" },
        ],
      },
    },
    credibility: {
      stats: [
        { label: "Companies covered", sub: "All KOSPI and KOSDAQ listings" },
        { label: "Disclosures analyzed", sub: "Full DART archive" },
        { label: "Method", value: "Source-text grounded", sub: "Insights cite original sentences, not summaries alone" },
      ],
      disclaimer:
        "We do not invent numbers. Every AI result cites sentences from real filings, and you can verify the source yourself.",
    },
    coverage: {
      eyebrow: "Data coverage",
      title: "Every KOSPI and KOSDAQ company",
    },
    walkthrough: {
      eyebrow: "How it works",
      title: "Analyze, practice, and validate together",
      subtitle: "One continuous research workflow.",
      items: [
        {
          eyebrow: "Company analysis",
          title: "Company research that flows on one screen",
          desc: "Business, performance, and quarterly changes in connected tabs—with AI highlights tied to source text.",
          bullets: [
            "Overview: business, shareholders, risk, and dividends at a glance",
            "Financials: revenue, profit, and cash flow charts",
            "AI analysis: business shifts, risks, and key takeaways",
          ],
          cta: "Explore company analysis",
        },
        {
          eyebrow: "Paper trading",
          title: "Practice first—no real money",
          desc: "Paper trade on live market data to test ideas before committing capital.",
          bullets: [
            "Live prices · No real money at risk",
            "See P&L immediately after fills",
            "Validate strategies before going live",
          ],
          cta: "Try paper trading",
        },
        {
          eyebrow: "Community",
          title: "Discuss with others watching the same names",
          desc: "Ask and answer questions alongside disclosure analysis. Join early while the community is still forming.",
          bullets: [
            "Ticker-scoped Q&A that compounds over time",
            "Discussions grounded in filings and analysis",
            "Be an early member helping shape the community",
          ],
          cta: "Browse community",
        },
      ],
    },
    mockups: {
      companyChrome: "Samsung Electronics · 005930 · Analysis",
      companySector: "Semiconductors & electronics",
      aiScore: "AI composite score",
      tabOverview: "Overview",
      tabFinancials: "Financials",
      tabAiAnalysis: "AI Analysis",
      companyOverview: {
        basisYear: "2026",
        basisReportCode: "11013",
        metrics: {
          majorHolderStake: "19.7%",
          minorityStake: "66.0%",
          floatRatio: "98.4%",
          dividendYield: "0.2%",
          employees: "257,762",
          auditOpinion: "Unqualified",
        },
        barSegments: [
          { key: "major", pct: 19.7 },
          { key: "minority", pct: 66.0 },
          { key: "others", pct: 14.3 },
        ],
        shareholders: [
          { name: "Samsung Life Insurance", relation: "Largest shareholder", begin: "8.51%", end: "8.41%", delta: "-0.10%p", deltaDown: true },
          { name: "Hong Ra-hee", relation: "Affiliate executive", begin: "2.30%", end: "2.30%" },
          { name: "Lee Jae-yong", relation: "Affiliate executive", begin: "1.73%", end: "1.73%" },
        ],
      },
      aiSummaryText:
        "DS revenue share jumped to 61%—HBM demand lifted operating margin from 8.45% to 42.75%.",
      tradingChrome: "Paper trading · Samsung Electronics",
      paperTrading: "Paper trading · Not real money",
      demoCompanyName: "Samsung Electronics",
      currencyUnit: "KRW",
      chartPeriods: ["D", "W", "M", "Y"],
      buy: "Buy",
      sell: "Sell",
      pnl: "Unrealized P&L",
      orderFilled: "Bought 10 shares",
      communityChrome: "Community · Samsung Electronics",
      communityThread: {
        company: "Samsung Electronics",
        ticker: "005930",
        resolvedLabel: "Resolved",
        awaitingLabel: "Awaiting reply",
        answersLabel: "Answers",
        title: "Will HBM revenue share hold next quarter?",
        adopted: "Accepted answer",
        placeholder: "Share your take...",
        submit: "Post",
        messages: [
          {
            author: "Analyst",
            initial: "A",
            time: "2h ago",
            body: "DS was 61% of revenue in the filing—if HBM pricing keeps climbing, that share could grow. Curious how others read it.",
          },
          {
            author: "ChipNerd",
            initial: "C",
            time: "1h ago",
            body: "HBM3E volume is ramping and margins moved up with it. Guidance for next quarter looks supportive, so I'd lean yes.",
            adopted: true,
          },
          {
            author: "ValueHunter",
            initial: "V",
            time: "35m ago",
            body: "Agree, though memory cycle volatility is still worth watching.",
            isReply: true,
          },
          {
            author: "FilingFan",
            initial: "F",
            time: "12m ago",
            body: "AI analysis flagged new HBM capex plans—worth a look alongside the margin story.",
          },
        ],
      },
    },
    disclosures: {
      eyebrow: "Timely disclosures",
      title: "Today's new filings",
      subtitle: "Browse the latest event-driven disclosures by company.",
      viewAll: "View all",
      feedLabel: "Today's key disclosures",
      items: [
        { company: "Samsung Electronics", code: "005930", type: "Quarterly report", title: "Q1 2026 quarterly report (operating profit ₩7.8T)", time: "09:12" },
        { company: "Ecopro BM", code: "247540", type: "Material event", title: "Acquisition of shares/securities (₩240B Hungary investment)", time: "09:31" },
        { company: "Kakao Pay", code: "377300", type: "Material event", title: "Convertible bond issuance (₩50B, dilution risk)", time: "10:05" },
        { company: "HD Hyundai Heavy", code: "329180", type: "Timely disclosure", title: "Large LNG carrier order — ₩2.3T contract value", time: "10:48" },
        { company: "Celltrion", code: "068270", type: "Material event", title: "Treasury stock purchase decision (₩120B buyback)", time: "11:22" },
        { company: "Hanwha Aerospace", code: "012450", type: "Timely disclosure", title: "Defense export contract — ₩420B Poland deal", time: "13:05" },
      ],
    },
    lenses: {
      eyebrow: "How AI reads a company",
      title: "Four lenses, one detail page",
      subtitle: "On each company page, split financial, management, risk, and governance changes—with source text for every insight.",
      cta: "Explore company analysis",
      items: [
        {
          scoreComponent: "financialChange",
          label: "Financial change",
          summary: "Revenue, profit, assets, and segment mix shifts",
        },
        {
          scoreComponent: "managementEmphasis",
          label: "Management focus",
          summary: "R&D, strategy, and what leadership highlights",
        },
        {
          scoreComponent: "riskEscalation",
          label: "Risk change",
          summary: "FX, equity, and derivatives exposure updates",
        },
        {
          scoreComponent: "governance",
          label: "Governance",
          summary: "Shareholder structure and voting-right changes",
        },
      ],
    },
    pricing: {
      text: "Start free. Upgrade to Pro when you need more.",
      link: "View pricing →",
    },
    finalCta: {
      title: "Get started",
      subtitle: "From company analysis to paper trading—sign up free and explore now.",
      signup: "Create free account",
      company: "Explore company analysis",
      trading: "Try paper trading first",
    },
  },
  pricingPage: {
    eyebrow: "Pricing",
    title: "Choose the plan that fits your research",
    subtitle: "Start free and upgrade anytime when you need deeper analysis.",
    recommended: "Popular",
    free: "Free",
    perMonth: "/mo",
    startFree: "Start for free",
    getStarted: "Get started",
    manageSubscription: "Manage subscription",
    faqTitle: "Billing notes",
    faq1: "Paid plans renew monthly on your saved payment method.",
    faq2: "Plan changes take effect immediately; price differences are prorated.",
    faq3: "If you cancel, you keep access until the end of the billing period.",
    alreadyMember: "Already have an account?",
    plans: {
      BASIC: {
        description: "Individual investors who need light company analysis",
        features: [
          "10,000 tokens reset daily at 6:00 AM",
          "Disclosure summaries and analysis",
          "Company analysis access",
          "Investment report generation",
        ],
      },
      PRO: {
        description: "Investors who need professional deep-dive analysis",
        features: [
          "30,000 tokens reset daily at 6:00 AM and 6:00 PM",
          "Disclosure summaries and analysis",
          "Company analysis access",
          "Investment report generation",
        ],
      },
      ENTERPRISE: {
        description: "Institutions and teams making data-driven decisions",
        features: [
          "50,000 tokens reset daily at 6:00 AM and 6:00 PM",
          "Disclosure summaries and analysis",
          "Company analysis access",
          "Investment report generation",
        ],
      },
    },
  },
  common,
  authRecovery,
  community,
  billing,
  company,
  disclosure,
  account,
  trading,
};
