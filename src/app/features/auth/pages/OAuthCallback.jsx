import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../../../shared/i18n";
import { usePageMeta } from "../../../shared/hooks/usePageMeta";

export function OAuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLocale();

  usePageMeta({ noindex: true });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const error = params.get("error");

    if (accessToken && refreshToken) {
      login({ accessToken, refreshToken });
      navigate("/", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [login, navigate, t]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">{t("authRecovery.oauth.processing")}</p>
      </div>
    </div>
  );
}
