import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { registerCard } from "../../../shared/api/billingApi";

// 토스 카드 등록(빌링키 발급) 완료 후 돌아오는 콜백 페이지.
// 성공 시 쿼리스트링에 authKey/customerKey가, 실패 시 code/message가 담겨 온다.
export function BillingCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing"); // processing | done | error
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const params = new URLSearchParams(window.location.search);
    const authKey = params.get("authKey");
    const errorMessage = params.get("message");

    if (!authKey) {
      setStatus("error");
      toast.error(errorMessage ? decodeURIComponent(errorMessage) : "카드 등록이 취소되었습니다.");
      setTimeout(() => navigate("/mypage?tab=billing", { replace: true }), 1500);
      return;
    }

    registerCard(authKey)
      .then(() => {
        setStatus("done");
        toast.success("카드가 등록되었습니다.");
        navigate("/mypage?tab=billing", { replace: true });
      })
      .catch((err) => {
        setStatus("error");
        toast.error(err?.message || "카드 등록에 실패했습니다.");
        navigate("/mypage?tab=billing", { replace: true });
      });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">
          {status === "error" ? "처리에 실패했습니다. 이동 중..." : "카드 등록을 처리하는 중입니다..."}
        </p>
      </div>
    </div>
  );
}
