import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { registerCard } from "../../../shared/api/billingApi";
import { useLocale } from "../../../shared/i18n";
import { usePageMeta } from "../../../shared/hooks/usePageMeta";

export function BillingCallback() {
  const { t } = useLocale();

  usePageMeta({ noindex: true });
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const params = new URLSearchParams(window.location.search);
    const authKey = params.get("authKey");

    const cardName = sessionStorage.getItem("pendingCardName") || "";
    sessionStorage.removeItem("pendingCardName");

    if (!authKey) {
      setStatus("error");
      setTimeout(() => navigate("/mypage?tab=billing", { replace: true }), 1500);
      return;
    }

    registerCard(authKey, cardName)
      .then(() => {
        setStatus("done");
        navigate("/mypage?tab=billing", { replace: true });
      })
      .catch((err) => {
        setStatus("error");
        navigate("/mypage?tab=billing", { replace: true });
      });
  }, [navigate, t]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">
          {status === "error"
            ? `${t("billing.fail")} ${t("billing.processingRedirect")}`
            : t("billing.processing")}
        </p>
      </div>
    </div>
  );
}
