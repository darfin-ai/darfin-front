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
import { toast } from "sonner";
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

const STATUS_LABELS = {
  DONE: "결제완료",
  PENDING: "처리중",
  FAILED: "결제실패",
  CANCELED: "환불완료",
};

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
}

export function MyPage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

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
      toast.success("닉네임이 변경되었습니다.");
    } catch (err) {
      toast.error(err?.message || "프로필 저장에 실패했습니다.");
    } finally {
      setNicknameLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    setPwLoading(true);
    try {
      await updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success("비밀번호가 변경되었습니다.");
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err?.status === 401
        ? "현재 비밀번호가 올바르지 않습니다."
        : (err?.message || "비밀번호 변경에 실패했습니다.");
      toast.error(msg);
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
      toast.success("회원 탈퇴가 완료되었습니다.");
      navigate("/");
    } catch (err) {
      const msg = err?.status === 401
        ? "비밀번호가 올바르지 않습니다."
        : (err?.message || "탈퇴 처리에 실패했습니다.");
      toast.error(msg);
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
      toast.error("카드 이름을 입력해주세요.");
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
      toast.error(err?.message || "카드 등록을 시작할 수 없습니다.");
      setCardRegistering(false);
    }
  };

  const handleDeleteMethod = async (id) => {
    try {
      await deletePaymentMethod(id);
      toast.success("결제 수단이 삭제되었습니다.");
      loadBillingData();
    } catch (err) {
      toast.error(err?.message || "결제 수단 삭제에 실패했습니다.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('5MB 이하의 이미지만 업로드할 수 있습니다.');
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
        toast.success('프로필 이미지가 변경되었습니다.');
      } catch {
        toast.error('이미지 업로드에 실패했습니다.');
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
    if (!refundReason) { toast.error("환불 사유를 선택해주세요."); return; }
    if (refundReason === "custom" && !customRefundReason.trim()) { toast.error("상세 사유를 입력해주세요."); return; }
    const reason = refundReason === "custom" ? customRefundReason.trim() : refundReason;
    try {
      await refundPayment(selectedPaymentId, reason);
      setIsRefundModalOpen(false);
      toast.success("환불이 접수되었습니다.");
      loadBillingData();
    } catch (err) {
      toast.error(err?.message || "환불 신청에 실패했습니다.");
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className={`${SECTION_TITLE} mb-5`}>프로필 관리</h2>
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
                <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="group-hover:opacity-0 transition-opacity" />
              )}
              {!imageUploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-full">
                  <ImageIcon size={20} className="text-white mb-1" />
                  <span className="text-[10px] font-medium text-white">변경</span>
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
                    toast.success('프로필 이미지가 삭제되었습니다.');
                  } catch {
                    toast.error('이미지 삭제에 실패했습니다.');
                  }
                }}
                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                이미지 삭제
              </button>
            )}
          </div>

          <form onSubmit={handleUpdateProfile} className="flex-1 space-y-4 max-w-md w-full">
            <div>
              <label className={authLabelClassName}>이메일 계정 (로그인 ID)</label>
              <input type="email" disabled value={user?.email || ''} className={`${INPUT} cursor-not-allowed`} />
            </div>
            <div>
              <label className={authLabelClassName}>닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className={INPUT}
              />
            </div>
            <button type="submit" disabled={nicknameLoading} className={BTN_PRIMARY}>
              {nicknameLoading ? '저장 중...' : '프로필 저장'}
            </button>
          </form>
        </div>
      </div>

      <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />

      <div>
        <h2 className={`${SECTION_TITLE} mb-5`}>보안 설정</h2>

        {isLocalAccount ? (
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md mb-8">
            <div>
              <label className={authLabelClassName}>현재 비밀번호</label>
              <input
                type="password"
                required
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder="현재 비밀번호를 입력해주세요"
                className={INPUT}
              />
            </div>
            <div>
              <label className={authLabelClassName}>새 비밀번호</label>
              <input
                type="password"
                required
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="새로운 비밀번호를 입력해주세요"
                className={INPUT}
              />
            </div>
            <div>
              <label className={authLabelClassName}>비밀번호 확인</label>
              <input
                type="password"
                required
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="새로운 비밀번호를 다시 입력해주세요"
                className={`${INPUT} ${
                  pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : ''
                }`}
              />
              {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">비밀번호가 일치하지 않습니다.</p>
              )}
            </div>
            <button type="submit" disabled={pwLoading} className={BTN_SECONDARY}>
              {pwLoading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        ) : (
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 max-w-md mb-8">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              소셜 계정({user?.provider === 'KAKAO' ? '카카오' : '구글'})으로 가입하셨습니다. 비밀번호 변경은 해당 소셜 서비스에서 진행해주세요.
            </p>
          </div>
        )}
      </div>

      <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />

      <div>
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
          <AlertCircle size={18} />
          위험 구역
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          회원 탈퇴 시 모든 분석 데이터, 모의투자 내역, 커뮤니티 작성 글이 삭제되며 복구할 수 없습니다.
        </p>
        <button type="button" onClick={() => setIsDeleteModalOpen(true)} className={BTN_DANGER}>
          <LogOut size={16} />
          회원 탈퇴
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
          <h2 className={`${SECTION_TITLE} mb-5`}>내 구독 모델</h2>
          <div className={`${CARD} p-5 sm:p-6`}>
            <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium px-2 py-0.5 mb-3">
              현재 이용 중인 플랜
            </span>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{planLabel}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              {subscription?.status === 'CANCEL_SCHEDULED'
                ? `해지 예약됨 — ${formatDate(subscription?.nextPaymentDate)}까지 이용 가능`
                : subscription?.nextPaymentDate
                  ? `다음 결제일: ${formatDate(subscription.nextPaymentDate)}`
                  : '공시 요약/기업분석/투자분석 이용 시 토큰이 차감됩니다.'}
            </p>
            <Link to="/subscription" className={BTN_PRIMARY}>
              구독 관리 및 플랜 변경
            </Link>
          </div>
        </div>

        <div>
          <h2 className={`${SECTION_TITLE} mb-5 flex items-center gap-2`}>
            <Cpu size={18} className="text-slate-400 dark:text-slate-500" />
            토큰 사용량
          </h2>
          <div className={`${CARD} p-5 sm:p-6`}>
            <div className="flex justify-between items-end mb-4 gap-4">
              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">사용한 토큰</div>
                <div className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {used.toLocaleString()}{' '}
                  <span className="text-base font-medium text-slate-400 dark:text-slate-500">/ {tokenQuota.toLocaleString()}</span>
                </div>
              </div>
              <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium px-2 py-1 tabular-nums">
                잔여 {tokenBalance.toLocaleString()}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 leading-relaxed">
              공시 요약/분석·기업분석 1건당 2,000 토큰, 투자분석 리포트 생성 1회당 2,000 토큰이 차감됩니다.
              다음 초기화: {formatDateTime(tokenStatus?.nextResetAt)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderBillingTab = () => (
    <div className="space-y-8">
      <div>
        <h2 className={`${SECTION_TITLE} mb-5`}>결제 수단 관리</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paymentMethods.map((method) => (
            <div key={method.id} className={`${CARD} p-4 flex items-start justify-between gap-3`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-10 shrink-0 items-center justify-center rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
                  <CreditCard size={14} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {method.cardName || method.cardCompany}{method.isDefault ? " (기본)" : ""}
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
                삭제
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
            <span className="text-sm font-medium">{cardRegistering ? "이동 중..." : "결제 수단 추가"}</span>
          </button>
        </div>
      </div>

      <div>
        <h2 className={`${SECTION_TITLE} mb-5`}>결제 내역 및 영수증</h2>
        <div className={`${CARD} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">결제일</th>
                  <th className="px-4 py-3 font-medium">상품명</th>
                  <th className="px-4 py-3 font-medium">결제금액</th>
                  <th className="px-4 py-3 font-medium">상태</th>
                  <th className="px-4 py-3 font-medium text-right">영수증/환불</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {billingHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-400 dark:text-slate-500">
                      {billingLoading ? "불러오는 중..." : "결제 내역이 없습니다."}
                    </td>
                  </tr>
                )}
                {billingHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 tabular-nums">{formatDate(item.paidAt || item.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{item.orderName}</td>
                    <td className="px-4 py-3 font-medium tabular-nums text-slate-900 dark:text-slate-100">{item.amount.toLocaleString()}원</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium px-2 py-0.5">
                        {STATUS_LABELS[item.status] || item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <a
                        href={item.receiptUrl || undefined}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => { if (!item.receiptUrl) { e.preventDefault(); toast.error("영수증 정보가 없습니다."); } }}
                        className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors"
                        title="영수증 출력"
                      >
                        <Receipt size={16} />
                      </a>
                      {item.status === "DONE" && (
                        <button
                          type="button"
                          onClick={() => handleRefundRequest(item.id)}
                          className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900/50 transition-colors"
                        >
                          환불신청
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
        <div className={EYEBROW}>계정</div>
        <h1 className={PAGE_TITLE}>마이페이지</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        <aside className="w-full lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            {[
              { id: "profile", icon: <Settings size={16} />, label: "회원 정보 관리" },
              { id: "subscription", icon: <Shield size={16} />, label: "구독 관리" },
              { id: "billing", icon: <CreditCard size={16} />, label: "결제 및 청구" },
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
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">회원 탈퇴</h3>
              <button type="button" onClick={() => { setIsDeleteModalOpen(false); setDeletePassword(''); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                탈퇴 시 모든 데이터가 삭제되며 <span className="font-medium text-red-600 dark:text-red-400">복구할 수 없습니다.</span>
                <br />
                정말 탈퇴하시겠습니까?
              </p>
              {isLocalAccount && (
                <div className="mb-5">
                  <label className={authLabelClassName}>비밀번호 확인</label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="현재 비밀번호를 입력해주세요"
                    className={INPUT}
                  />
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => { setIsDeleteModalOpen(false); setDeletePassword(''); }} className={`${BTN_SECONDARY} flex-1`}>
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleAccountDeletion}
                  disabled={deleteLoading || (isLocalAccount && !deletePassword)}
                  className={`${BTN_DANGER} flex-1 justify-center disabled:opacity-60`}
                >
                  {deleteLoading ? '처리 중...' : '탈퇴하기'}
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
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">카드 이름 설정</h3>
              <button type="button" onClick={() => setIsCardNameModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                결제 수단 목록에서 구분할 수 있도록 카드 이름을 입력해주세요.
              </p>
              <input
                type="text"
                autoFocus
                maxLength={50}
                value={cardNameInput}
                onChange={(e) => setCardNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleConfirmAddCard(); }}
                placeholder="예: 내 신한카드"
                className={INPUT}
              />
              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => setIsCardNameModalOpen(false)} className={`${BTN_SECONDARY} flex-1`}>
                  취소
                </button>
                <button type="button" onClick={handleConfirmAddCard} className={`${BTN_PRIMARY} flex-1`}>
                  다음
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
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">환불 신청</h3>
              <button type="button" onClick={() => setIsRefundModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-5">
              <div className="mb-5 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-sm text-slate-500 dark:text-slate-400">
                환불 접수 후 영업일 기준 2~3일 내에 처리되며, 완료 시 이메일로 안내해 드립니다.
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">환불 사유를 선택해주세요</label>
                <div className="space-y-2">
                  {["단순 변심", "서비스 불만족", "타사 서비스 이용", "결제 오류 / 중복 결제", "custom"].map((reason) => (
                    <label key={reason} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <input type="radio" name="refundReason" value={reason} checked={refundReason === reason} onChange={(e) => setRefundReason(e.target.value)} className="accent-blue-600" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{reason === "custom" ? "기타 (직접 입력)" : reason}</span>
                    </label>
                  ))}
                </div>
                {refundReason === "custom" && (
                  <textarea
                    placeholder="상세 환불 사유를 입력해주세요. (최소 10자 이상)"
                    value={customRefundReason}
                    onChange={(e) => setCustomRefundReason(e.target.value)}
                    rows={3}
                    className={`${INPUT} h-auto py-2.5 resize-none`}
                  />
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setIsRefundModalOpen(false)} className={`${BTN_SECONDARY} flex-1`}>취소</button>
                <button type="button" onClick={submitRefundRequest} className={`${BTN_DANGER} flex-1 justify-center`}>환불 신청하기</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
