export const en = {
  nav: {
    company: "Companies",
    disclosure: "Filings",
    trading: "Trading",
    community: "Community",
    login: "Log in",
    logout: "Log out",
    mypage: "My page",
    searchPlaceholder: "Search by company name or ticker (e.g. Samsung)",
    searchPlaceholderShort: "Search company or ticker",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    loginRequired: "Please log in to use this feature.",
    logoutSuccess: "You have been logged out.",
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
  },
  landing: {
    hero: {
      tagline: "AI disclosure analysis · Paper trading · Investor community",
      titleLine1: "DART filings, unchanged.",
      titleLine2: "AI reads them for you.",
      subtitle:
        "Grounded in original disclosure text—not summaries—we surface what changed across 3,200+ KOSPI and KOSDAQ listings.",
      ctaSignup: "Start for free",
      ctaLogin: "Log in",
      ctaCompany: "Explore company analysis",
      ctaTrading: "Try paper trading",
      signupNote: "No credit card · Company, disclosure, and community features are free",
      trustDart: "Official DART data (FSS)",
      trustCompanies: "3,200+ listed companies",
      trustSource: "Every insight links to source text",
      previewFeatures: "Preview features",
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
          title: "Search a filing—AI reads it first",
          desc: "Search any company and AI reads quarterly filings end to end, highlighting what changed from period to period.",
          bullets: [
            "Financials, governance, risk, and management commentary in one view",
            "Automatic quarter-over-quarter comparison",
            "Every insight links back to source text",
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
      tabChanges: "Filing changes",
      aiSummaryText:
        "DS revenue share jumped to 61%—HBM demand lifted operating margin from 8.45% to 42.75%.",
      tradingChrome: "Paper trading · Samsung Electronics",
      paperTrading: "Paper trading · Not real money",
      buy: "Buy",
      sell: "Sell",
      pnl: "Unrealized P&L",
      communityChrome: "Community · Q&A",
      replyCount: "Replies",
      awaitingReply: "Awaiting reply",
      communityPosts: [
        { q: "Will HBM revenue share hold next quarter?" },
        { q: "How does the CB issuance affect existing shareholders?" },
        { q: "When will the LNG order book hit reported earnings?" },
      ],
    },
    disclosures: {
      eyebrow: "Live disclosure feed",
      title: "Today's key filings",
      subtitle: "See today's most important AI-analyzed disclosures first.",
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
      eyebrow: "One filing, four lenses",
      title: "This much signal from a single report",
      subtitlePrefix: "From the same",
      subtitleSuffix:
        "report shown above, AI surfaces financial, management, risk, and governance changes together.",
      impactHigh: "High impact",
      impactMedium: "Medium impact",
      items: [
        {
          scoreComponent: "financialChange",
          label: "Financial change",
          summary:
            "Q1 2026 revenue rose 69.2% YoY to ₩133.87T. Current assets and total assets improved materially. Segment mix, pricing, input costs, and capex all shifted.",
        },
        {
          scoreComponent: "managementEmphasis",
          label: "Management emphasis",
          summary:
            "R&D spend reached ₩11.3T in Q1 2026. Patent portfolio at 288,770 filings globally; TV/mobile strategy and product lineup updated.",
        },
        {
          scoreComponent: "riskEscalation",
          label: "Risk change",
          summary:
            "OCI and net income sensitivity to equity price risk changed as of Q1 2026 end. FX forward contract count fell to 3,308.",
        },
        {
          scoreComponent: "governance",
          label: "Governance",
          summary:
            "Major shareholder and affiliate common-share ratios edged lower. Shares outstanding unchanged; voting shares eligible shifted.",
        },
      ],
    },
    pricing: {
      text: "Start free. Upgrade to Pro when you need more.",
      link: "View pricing →",
    },
    finalCta: {
      title: "Get started",
      subtitle: "From DART-grounded AI analysis to paper trading—sign up free and explore now.",
      signup: "Create free account",
      company: "Explore company analysis",
      trading: "Try paper trading first",
    },
  },
};
