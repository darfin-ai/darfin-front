import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useOutlet } from "react-router";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { BookOpen, BarChart2, TrendingUp, MessageSquare, UserCircle, LogOut, Menu, X, ChevronDown, CreditCard } from "lucide-react";
import { Toaster } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { useAuth } from "../../features/auth";
import { toast } from "sonner";
import { useLocale } from "../i18n";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleToggle } from "./LocaleToggle";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const outlet = useOutlet();
  const reduceMotion = useReducedMotion();
  const { isLoggedIn, logout } = useAuth();
  const { t } = useLocale();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Top-level section only (e.g. "company", "disclosure") — sub-navigation within the same
  // section (company/:id, disclosure/:id) shouldn't retrigger the transition, only switching
  // between visually-similar sections should, so users get a clear "you moved" cue.
  const routeKey = location.pathname.split("/")[1] || "home";

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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

  const isAuthPage = ["/login", "/signup", "/forgot-id", "/reset-password"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100">
      <Toaster position="top-center" />
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="container">
          <div className="flex items-center justify-between gap-3 h-16">
            <div className="flex items-center gap-4 lg:gap-6 min-w-0 flex-1">
              <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">Darfin</span>
              </Link>
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
              {isLoggedIn ? (
                navItems.map(({ to, icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    title={label}
                    className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 px-1.5 py-1 rounded-md whitespace-nowrap"
                  >
                    {icon}
                    <span className="hidden xl:inline">{label}</span>
                  </Link>
                ))
              ) : (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="group text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 data-[state=open]:text-blue-600 dark:data-[state=open]:text-blue-400 transition-colors flex items-center gap-1 px-1.5 py-1 rounded-md whitespace-nowrap outline-none">
                      {t("nav.features")}
                      <ChevronDown size={14} className="transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" sideOffset={10}>
                      {navItems.map(({ to, icon, label }) => (
                        <DropdownMenuItem key={to} asChild>
                          <Link
                            to={to}
                            onClick={(e) => handleServiceClick(e, to)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            {icon}
                            {label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Link
                    to="/pricing"
                    className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center px-1.5 py-1 rounded-md whitespace-nowrap"
                  >
                    {t("nav.pricing")}
                  </Link>
                </>
              )}
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />
              <LocaleToggle />
              <ThemeToggle />

              {isLoggedIn && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 data-[state=open]:text-blue-600 dark:data-[state=open]:text-blue-400 transition-colors flex items-center gap-1.5 p-1 rounded-md outline-none"
                    title={t("nav.mypage")}
                  >
                    <UserCircle size={20} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={10}>
                    <DropdownMenuItem asChild>
                      <Link to="/mypage" className="flex items-center gap-2 cursor-pointer">
                        <UserCircle size={16} />
                        {t("nav.mypage")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/subscription" className="flex items-center gap-2 cursor-pointer">
                        <CreditCard size={16} />
                        {t("nav.subscription")}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-2 lg:px-3 py-2 rounded-full transition-colors whitespace-nowrap"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm font-medium text-white bg-blue-600 px-3 lg:px-4 py-2 rounded-full hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    {t("nav.signup")}
                  </Link>
                </div>
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
                  {!isLoggedIn && (
                    <Link
                      to="/pricing"
                      className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <CreditCard size={16} />
                      {t("nav.pricing")}
                    </Link>
                  )}
                  {isLoggedIn && (
                    <>
                      <Link
                        to="/mypage"
                        className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <UserCircle size={18} />
                        {t("nav.mypage")}
                      </Link>
                      <Link
                        to="/subscription"
                        className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <CreditCard size={16} />
                        {t("nav.subscription")}
                      </Link>
                    </>
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
                    <div className="flex flex-col gap-2">
                      <Link
                        to="/signup"
                        className="block w-full text-center text-sm font-medium text-white bg-blue-600 px-4 py-2.5 rounded-full hover:bg-blue-700 transition-colors"
                      >
                        {t("nav.signup")}
                      </Link>
                      <Link
                        to="/login"
                        className="block w-full text-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-full transition-colors"
                      >
                        {t("nav.login")}
                      </Link>
                    </div>
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
            : location.pathname.startsWith("/trading") || location.pathname.startsWith("/company") || location.pathname.startsWith("/community") || location.pathname.startsWith("/disclosure") || location.pathname === "/pricing" || location.pathname === "/subscription" || location.pathname === "/mypage"
              ? "flex-1 w-full"
              : isAuthPage
                ? "flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col"
                : "flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        }
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={routeKey}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 mt-auto">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
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
