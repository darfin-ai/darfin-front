import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
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
  ChevronRight,
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
import {
  PLAN_LABELS,
} from "../subscriptionPlans";
import { getPlanDescription, getPlanFeatures, formatPlanPrice, formatPlanTokenLine } from "../planI18n";
import { useLocale } from "../../../shared/i18n";

const CARD = "rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900";
const EYEBROW = "text-xs font-medium text-slate-400 dark:text-slate-500 mb-2";
const SECTION_TITLE = "text-lg font-semibold text-slate-900 dark:text-slate-100";
const PAGE_TITLE = "text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100";
const PAGE_DESC = "text-base text-slate-500 dark:text-slate-400 leading-relaxed";
const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 h-10 px-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-medium rounded-md transition-colors disabled:cursor-not-allowed";
const BTN_SECONDARY =
  "inline-flex w-full items-center justify-center gap-2 h-10 px-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-md transition-colors disabled:opacity-60";
const BTN_GHOST =
  "inline-flex w-full items-center justify-center gap-2 h-10 px-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-medium rounded-md transition-colors disabled:opacity-60";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
}

export function SubscriptionManagement() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { t, locale } = useLocale();

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
    if (!isLoggedIn) {
      navigate("/pricing", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (!isLoggedIn) return;
    loadAll();
  }, [isLoggedIn]);

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

  if (!isLoggedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="container py-16 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400 dark:text-slate-500" size={28} />
      </div>
    );
  }

  return (
    <div className="container py-10 sm:py-12">
      <div className="mb-8 max-w-2xl">
        <nav className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 mb-4">
          <Link to="/mypage" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            마이페이지
          </Link>
          <ChevronRight size={14} aria-hidden />
          <span className="text-slate-600 dark:text-slate-400">구독 관리</span>
        </nav>
        <div className={EYEBROW}>요금제</div>
        <h1 className={PAGE_TITLE}>구독 관리 및 결제</h1>
        <p className={`${PAGE_DESC} mt-2`}>현재 이용 중인 플랜을 확인하고 변경할 수 있습니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className={`${CARD} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                이용 중인 플랜
              </h2>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${
                  isCancelScheduled
                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    : "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                }`}
              >
                <CheckCircle2 size={12} />
                {isCancelScheduled ? "해지 예약됨" : "활성"}
              </span>
            </div>

            <p className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              {PLAN_LABELS[currentPlanName] || currentPlanName}
            </p>

            <div className="space-y-2.5 mb-5 text-sm text-slate-500 dark:text-slate-400">
              {subscription?.nextPaymentDate && (
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="shrink-0 text-slate-400 dark:text-slate-500" />
                  <span>
                    {isCancelScheduled ? "이용 종료일" : "다음 결제일"}:{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {formatDate(subscription.nextPaymentDate)}
                    </span>
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <CreditCard size={15} className="shrink-0 text-slate-400 dark:text-slate-500" />
                <span>
                  결제 수단:{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {defaultMethod ? `${defaultMethod.cardCompany} ${defaultMethod.maskedCardNum}` : "등록된 수단 없음"}
                  </span>
                </span>
              </div>
            </div>

            {currentPlanName !== "BASIC" && (
              isCancelScheduled ? (
                <button
                  type="button"
                  onClick={handleResumeSubscription}
                  disabled={isChangingPlan}
                  className={BTN_SECONDARY}
                >
                  해지 예약 취소
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancelSubscription}
                  disabled={isChangingPlan}
                  className={BTN_GHOST}
                >
                  구독 해지하기
                </button>
              )
            )}
          </div>

          <div className={`${CARD} p-5`}>
            <h2 className={`${SECTION_TITLE} mb-4 flex items-center gap-2`}>
              <ShieldCheck size={17} className="text-blue-600 dark:text-blue-400" />
              결제 수단
            </h2>

            <div className="space-y-2 mb-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-10 shrink-0 items-center justify-center rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400">
                      <CreditCard size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{method.cardCompany}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">{method.maskedCardNum}</p>
                    </div>
                  </div>
                  {method.isDefault && (
                    <span className="shrink-0 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-medium px-1.5 py-0.5">
                      기본
                    </span>
                  )}
                </div>
              ))}
              {paymentMethods.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">등록된 결제 수단이 없습니다.</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddCard}
              disabled={cardRegistering}
              className={`${BTN_SECONDARY} border-dashed`}
            >
              <Plus size={16} />
              {cardRegistering ? "이동 중..." : "결제 수단 추가"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className={`${CARD} p-5 sm:p-6`}>
            <h2 className={`${SECTION_TITLE} mb-5`}>플랜 변경</h2>

            <div className="space-y-3 mb-6">
              {plans.map((plan) => {
                const isSelected = selectedPlanId === plan.planName;
                return (
                  <label
                    key={plan.planName}
                    className={`block relative cursor-pointer rounded-xl border p-4 sm:p-5 transition-colors ${
                      isSelected
                        ? "border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={plan.planName}
                      checked={isSelected}
                      onChange={() => setSelectedPlanId(plan.planName)}
                      className="sr-only"
                    />

                    {plan.planName === "PRO" && (
                      <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white">
                        <Zap size={10} />
                        추천
                      </span>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                              isSelected
                                ? "border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500"
                                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                            }`}
                          >
                            {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                          </div>
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            {PLAN_LABELS[plan.planName] || plan.planName}
                          </h3>
                          {plan.planName === currentPlanName && (
                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-medium px-1.5 py-0.5">
                              현재 플랜
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 ml-6">{getPlanDescription(t, plan.planName)}</p>
                      </div>

                      <div className="sm:text-right ml-6 sm:ml-0 shrink-0">
                        <div className="flex items-baseline gap-1 sm:justify-end">
                          <span className="text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                            {formatPlanPrice(plan.price, t, locale)}
                          </span>
                          {plan.price !== 0 && <span className="text-sm text-slate-400 dark:text-slate-500">{t("pricingPage.perMonth")}</span>}
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {formatPlanTokenLine(plan, locale)}
                        </p>
                      </div>
                    </div>

                    <ul className="mt-4 ml-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                      {getPlanFeatures(t, plan.planName).map((feature, fi) => (
                        <li key={`${plan.planName}-${fi}`} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Check size={14} className={`shrink-0 mt-0.5 ${isSelected ? "text-blue-500 dark:text-blue-400" : "text-slate-300 dark:text-slate-600"}`} />
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </label>
                );
              })}
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 mb-6 flex gap-3">
              <Info size={18} className="text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
              <div className="text-sm text-slate-500 dark:text-slate-400">
                <p className="font-medium text-slate-700 dark:text-slate-200 mb-1.5">결제 및 해지 안내</p>
                <ul className="space-y-1 text-xs leading-relaxed">
                  <li>플랜 변경은 즉시 적용되며, 차액은 일할 계산되어 청구되거나 다음 결제에서 차감됩니다.</li>
                  <li>구독 해지 시 다음 결제일까지 서비스를 이용할 수 있습니다.</li>
                  <li>결제는 등록된 결제 수단으로 매월 자동 청구됩니다.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handlePlanChange}
                disabled={isChangingPlan || isSamePlanSelected}
                className={BTN_PRIMARY}
              >
                {isChangingPlan ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    처리 중...
                  </>
                ) : isSamePlanSelected ? (
                  "현재 이용 중인 플랜입니다"
                ) : selectedPlanId === "BASIC" ? (
                  "구독 해지하고 Basic으로 변경"
                ) : (
                  <>
                    선택한 플랜으로 변경
                    <ArrowRight size={16} />
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
