import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router";
import { Search, BookOpen, BarChart2, TrendingUp, MessageSquare, UserCircle, Bell, MessageCircle, AlertCircle, LogOut } from "lucide-react";
import { Toaster } from "sonner";
import { useAuth } from "../../features/auth";
import { toast } from "sonner";
const mockNotifications = [
  { id: 1, type: "community", message: "\uC791\uC131\uD558\uC2E0 \uC9C8\uBB38\uC5D0 \uC0C8\uB85C\uC6B4 \uB2F5\uBCC0\uC774 \uB2EC\uB838\uC2B5\uB2C8\uB2E4.", time: "10\uBD84 \uC804", isRead: false },
  { id: 2, type: "system", message: "\uC11C\uBC84 \uC810\uAC80 \uC548\uB0B4 (06/15 02:00 ~ 04:00)", time: "1\uC77C \uC804", isRead: true },
  { id: 3, type: "system", message: "Darfin Pro \uC815\uAE30 \uACB0\uC81C\uAC00 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.", time: "2\uC77C \uC804", isRead: true }
];
const PROTECTED_PATHS = ["/company", "/disclosure", "/community"];
export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("query");
    if (query) {
      navigate(`/company/${encodeURIComponent(query)}`);
    }
  };
  const handleServiceClick = (e, path) => {
    if (!isLoggedIn && path !== '/trading') {
      e.preventDefault();
      toast.error("\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD55C \uC11C\uBE44\uC2A4\uC785\uB2C8\uB2E4.");
      navigate("/login");
    }
  };
  const handleLogout = () => {
    logout();
    toast.success("\uB85C\uADF8\uC544\uC6C3\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
    navigate("/");
  };
  return <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Toaster position="top-center" />
      {
    /* Top Navigation */
  }
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              {
    /* Logo */
  }
              <Link to="/" className="flex items-center gap-2 group">
                <span className="text-2xl font-bold text-slate-900">
                  Darfin
                </span>
              </Link>

              {
    /* Search Bar */
  }
              {!(location.pathname === "/" || location.pathname === "/company" || location.pathname === "/disclosure") && <div className="hidden md:block">
                  <form onSubmit={handleSearch} className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
    type="text"
    name="query"
    className="block w-96 pl-10 pr-3 py-2 border border-slate-200 rounded-full text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 transition-shadow"
    placeholder="기업명 또는 종목코드 검색 (예: 삼성전자)"
  />
                  </form>
                </div>}
            </div>

          {
    /* Navigation Links */
  }
          <nav className="flex items-center gap-6">
            {[
    { to: "/company", icon: <BarChart2 size={16} />, label: "\uAE30\uC5C5 \uBD84\uC11D" },
    { to: "/disclosure", icon: <BookOpen size={16} />, label: "\uACF5\uC2DC \uC5F4\uB78C" },
    { to: "/trading", icon: <TrendingUp size={16} />, label: "\uBAA8\uC758\uD22C\uC790" },
    { to: "/community", icon: <MessageSquare size={16} />, label: "\uCEE4\uBBA4\uB2C8\uD2F0" }
  ].map(({ to, icon, label }) => <Link
    key={to}
    to={to}
    onClick={(e) => handleServiceClick(e, to)}
    className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5"
  >
                {icon}
                {label}
              </Link>)}
              <div className="h-6 w-px bg-slate-200" />

              {
    /* Notification Bell */
  }
              {isLoggedIn && <div className="relative" ref={notificationRef}>
                <button
    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
    className="relative text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5 p-1"
    title="알림"
  >
                  <Bell size={20} />
                  {mockNotifications.some((n) => !n.isRead) && <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white" />}
                </button>

                {isNotificationOpen && <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h3 className="font-bold text-slate-900">알림</h3>
                      <button className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors">
                        모두 읽음 처리
                      </button>
                    </div>
                    <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                      {mockNotifications.map((notif) => <div
    key={notif.id}
    className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer ${!notif.isRead ? "bg-blue-50/30" : ""}`}
  >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === "community" ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"}`}>
                            {notif.type === "community" ? <MessageCircle size={16} /> : <AlertCircle size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-snug mb-1 ${!notif.isRead ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>
                              {notif.message}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">{notif.time}</p>
                          </div>
                          {!notif.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 flex-shrink-0" />}
                        </div>)}
                    </div>
                    <div
    className="p-3 text-center border-t border-slate-100 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors flex items-center justify-center gap-1"
    onClick={() => {
      setIsNotificationOpen(false);
      navigate("/notifications");
    }}
  >
                      <span className="text-xs font-semibold text-slate-600">모든 알림 보기</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><polyline points="9 18 15 12 9 6" /></svg>
                    </div>
                  </div>}
              </div>}

              {isLoggedIn && <Link to="/mypage" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5 p-1" title="마이페이지">
                  <UserCircle size={20} />
                </Link>}
              {isLoggedIn ? <button
    onClick={handleLogout}
    className="text-sm font-medium text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 px-4 py-2 rounded-full transition-colors ml-2 flex items-center gap-1.5"
  >
                  <LogOut size={15} />
                  로그아웃
                </button> : <Link to="/login" className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-full hover:bg-blue-700 transition-colors ml-2">
                  로그인
                </Link>}
            </nav>
          </div>
        </div>
      </header>

      {
    /* Main Content Area */
  }
      <main className={
        location.pathname === "/"
          ? "flex-1 w-full overflow-hidden"
          : location.pathname.startsWith("/trading") || location.pathname.startsWith("/company")
            ? "flex-1 w-full"
            : "flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      }>
        <Outlet />
      </main>

      {
    /* Footer */
  }
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2026 darfin. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-900">이용약관</a>
            <a href="#" className="hover:text-slate-900">개인정보처리방침</a>
            <a href="#" className="hover:text-slate-900">API 연동 안내</a>
          </div>
        </div>
      </footer>
    </div>;
}
