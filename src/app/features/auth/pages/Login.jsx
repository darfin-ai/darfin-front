import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { login as apiLogin, getSocialLoginUrl } from "../../../shared/api/authApi";
import { authCardClassName, authInputClassName, authLabelClassName, authPrimaryButtonClassName } from "../authUi";
import { useLocale } from "../../../shared/i18n";
import { usePageMeta } from "../../../shared/hooks/usePageMeta";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLocale();

  usePageMeta({ title: t("nav.login"), noindex: true });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tokens = await apiLogin({ email, password });
      login(tokens);
      navigate("/");
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = getSocialLoginUrl(provider);
  };

  return (
    <div className="flex flex-1 items-center justify-center py-4 sm:py-6">
      <div className={`${authCardClassName} max-w-[400px]`}>
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <span className="text-[15px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t("nav.login")}
          </span>
        </div>

        <div className="px-6 pt-6 pb-5">
          <form onSubmit={handleLogin}>
            <div className="mb-3.5">
              <label className={authLabelClassName}>
                {t("auth.login.email")}
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@darfin.com"
                  className={authInputClassName}
                />
              </div>
            </div>

            <div className="mb-[18px]">
              <label className={authLabelClassName}>
                {t("auth.login.password")}
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={authInputClassName}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={authPrimaryButtonClassName}
            >
              {loading ? t("auth.login.submitting") : t("auth.login.submit")}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2.5 mt-3.5">
            <Link
              to="/forgot-id"
              className="text-xs text-slate-500 dark:text-slate-400 no-underline hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              {t("auth.login.forgotId")}
            </Link>
            <div className="w-px h-[11px] bg-slate-200 dark:bg-slate-700" />
            <Link
              to="/reset-password"
              className="text-xs text-slate-500 dark:text-slate-400 no-underline hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              {t("auth.login.resetPassword")}
            </Link>
            <div className="w-px h-[11px] bg-slate-200 dark:bg-slate-700" />
            <Link
              to="/signup"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 no-underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {t("auth.login.signup")}
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-5">
          <div className="flex items-center gap-2.5 mb-3.5">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
              {t("auth.login.socialDivider")}
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleSocialLogin("kakao")}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-lg text-[13px] font-semibold text-slate-900 bg-[#FEE500] hover:bg-[#FDD800] hover:border-[#E5C800] cursor-pointer transition-colors"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  d="M12 3C6.48 3 2 6.54 2 10.91c0 2.8 1.83 5.25 4.6 6.64-.23.83-.83 3.05-.86 3.19-.04.16.07.2.18.13.15-.09 3.45-2.3 4.88-3.32.39.04.79.06 1.2.06 5.52 0 10-3.54 10-7.91S17.52 3 12 3z"
                  fill="#000000"
                />
              </svg>
              {t("auth.login.kakao")}
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-lg text-[13px] font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 hover:border-indigo-200 dark:hover:border-slate-600 cursor-pointer transition-colors"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {t("auth.login.google")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
