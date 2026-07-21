import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  User,
  Settings,
  CreditCard,
  Shield,
  LogOut,
  Receipt,
  Image as ImageIcon,
  Cpu,
  AlertCircle,
  X,
  Plus,
} from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { getUserProfile, updateNickname, updatePassword, updateProfileImage, deleteProfileImage, deleteAccount, deleteSocialAccount } from "../../../shared/api/userApi";
import { getMySubscription } from "../../../shared/api/subscriptionApi";
import { getMyTokenStatus } from "../../../shared/api/tokenApi";
import {
  getPaymentMethods,
  deletePaymentMethod,
  getBillingHistory,
  refundPayment,
} from "../../../shared/api/billingApi";
import { startCardRegistration } from "../../../shared/lib/tossBilling";
import { useLocale } from "../../../shared/i18n";
import { usePageMeta } from "../../../shared/hooks/usePageMeta";
import { formatLocaleDate, formatLocaleDateTime } from "../../../shared/i18n/localeFormat";
import {
  authLabelClassName,
} from "../../auth/authUi";

const CARD = "rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900";
const EYEBROW = "text-xs font-medium text-slate-400 dark:text-slate-500 mb-2";
const SECTION_TITLE = "text-lg font-semibold text-slate-900 dark:text-slate-100";
const PAGE_TITLE = "text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100";
const INPUT =
  "w-full h-10 px-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500";
const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 h-10 px-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-medium rounded-md transition-colors disabled:cursor-not-allowed";
const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-2 h-10 px-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-md transition-colors disabled:opacity-60";
const BTN_DANGER =
  "inline-flex items-center justify-center gap-2 h-10 px-4 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 text-sm font-medium rounded-md transition-colors";
const MODAL_CARD = `${CARD} w-full max-w-md overflow-hidden shadow-lg`;

const PLAN_LABELS = {
  BASIC: "Darfin Basic",
  PRO: "Darfin Pro",
  ENTERPRISE: "Darfin Enterprise",
};

const REFUND_REASON_KEYS = ["changeOfMind", "dissatisfaction", "competitor", "paymentError", "custom"];

function formatAmount(amount, locale) {
  const formatted = amount.toLocaleString(locale === "ko" ? "ko-KR" : "en-US");
  return locale === "ko" ? `${formatted}원` : `₩${formatted}`;
}

