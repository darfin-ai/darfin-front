import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  CreditCard,
  Zap,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Check,
  Info,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../auth/context/AuthContext";
import {
  getPlans,
  getMySubscription,
  changePlan,
  cancelSubscription,
  resumeSubscription,
} from "../../../shared/api/subscriptionApi";
import { getPaymentMethods } from "../../../shared/api/billingApi";
import { startCardRegistration } from "../../../shared/lib/tossBilling";

const PLAN_LABELS = {
  BASIC: "Darfin Basic",
  PRO: "Darfin Pro",
  ENTERPRISE: "Darfin Enterprise",
};

const PLAN_DESCRIPTIONS = {
  BASIC: "가벼운 기업 분석이 필요한 개인 투자자",
  PRO: "전문적인 딥다이브 분석이 필요한 투자자",
  ENTERPRISE: "데이터 기반의 의사결정이 필요한 기관/법인",
};

const PLAN_FEATURES = {
  BASIC: ["매일 오전 6시 토큰 10,000개 초기화", "공시 요약/분석 열람", "기업분석 열람", "투자분석 리포트 생성"],
  PRO: ["매일 오전 6시·오후 6시 토큰 30,000개 초기화", "공시 요약/분석 열람", "기업분석 열람", "투자분석 리포트 생성"],
  ENTERPRISE: ["매일 오전 6시·오후 6시 토큰 50,000개 초기화", "공시 요약/분석 열람", "기업분석 열람", "투자분석 리포트 생성"],
};

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
}

