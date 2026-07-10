import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { resetPassword } from "../../../shared/api/authApi";
import { useLocale } from "../../../shared/i18n";
import { usePageMeta } from "../../../shared/hooks/usePageMeta";

export function ResetPassword() {
  const { t } = useLocale();

  usePageMeta({ title: t("authRecovery.resetPassword.title"), noindex: true });

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword({ email });
      setSent(true);
    } catch (err) {
      const msg =
        err?.status === 404
          ? t("authRecovery.resetPassword.notFound")
          : err?.message || t("authRecovery.resetPassword.fail");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative">
        <Link to="/login" className="absolute left-6 top-6 p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>

        <div className="text-center mb-8 mt-2">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{t("authRecovery.resetPassword.title")}</h1>
          <p className="text-sm text-slate-500">{t("authRecovery.resetPassword.subtitle")}</p>
        </div>

        {!sent ? (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 block">{t("authRecovery.resetPassword.email")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50"
                  placeholder={t("authRecovery.resetPassword.emailPlaceholder")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 mt-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t("authRecovery.resetPassword.submitting") : t("authRecovery.resetPassword.submit")}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-green-600" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">{t("authRecovery.resetPassword.sentTitle")}</p>
              <p className="text-sm text-slate-500">
                {t("authRecovery.resetPassword.sentBody")}{" "}
                <span className="font-medium text-slate-700">{email}</span>
                <br />
                {t("authRecovery.resetPassword.sentNote")}
              </p>
            </div>
            <Link
              to="/login"
              className="inline-block mt-4 w-full py-2.5 text-center bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {t("authRecovery.resetPassword.login")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
