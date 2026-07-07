import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Search, BookOpen, BarChart2, TrendingUp, MessageSquare, UserCircle, LogOut, Menu, X } from "lucide-react";
import { Toaster } from "sonner";
import { useAuth } from "../../features/auth";
import { toast } from "sonner";
import { useLocale } from "../i18n";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleToggle } from "./LocaleToggle";

const PROTECTED_PATHS = ["/company", "/disclosure", "/community"];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, logout } = useAuth();
  const { t } = useLocale();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("query");
    if (query) {
      navigate(`/company/${encodeURIComponent(query)}`);
    }
  };

  const handleServiceClick = (e, path) => {
    if (!isLoggedIn && path !== "/trading") {
      e.preventDefault();
      toast.error(t("nav.loginRequired"));
      navigate("/login");
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success(t("nav.logoutSuccess"));
    navigate("/");
  };

  const navItems = [
    { to: "/company", icon: <BarChart2 size={16} />, label: t("nav.company") },
    { to: "/disclosure", icon: <BookOpen size={16} />, label: t("nav.disclosure") },
    { to: "/trading", icon: <TrendingUp size={16} />, label: t("nav.trading") },
    { to: "/community", icon: <MessageSquare size={16} />, label: t("nav.community") },
  ];

  const hideHeaderSearch =
    location.pathname === "/" ||
    location.pathname.startsWith("/company") ||
    location.pathname === "/disclosure" ||
    location.pathname.startsWith("/trading") ||
    location.pathname.startsWith("/community");

  const isAuthPage = ["/login", "/signup", "/forgot-id", "/reset-password"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100">
      <Toaster position="top-center" />
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 h-16">
            <div className="flex items-center gap-4 lg:gap-6 min-w-0 flex-1">
              <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">Darfin</span>
              </Link>

              {!hideHeaderSearch && (
                <div className="hidden md:block min-w-0 flex-1 max-w-sm lg:max-w-md">
                  <form onSubmit={handleSearch} className="relative">
                    <label htmlFor="header-company-search" className="sr-only">
                      {t("nav.searchPlaceholderShort")}
                    </label>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    </div>
                    <input
                      id="header-company-search"
                      type="text"
                      name="query"
                      className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-full text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 dark:text-slate-100 transition-shadow"
                      placeholder={t("nav.searchPlaceholderShort")}
                    />
                  </form>
                </div>
              )}
            </div>

            <div className="flex md:hidden items-center gap-1 flex-shrink-0">
              <LocaleToggle />
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label={isMobileMenuOpen ? t("nav.menuClose") : t("nav.menuOpen")}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2.5 shrink-0">
              {navItems.map(({ to, icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={(e) => handleServiceClick(e, to)}
                  title={label}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 px-1.5 py-1 rounded-md whitespace-nowrap"
                >
                  {icon}
                  <span className="hidden xl:inline">{label}</span>
                </Link>
              ))}
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />
              <LocaleToggle />
              <ThemeToggle />

              {isLoggedIn && (
                <Link
                  to="/mypage"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 p-1"
                  title={t("nav.mypage")}
                >
                  <UserCircle size={20} />
                </Link>
              )}
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900 px-2.5 lg:px-4 py-2 rounded-full transition-colors flex items-center gap-1.5"
                  title={t("nav.logout")}
                >
                  <LogOut size={15} />
                  <span className="hidden lg:inline">{t("nav.logout")}</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-sm font-medium text-white bg-blue-600 px-3 lg:px-4 py-2 rounded-full hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  {t("nav.login")}
                </Link>
              )}
            </nav>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden absolute left-0 right-0 top-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar"
            >
              <div className="px-4 py-4 space-y-4">
                <form onSubmit={handleSearch} className="relative">
                  <label htmlFor="mobile-company-search" className="sr-only">
                    {t("nav.searchPlaceholderShort")}
                  </label>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  </div>
                  <input
                    id="mobile-company-search"
                    type="text"
                    name="query"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-full text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 dark:text-slate-100"
                    placeholder={t("nav.searchPlaceholderShort")}
                  />
                </form>

                <nav className="flex flex-col gap-1">
                  {navItems.map(({ to, icon, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={(e) => handleServiceClick(e, to)}
                      className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {icon}
                      {label}
                    </Link>
                  ))}
                  {isLoggedIn && (
                    <Link
                      to="/mypage"
                      className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <UserCircle size={18} />
                      {t("nav.mypage")}
                    </Link>
                  )}
                </nav>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  {isLoggedIn ? (
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900 px-4 py-2.5 rounded-full transition-colors"
                    >
                      <LogOut size={15} />
                      {t("nav.logout")}
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="block w-full text-center text-sm font-medium text-white bg-blue-600 px-4 py-2.5 rounded-full hover:bg-blue-700 transition-colors"
                    >
                      {t("nav.login")}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main
        className={
          location.pathname === "/"
            ? "flex-1 w-full overflow-hidden"
            : location.pathname.startsWith("/trading") || location.pathname.startsWith("/company")
              ? "flex-1 w-full"
              : isAuthPage
                ? "flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col"
                : "flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        }
      >
        <Outlet />
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <p>{t("footer.copyright")}</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-900 dark:hover:text-slate-100">
              {t("footer.terms")}
            </a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-slate-100">
              {t("footer.privacy")}
            </a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-slate-100">
              {t("footer.api")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
