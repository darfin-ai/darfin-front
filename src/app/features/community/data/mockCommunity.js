export const STOCKS = [
  { id: "005930", name: "\uC0BC\uC131\uC804\uC790" },
  { id: "000660", name: "SK\uD558\uC774\uB2C9\uC2A4" },
  { id: "035420", name: "NAVER" },
  { id: "035720", name: "\uCE74\uCE74\uC624" }
];
export const mockQuestions = [
  {
    id: 1,
    stockName: "\uC0BC\uC131\uC804\uC790",
    title: "\uC0BC\uC131\uC804\uC790 \uD558\uBC18\uAE30 \uC804\uB9DD \uC5B4\uB5BB\uAC8C \uBCF4\uC2DC\uB098\uC694?",
    content: "\uC694\uC998 \uC678\uAD6D\uC778 \uB9E4\uB3C4\uC138\uAC00 \uAC15\uD55C\uB370 8\uB9CC\uC804\uC790 \uB2E4\uC2DC \uAC08 \uC218 \uC788\uC744\uAE4C\uC694? \uACE0\uC218\uB2D8\uB4E4\uC758 \uC758\uACAC\uC774 \uAD81\uAE08\uD569\uB2C8\uB2E4.",
    author: "\uC8FC\uB9B0\uC774",
    createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 2).toISOString(),
    isResolved: true,
    views: 152
  },
  {
    id: 2,
    stockName: "NAVER",
    title: "\uB124\uC774\uBC84 vs \uCE74\uCE74\uC624",
    content: "IT\uC8FC \uB2F4\uC73C\uB824\uACE0 \uD558\uB294\uB370 \uC9C0\uAE08 \uC2DC\uC810\uC5D0\uC11C\uB294 \uB124\uC774\uBC84\uAC00 \uB098\uC744\uAE4C\uC694 \uCE74\uCE74\uC624\uAC00 \uB098\uC744\uAE4C\uC694? \uC7A5\uB2E8\uC810 \uBE44\uAD50 \uBD80\uD0C1\uB4DC\uB9BD\uB2C8\uB2E4.",
    author: "IT\uB9C8\uC2A4\uD130",
    createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 24).toISOString(),
    isResolved: false,
    views: 89
  },
  {
    id: 3,
    stockName: "SK\uD558\uC774\uB2C9\uC2A4",
    title: "HBM \uAD00\uB828\uD574\uC11C \uD558\uC774\uB2C9\uC2A4 \uCD94\uAC00 \uB9E4\uC218 \uD0C0\uC810 \uC9C8\uBB38\uC774\uC694",
    content: "\uBE44\uC911 20% \uC815\uB3C4 \uB4E4\uACE0 \uC788\uB294\uB370, HBM \uD638\uC7AC \uACC4\uC18D \uB098\uC624\uB2C8 \uB354 \uB2F4\uACE0 \uC2F6\uB124\uC694. \uC5B4\uB290 \uC815\uB3C4 \uAC00\uACA9\uB300\uC5D0\uC11C \uCD94\uAC00 \uB9E4\uC218\uD558\uBA74 \uC88B\uC744\uAE4C\uC694?",
    author: "\uBC18\uB3C4\uCCB4\uB7EC\uBC84",
    createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 48).toISOString(),
    isResolved: false,
    views: 210
  }
];
export const mockAnswers = [
  {
    id: 1,
    questionId: 1,
    author: "\uAC00\uCE58\uD22C\uC790\uC790",
    content: "\uBC18\uB3C4\uCCB4 \uC0AC\uC774\uD074\uC0C1 \uD558\uBC18\uAE30\uC5D0\uB294 \uBC18\uB4F1\uD560 \uAC83\uC73C\uB85C \uC608\uC0C1\uB429\uB2C8\uB2E4. \uAE38\uAC8C \uBCF4\uC2DC\uACE0 \uBD84\uD560 \uB9E4\uC218 \uCD94\uCC9C\uB4DC\uB9BD\uB2C8\uB2E4.",
    createdAt: new Date(Date.now() - 1e3 * 60 * 50).toISOString(),
    isAccepted: true
  },
  {
    id: 2,
    questionId: 1,
    author: "\uB2E8\uD0C0\uC7A5\uC778",
    content: "\uC9C0\uAE08\uC740 \uAD00\uB9DD\uD558\uC2DC\uB294\uAC8C \uC88B\uC544\uBCF4\uC785\uB2C8\uB2E4. \uC9C0\uC9C0\uC120 \uBB34\uB108\uC84C\uC5B4\uC694.",
    createdAt: new Date(Date.now() - 1e3 * 60 * 30).toISOString(),
    isAccepted: false
  },
  {
    id: 3,
    questionId: 2,
    author: "\uD50C\uB7AB\uD3FC\uC804\uBB38\uAC00",
    content: "AI \uBE44\uC988\uB2C8\uC2A4 \uBAA8\uB378 \uAD6C\uCCB4\uD654 \uC18D\uB3C4\uB97C \uBCF4\uBA74 \uD604\uC7AC\uB294 \uB124\uC774\uBC84\uAC00 \uC870\uAE08 \uB354 \uC548\uC815\uC801\uC774\uB77C\uACE0 \uC0DD\uAC01\uD569\uB2C8\uB2E4.",
    createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 12).toISOString(),
    isAccepted: false
  }
];