export function SubscriptionManagement() {
  const { user } = useAuth();

  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [cardRegistering, setCardRegistering] = useState(false);

  const loadAll = () => {
    setLoading(true);
    Promise.allSettled([getPlans(), getMySubscription(), getPaymentMethods()]).then(
      ([plansRes, subRes, methodsRes]) => {
        if (plansRes.status === "fulfilled") setPlans(plansRes.value);
        if (subRes.status === "fulfilled") {
          setSubscription(subRes.value);
          setSelectedPlanId((prev) => prev || subRes.value.planName);
        }
        if (methodsRes.status === "fulfilled") setPaymentMethods(methodsRes.value);
      },
    ).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAddCard = async () => {
    setCardRegistering(true);
    try {
      await startCardRegistration({
        userId: user?.userId,
        customerEmail: user?.email,
        customerName: user?.nickname,
      });
    } catch (err) {
      toast.error(err?.message || "카드 등록을 시작할 수 없습니다.");
      setCardRegistering(false);
    }
  };

  const handlePlanChange = async () => {
    if (!selectedPlanId || selectedPlanId === subscription?.planName) return;

    if (selectedPlanId === "BASIC") {
      await handleCancelSubscription();
      return;
    }

    if (paymentMethods.length === 0) {
      toast.error("결제 수단을 먼저 등록해주세요.");
      return;
    }

    setIsChangingPlan(true);
    try {
      const updated = await changePlan(selectedPlanId);
      setSubscription(updated);
      toast.success(`${PLAN_LABELS[selectedPlanId] || selectedPlanId} 플랜으로 변경되었습니다.`);
    } catch (err) {
      toast.error(err?.message || "플랜 변경에 실패했습니다.");
    } finally {
      setIsChangingPlan(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm(`정말로 구독을 해지하시겠습니까? 다음 결제일(${formatDate(subscription?.nextPaymentDate)})까지는 혜택이 유지됩니다.`)) return;
    setIsChangingPlan(true);
    try {
      const updated = await cancelSubscription();
      setSubscription(updated);
      toast.success("구독 해지가 예약되었습니다. 다음 결제일까지 계속 이용하실 수 있습니다.");
    } catch (err) {
      toast.error(err?.message || "구독 해지에 실패했습니다.");
    } finally {
      setIsChangingPlan(false);
    }
  };

  const handleResumeSubscription = async () => {
    setIsChangingPlan(true);
    try {
      const updated = await resumeSubscription();
      setSubscription(updated);
      toast.success("해지 예약이 취소되었습니다.");
    } catch (err) {
      toast.error(err?.message || "처리에 실패했습니다.");
    } finally {
      setIsChangingPlan(false);
    }
  };

  const defaultMethod = paymentMethods.find((m) => m.isDefault) || paymentMethods[0];
  const currentPlanName = subscription?.planName;
  const isSamePlanSelected = selectedPlanId === currentPlanName;
  const isCancelScheduled = subscription?.status === "CANCEL_SCHEDULED";

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-3 text-sm text-slate-500 mb-2">
          <Link to="/mypage" className="hover:text-slate-900 transition-colors">마이페이지</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">구독 관리 및 결제</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">구독 관리 및 결제</h1>
        <p className="mt-2 text-slate-600">현재 이용 중인 플랜을 확인하고 변경할 수 있습니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Current Status & Payment Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Current Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">이용 중인 플랜</h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${
                isCancelScheduled
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}>
                <CheckCircle2 size={14} /> {isCancelScheduled ? "해지 예약됨" : "활성 상태"}
              </span>
            </div>
            <div className="mb-4">
              <span className="text-2xl font-extrabold text-slate-900">{PLAN_LABELS[currentPlanName] || currentPlanName}</span>
            </div>

            <div className="space-y-3 mb-6">
              {subscription?.nextPaymentDate && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar size={16} className="text-slate-400" />
                  <span>{isCancelScheduled ? "이용 종료일" : "다음 결제일"}: <strong className="text-slate-900">{formatDate(subscription.nextPaymentDate)}</strong></span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CreditCard size={16} className="text-slate-400" />
                <span>결제 수단: <strong className="text-slate-900">{defaultMethod ? `${defaultMethod.cardCompany} ${defaultMethod.maskedCardNum}` : "등록된 수단 없음"}</strong></span>
              </div>
            </div>

            {currentPlanName !== "BASIC" && (
              isCancelScheduled ? (
                <button
                  onClick={handleResumeSubscription}
                  disabled={isChangingPlan}
                  className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-bold rounded-xl border border-blue-200 transition-colors disabled:opacity-60"
                >
                  해지 예약 취소
                </button>
              ) : (
                <button
                  onClick={handleCancelSubscription}
                  disabled={isChangingPlan}
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-bold rounded-xl border border-slate-200 transition-colors disabled:opacity-60"
                >
                  구독 해지하기
                </button>
              )
            )}
          </div>

          {/* Payment Method Management */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-600" />
              결제 수단 관리
            </h2>

            <div className="space-y-3 mb-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-slate-200 rounded flex items-center justify-center text-slate-500">
                      <CreditCard size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{method.cardCompany}</p>
                      <p className="text-xs text-slate-500">{method.maskedCardNum}</p>
                    </div>
                  </div>
                  {method.isDefault && <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded">기본</span>}
                </div>
              ))}
              {paymentMethods.length === 0 && <p className="text-sm text-slate-500 text-center py-4">등록된 결제 수단이 없습니다.</p>}
            </div>

            <button
              onClick={handleAddCard}
              disabled={cardRegistering}
              className="w-full py-2 text-sm font-bold text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 rounded-xl transition-colors border-dashed flex items-center justify-center gap-1 disabled:opacity-60"
            >
              <Plus size={16} /> {cardRegistering ? "이동 중..." : "새 결제 수단 추가"}
            </button>
          </div>
        </div>

        {/* Right Column: Plan Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">플랜 변경</h2>

            <div className="space-y-4 mb-8">
              {plans.map((plan) => (
                <label
                  key={plan.planName}
                  className={`block relative cursor-pointer transition-all duration-200 rounded-2xl border-2 p-5 ${
                    selectedPlanId === plan.planName
                      ? "border-blue-600 bg-blue-50/30 shadow-md ring-1 ring-blue-600 ring-opacity-50"
                      : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={plan.planName}
                    checked={selectedPlanId === plan.planName}
                    onChange={() => setSelectedPlanId(plan.planName)}
                    className="sr-only"
                  />

                  {plan.planName === "PRO" && (
                    <div className="absolute -top-3 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Zap size={10} /> 추천
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          selectedPlanId === plan.planName ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"
                        }`}>
                          {selectedPlanId === plan.planName && <Check size={12} className="text-white" />}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{PLAN_LABELS[plan.planName] || plan.planName}</h3>
                        {plan.planName === currentPlanName && (
                          <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">현재 플랜</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 ml-8">{PLAN_DESCRIPTIONS[plan.planName]}</p>
                    </div>

                    <div className="text-left md:text-right ml-8 md:ml-0">
                      <div className="flex items-baseline gap-1 md:justify-end">
                        <span className="text-2xl font-extrabold text-slate-900">
                          {plan.price === 0 ? "무료" : `${plan.price.toLocaleString()}원`}
                        </span>
                        {plan.price !== 0 && <span className="text-sm text-slate-500 font-medium">/월</span>}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">토큰 {plan.tokenQuota.toLocaleString()}개 · {plan.resetTimes.join(", ")} 초기화</p>
                    </div>
                  </div>

                  <div className="mt-4 ml-8 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                    {(PLAN_FEATURES[plan.planName] || []).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 size={16} className={`flex-shrink-0 mt-0.5 ${selectedPlanId === plan.planName ? "text-blue-500" : "text-slate-400"}`} />
                        <span className="leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>
                </label>
              ))}
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6 flex gap-3">
              <Info size={20} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-600">
                <p className="font-bold text-slate-800 mb-1">결제 및 해지 안내</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>플랜 변경은 즉시 적용되며, 남은 기간에 대한 차액은 일할 계산되어 즉시 청구되거나 다음 결제에서 차감됩니다.</li>
                  <li>구독 해지 시, 다음 결제일까지는 정상적으로 서비스를 이용하실 수 있습니다.</li>
                  <li>결제는 등록된 결제 수단으로 매월 자동 청구됩니다.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={handlePlanChange}
                disabled={isChangingPlan || isSamePlanSelected}
                className={`px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all ${
                  isChangingPlan
                    ? "bg-slate-400 cursor-not-allowed"
                    : isSamePlanSelected
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow"
                }`}
              >
                {isChangingPlan ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    처리 중...
                  </>
                ) : isSamePlanSelected ? (
                  "현재 이용 중인 플랜입니다"
                ) : selectedPlanId === "BASIC" ? (
                  "구독 해지하고 Basic으로 변경"
                ) : (
                  <>
                    선택한 플랜으로 변경하기
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