export function MyPage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const { t, locale } = useLocale();

  usePageMeta({ title: t("nav.mypage"), noindex: true });

  const [activeTab, setActiveTab] = useState(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    return tab === "subscription" || tab === "billing" ? tab : "profile";
  });

  // Profile tab state
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [profileImage, setProfileImage] = useState(null);
  const [nicknameLoading, setNicknameLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Password change state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);

  // Account deletion modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Subscription / billing state
  const [subscription, setSubscription] = useState(null);
  const [tokenStatus, setTokenStatus] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);
  const [billingLoading, setBillingLoading] = useState(true);
  const [cardRegistering, setCardRegistering] = useState(false);
  const [methodDeleteError, setMethodDeleteError] = useState(null);

  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [customRefundReason, setCustomRefundReason] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);

  const [isCardNameModalOpen, setIsCardNameModalOpen] = useState(false);
  const [cardNameInput, setCardNameInput] = useState("");

  const isLocalAccount = !user?.provider || user.provider === 'LOCAL';

  // 마운트 시 최신 프로필 조회
  useEffect(() => {
    getUserProfile()
      .then((data) => {
        setNickname(data.nickname || '');
        setProfileImage(data.profileImage || null);
      })
      .catch(() => {/* 실패 시 JWT에서 읽은 초기값 유지 */});
  }, []);

  const loadBillingData = () => {
    setBillingLoading(true);
    Promise.allSettled([
      getMySubscription(),
      getMyTokenStatus(),
      getPaymentMethods(),
      getBillingHistory(),
    ]).then(([subRes, tokenRes, methodsRes, historyRes]) => {
      if (subRes.status === 'fulfilled') setSubscription(subRes.value);
      if (tokenRes.status === 'fulfilled') setTokenStatus(tokenRes.value);
      if (methodsRes.status === 'fulfilled') setPaymentMethods(methodsRes.value);
      if (historyRes.status === 'fulfilled') setBillingHistory(historyRes.value);
    }).finally(() => setBillingLoading(false));
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setNicknameLoading(true);
    try {
      await updateNickname(nickname);
      updateUser({ nickname });
    } catch (err) {
    } finally {
      setNicknameLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return;
    }
    setPwLoading(true);
    try {
      await updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
    } finally {
      setPwLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    setDeleteLoading(true);
    try {
      if (isLocalAccount) {
        await deleteAccount(deletePassword);
      } else {
        await deleteSocialAccount();
      }
      await logout();
      navigate("/");
    } catch {
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleRefundRequest = (paymentId) => {
    setSelectedPaymentId(paymentId);
    setRefundReason("");
    setCustomRefundReason("");
    setIsRefundModalOpen(true);
  };

  const handleAddCard = () => {
    setCardNameInput("");
    setIsCardNameModalOpen(true);
  };

  const handleConfirmAddCard = async () => {
    if (!cardNameInput.trim()) {
      return;
    }
    setCardRegistering(true);
    setIsCardNameModalOpen(false);
    try {
      sessionStorage.setItem("pendingCardName", cardNameInput.trim());
      await startCardRegistration({
        userId: user?.userId,
        customerEmail: user?.email,
        customerName: user?.nickname,
      });
      // 성공 시 토스 페이지로 리다이렉트되므로 이후 코드는 실행되지 않음
    } catch (err) {
      sessionStorage.removeItem("pendingCardName");
      setCardRegistering(false);
    }
  };

  const handleDeleteMethod = async (id) => {
    setMethodDeleteError(null);
    try {
      await deletePaymentMethod(id);
      loadBillingData();
    } catch (err) {
      setMethodDeleteError(err?.message || t("account.mypage.billing.methodDeleteFailed"));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      // 미리보기 즉시 반영
      setProfileImage(base64);
      // 서버 업로드
      setImageUploading(true);
      try {
        await updateProfileImage(base64);
      } catch {
        // 업로드 실패 시 이전 이미지로 복원
        setProfileImage((prev) => prev === base64 ? null : prev);
      } finally {
        setImageUploading(false);
        // 같은 파일 재선택 가능하도록 초기화
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const submitRefundRequest = async () => {
    if (!refundReason) return;
    if (refundReason === "custom" && !customRefundReason.trim()) return;
    const reason = refundReason === "custom"
      ? customRefundReason.trim()
      : t(`account.mypage.billing.refundReasons.${refundReason}`);
    try {
      await refundPayment(selectedPaymentId, reason);
      setIsRefundModalOpen(false);
      loadBillingData();
    } catch (err) {
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className={`${SECTION_TITLE} mb-5`}>{t("account.mypage.profile.title")}</h2>
        <div className="flex flex-col sm:flex-row items-start gap-8">
          <div className="flex flex-col items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />

            <div
              onClick={() => !imageUploading && fileInputRef.current?.click()}
              className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden relative group cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {imageUploading ? (
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : profileImage ? (
                <img src={profileImage} alt={t("account.mypage.profile.profileAlt")} className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="group-hover:opacity-0 transition-opacity" />
              )}
              {!imageUploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-full">
                  <ImageIcon size={20} className="text-white mb-1" />
                  <span className="text-[10px] font-medium text-white">{t("account.mypage.profile.changePhoto")}</span>
                </div>
              )}
            </div>

            {profileImage && !imageUploading && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await deleteProfileImage();
                    setProfileImage(null);
                  } catch {
                  }
                }}
                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                {t("account.mypage.profile.removePhoto")}
              </button>
            )}
          </div>

          <form onSubmit={handleUpdateProfile} className="flex-1 space-y-4 max-w-md w-full">
            <div>
              <label className={authLabelClassName}>{t("account.mypage.profile.emailLabel")}</label>
              <input type="email" disabled value={user?.email || ''} className={`${INPUT} cursor-not-allowed`} />
            </div>
            <div>
              <label className={authLabelClassName}>{t("account.mypage.profile.nicknameLabel")}</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className={INPUT}
              />
            </div>
            <button type="submit" disabled={nicknameLoading} className={BTN_PRIMARY}>
              {nicknameLoading ? t("account.mypage.profile.saving") : t("account.mypage.profile.save")}
            </button>
          </form>
        </div>
      </div>

      <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />

      <div>
        <h2 className={`${SECTION_TITLE} mb-5`}>{t("account.mypage.security.title")}</h2>

        {isLocalAccount ? (
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md mb-8">
            <div>
              <label className={authLabelClassName}>{t("account.mypage.security.currentPassword")}</label>
              <input
                type="password"
                required
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder={t("account.mypage.security.currentPasswordPlaceholder")}
                className={INPUT}
              />
            </div>
            <div>
              <label className={authLabelClassName}>{t("account.mypage.security.newPassword")}</label>
              <input
                type="password"
                required
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder={t("account.mypage.security.newPasswordPlaceholder")}
                className={INPUT}
              />
            </div>
            <div>
              <label className={authLabelClassName}>{t("account.mypage.security.confirmPassword")}</label>
              <input
                type="password"
                required
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder={t("account.mypage.security.confirmPasswordPlaceholder")}
                className={`${INPUT} ${
                  pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : ''
                }`}
              />
              {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">{t("account.mypage.security.passwordMismatch")}</p>
              )}
            </div>
            <button type="submit" disabled={pwLoading} className={BTN_SECONDARY}>
              {pwLoading ? t("account.mypage.security.changing") : t("account.mypage.security.changePassword")}
            </button>
          </form>
        ) : (
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 max-w-md mb-8">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("account.mypage.security.socialNotice", {
                provider: t(`account.mypage.security.providers.${user?.provider}`),
              })}
            </p>
          </div>
        )}
      </div>

      <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />

      <div>
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
          <AlertCircle size={18} />
          {t("account.mypage.danger.title")}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {t("account.mypage.danger.description")}
        </p>
        <button type="button" onClick={() => setIsDeleteModalOpen(true)} className={BTN_DANGER}>
          <LogOut size={16} />
          {t("account.mypage.danger.deleteAccount")}
        </button>
      </div>
    </div>
  );

  const renderSubscriptionTab = () => {
    const planName = subscription?.planName || tokenStatus?.planName || 'BASIC';
    const planLabel = PLAN_LABELS[planName] || planName;
    const tokenQuota = tokenStatus?.tokenQuota ?? 0;
    const tokenBalance = tokenStatus?.tokenBalance ?? 0;
    const used = Math.max(0, tokenQuota - tokenBalance);
    const pct = tokenQuota > 0 ? (used / tokenQuota) * 100 : 0;

    return (
      <div className="space-y-8">
        <div>
          <h2 className={`${SECTION_TITLE} mb-5`}>{t("account.mypage.subscription.title")}</h2>
          <div className={`${CARD} p-5 sm:p-6`}>
            <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium px-2 py-0.5 mb-3">
              {t("account.mypage.subscription.currentPlanBadge")}
            </span>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{planLabel}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              {subscription?.status === 'CANCEL_SCHEDULED'
                ? t("account.mypage.subscription.cancelScheduled", {
                    date: formatLocaleDate(subscription?.nextPaymentDate, locale),
                  })
                : subscription?.nextPaymentDate
                  ? t("account.mypage.subscription.nextPayment", {
                      date: formatLocaleDate(subscription.nextPaymentDate, locale),
                    })
                  : t("account.mypage.subscription.tokenUsageNote")}
            </p>
            <Link to="/subscription" className={BTN_PRIMARY}>
              {t("account.mypage.subscription.manageLink")}
            </Link>
          </div>
        </div>

        <div>
          <h2 className={`${SECTION_TITLE} mb-5 flex items-center gap-2`}>
            <Cpu size={18} className="text-slate-400 dark:text-slate-500" />
            {t("account.mypage.subscription.tokenTitle")}
          </h2>
          <div className={`${CARD} p-5 sm:p-6`}>
            <div className="flex justify-between items-end mb-4 gap-4">
              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t("account.mypage.subscription.tokensUsed")}</div>
                <div className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {used.toLocaleString(locale === "ko" ? "ko-KR" : "en-US")}{' '}
                  <span className="text-base font-medium text-slate-400 dark:text-slate-500">/ {tokenQuota.toLocaleString(locale === "ko" ? "ko-KR" : "en-US")}</span>
                </div>
              </div>
              <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium px-2 py-1 tabular-nums">
                {t("account.mypage.subscription.tokensRemaining", { count: tokenBalance.toLocaleString(locale === "ko" ? "ko-KR" : "en-US") })}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 leading-relaxed">
              {t("account.mypage.subscription.tokenDeductionNote", {
                date: formatLocaleDateTime(tokenStatus?.nextResetAt, locale),
              })}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderBillingTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className={`${SECTION_TITLE} mb-5`}>{t("account.mypage.billing.paymentMethodsTitle")}</h2>
        {methodDeleteError && (
          <p className="mb-3 text-xs font-medium text-red-600 dark:text-red-400">{methodDeleteError}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paymentMethods.map((method) => (
            <div key={method.id} className={`${CARD} p-4 flex items-start justify-between gap-3`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-10 shrink-0 items-center justify-center rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
                  <CreditCard size={14} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {method.cardName || method.cardCompany}{method.isDefault ? t("account.mypage.billing.defaultSuffix") : ""}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{method.cardCompany}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 font-mono tracking-wider mt-0.5">{method.maskedCardNum}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteMethod(method.id)}
                className="shrink-0 text-xs font-medium text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1 transition-colors"
              >
                {t("account.mypage.billing.delete")}
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddCard}
            disabled={cardRegistering}
            className={`${CARD} p-4 border-dashed hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 min-h-[88px] disabled:opacity-60`}
          >
            <Plus size={20} />
            <span className="text-sm font-medium">{cardRegistering ? t("account.mypage.billing.redirecting") : t("account.mypage.billing.addMethod")}</span>
          </button>
        </div>
      </div>

      <div>
        <h2 className={`${SECTION_TITLE} mb-5`}>{t("account.mypage.billing.historyTitle")}</h2>
        <div className={`${CARD} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("account.mypage.billing.table.date")}</th>
                  <th className="px-4 py-3 font-medium">{t("account.mypage.billing.table.product")}</th>
                  <th className="px-4 py-3 font-medium">{t("account.mypage.billing.table.amount")}</th>
                  <th className="px-4 py-3 font-medium">{t("account.mypage.billing.table.status")}</th>
                  <th className="px-4 py-3 font-medium text-right">{t("account.mypage.billing.table.receipt")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {billingHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-400 dark:text-slate-500">
                      {billingLoading ? t("account.mypage.billing.loading") : t("account.mypage.billing.noHistory")}
                    </td>
                  </tr>
                )}
                {billingHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 tabular-nums">{formatLocaleDate(item.paidAt || item.createdAt, locale)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{item.orderName}</td>
                    <td className="px-4 py-3 font-medium tabular-nums text-slate-900 dark:text-slate-100">{formatAmount(item.amount, locale)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium px-2 py-0.5">
                        {t(`account.mypage.paymentStatus.${item.status}`) || item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <a
                        href={item.receiptUrl || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors"
                        title={t("account.mypage.billing.receiptTitle")}
                      >
                        <Receipt size={16} />
                      </a>
                      {item.status === "DONE" && (
                        <button
                          type="button"
                          onClick={() => handleRefundRequest(item.id)}
                          className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900/50 transition-colors"
                        >
                          {t("account.mypage.billing.requestRefund")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-10 sm:py-12">
      <div className="mb-8">
        <div className={EYEBROW}>{t("account.mypage.eyebrow")}</div>
        <h1 className={PAGE_TITLE}>{t("account.mypage.title")}</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        <aside className="w-full lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            {[
              { id: "profile", icon: <Settings size={16} />, label: t("account.mypage.tabs.profile") },
              { id: "subscription", icon: <Shield size={16} />, label: t("account.mypage.tabs.subscription") },
              { id: "billing", icon: <CreditCard size={16} />, label: t("account.mypage.tabs.billing") },
            ].map(({ id, icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === id
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className={`flex-1 w-full ${CARD} p-5 sm:p-6 min-h-[560px]`}>
          {activeTab === "profile" && renderProfileTab()}
          {activeTab === "subscription" && renderSubscriptionTab()}
          {activeTab === "billing" && renderBillingTab()}
        </main>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className={MODAL_CARD}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t("account.mypage.danger.modalTitle")}</h3>
              <button type="button" onClick={() => { setIsDeleteModalOpen(false); setDeletePassword(''); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                {t("account.mypage.danger.modalBody")}
                <br />
                {t("account.mypage.danger.modalConfirm")}
              </p>
              {isLocalAccount && (
                <div className="mb-5">
                  <label className={authLabelClassName}>{t("account.mypage.danger.passwordConfirm")}</label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder={t("account.mypage.security.currentPasswordPlaceholder")}
                    className={INPUT}
                  />
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => { setIsDeleteModalOpen(false); setDeletePassword(''); }} className={`${BTN_SECONDARY} flex-1`}>
                  {t("account.mypage.danger.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleAccountDeletion}
                  disabled={deleteLoading || (isLocalAccount && !deletePassword)}
                  className={`${BTN_DANGER} flex-1 justify-center disabled:opacity-60`}
                >
                  {deleteLoading ? t("account.mypage.danger.processing") : t("account.mypage.danger.confirmDelete")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCardNameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className={MODAL_CARD}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t("account.mypage.billing.cardNameModalTitle")}</h3>
              <button type="button" onClick={() => setIsCardNameModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {t("account.mypage.billing.cardNameModalBody")}
              </p>
              <input
                type="text"
                autoFocus
                maxLength={50}
                value={cardNameInput}
                onChange={(e) => setCardNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleConfirmAddCard(); }}
                placeholder={t("account.mypage.billing.cardNamePlaceholder")}
                className={INPUT}
              />
              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => setIsCardNameModalOpen(false)} className={`${BTN_SECONDARY} flex-1`}>
                  {t("account.mypage.danger.cancel")}
                </button>
                <button type="button" onClick={handleConfirmAddCard} className={`${BTN_PRIMARY} flex-1`}>
                  {t("account.mypage.billing.next")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRefundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className={MODAL_CARD}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t("account.mypage.billing.refundModalTitle")}</h3>
              <button type="button" onClick={() => setIsRefundModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-5">
              <div className="mb-5 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-sm text-slate-500 dark:text-slate-400">
                {t("account.mypage.billing.refundNotice")}
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">{t("account.mypage.billing.refundReasonLabel")}</label>
                <div className="space-y-2">
                  {REFUND_REASON_KEYS.map((reason) => (
                    <label key={reason} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <input type="radio" name="refundReason" value={reason} checked={refundReason === reason} onChange={(e) => setRefundReason(e.target.value)} className="accent-blue-600" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{t(`account.mypage.billing.refundReasons.${reason}`)}</span>
                    </label>
                  ))}
                </div>
                {refundReason === "custom" && (
                  <textarea
                    placeholder={t("account.mypage.billing.refundCustomPlaceholder")}
                    value={customRefundReason}
                    onChange={(e) => setCustomRefundReason(e.target.value)}
                    rows={3}
                    className={`${INPUT} h-auto py-2.5 resize-none`}
                  />
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setIsRefundModalOpen(false)} className={`${BTN_SECONDARY} flex-1`}>{t("account.mypage.danger.cancel")}</button>
                <button type="button" onClick={submitRefundRequest} className={`${BTN_DANGER} flex-1 justify-center`}>{t("account.mypage.billing.submitRefund")}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
