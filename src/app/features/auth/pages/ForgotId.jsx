import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { User, Phone, ArrowLeft, Mail } from "lucide-react";
import { findId } from "../../../shared/api/authApi";
import { useLocale } from "../../../shared/i18n";

export function ForgotId() {
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFindId = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await findId({ name, phone });
      setResults(data);
    } catch (err) {
      const msg =
        err?.status === 404
          ? t("authRecovery.forgotId.notFound")
          : err?.message || t("authRecovery.forgotId.fail");
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
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{t("authRecovery.forgotId.title")}</h1>
          <p className="text-sm text-slate-500">{t("authRecovery.forgotId.subtitle")}</p>
        </div>

        {!results ? (
          <form onSubmit={handleFindId} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 block">{t("authRecovery.forgotId.name")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50"
                  placeholder={t("auth.signup.namePlaceholder")}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 block">{t("authRecovery.forgotId.phone")}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50"
                  placeholder={t("auth.signup.phonePlaceholder")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 mt-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t("authRecovery.forgotId.submitting") : t("authRecovery.forgotId.submit")}
            </button>
          </form>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            <p className="text-sm text-slate-600 text-center mb-4">
              {t("authRecovery.forgotId.resultFound", { name })}
            </p>
            <div className="space-y-3">
              {results.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.email}</p>
                    <p className="text-xs text-slate-500">
                      {t("authRecovery.forgotId.accountType", {
                        provider: t(`common.provider.${item.provider}`) || item.provider,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setResults(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {t("authRecovery.forgotId.tryAgain")}
              </button>
              <Link
                to="/login"
                className="flex-1 py-2.5 text-center bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {t("authRecovery.forgotId.login")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
