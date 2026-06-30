import { createBrowserRouter } from "react-router";
import { Layout } from "./shared/components/Layout";
import { Home } from "./pages/Home";
import { CompanyAnalysisSearch, CompanyAnalysis } from "./features/company-analysis";
import { DisclosureSearch, DisclosureViewer } from "./features/filings";
import { TradingRoot } from "./features/paper-trading";
import { CommunityList, CommunityDetail, CommunityWrite } from "./features/community";
import { MyPage, SubscriptionManagement, AllNotifications } from "./features/account";
import { Login, SignUp, ForgotId, ResetPassword, OAuthCallback } from "./features/auth";
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "company", Component: CompanyAnalysisSearch },
      { path: "company/:id", Component: CompanyAnalysis },
      { path: "disclosure", Component: DisclosureSearch },
      { path: "disclosure/:id", Component: DisclosureViewer },
      { path: "trading", Component: TradingRoot },
      { path: "community", Component: CommunityList },
      { path: "community/write", Component: CommunityWrite },
      { path: "community/:id", Component: CommunityDetail },
      { path: "mypage", Component: MyPage },
      { path: "subscription", Component: SubscriptionManagement },
      { path: "notifications", Component: AllNotifications },
      { path: "login", Component: Login },
      { path: "signup", Component: SignUp },
      { path: "forgot-id", Component: ForgotId },
      { path: "reset-password", Component: ResetPassword },
      { path: "oauth/callback", Component: OAuthCallback }
    ]
  }
]);
