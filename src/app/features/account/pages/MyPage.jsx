import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  User,
  Settings,
  CreditCard,
  Bell,
  Shield,
  LogOut,
  Receipt,
  Image as ImageIcon,
  Cpu,
  Zap,
  AlertCircle,
  X,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../auth/context/AuthContext";
import { getUserProfile, updateNickname, updatePassword, updateProfileImage, deleteProfileImage, deleteAccount, deleteSocialAccount } from "../../../shared/api/userApi";

const MOCK_BILLING_HISTORY = [
  { id: "INV-202606", date: "2026-06-01", amount: 15000, status: "결제완료", plan: "Darfin Pro" },
  { id: "INV-202605", date: "2026-05-01", amount: 15000, status: "결제완료", plan: "Darfin Pro" },
  { id: "INV-202604", date: "2026-04-01", amount: 15000, status: "결제완료", plan: "Darfin Pro" },
];

const MOCK_PLAN = { plan: "Darfin Pro", tokensUsed: 6540, tokensMax: 10000, nextBillingDate: "2026-07-01" };

export function MyPage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");

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

  // Notification toggle
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Billing state (mock)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [customRefundReason, setCustomRefundReason] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([
    { id: "pm_1", provider: "삼성카드", number: "**** **** **** 1234", isDefault: true, bankCode: "SS" },
  ]);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({ number: "", expiry: "", password: "", birth: "" });

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

  const handleRefundRequest = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setRefundReason("");
    setCustomRefundReason("");
    setIsRefundModalOpen(true);
  };

  const handleAddCardSubmit = (e) => {
    e.preventDefault();
    if (newCard.number.replace(/\D/g, "").length < 14) {
      toast.error("올바른 카드 번호를 입력해주세요.");
      return;
    }
    const newMethod = {
      id: `pm_${Date.now()}`,
      provider: "신한카드",
      number: `**** **** **** ${newCard.number.replace(/\D/g, "").slice(-4)}`,
      isDefault: paymentMethods.length === 0,
      bankCode: "SH",
    };
    setPaymentMethods([...paymentMethods, newMethod]);
    setIsAddCardModalOpen(false);
    setNewCard({ number: "", expiry: "", password: "", birth: "" });
    toast.success("새 결제 수단이 등록되었습니다.");
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

  const submitRefundRequest = () => {
    if (!refundReason) { toast.error("환불 사유를 선택해주세요."); return; }
    if (refundReason === "custom" && !customRefundReason.trim()) { toast.error("상세 사유를 입력해주세요."); return; }
    setIsRefundModalOpen(false);
    toast.success("환불 신청이 접수되었습니다. 담당자 확인 후 영업일 기준 2~3일 내에 처리됩니다.");
  };

  const renderProfileTab = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">프로필 관리</h2>
        <div className="flex items-start gap-8">
          <div className="flex flex-col items-center gap-3">
            {/* 숨긴 파일 input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />

            <div
              onClick={() => !imageUploading && fileInputRef.current?.click()}
              className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 overflow-hidden relative group cursor-pointer hover:bg-slate-200 transition-colors"
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
                onClick={async () => {
                  try {
                    await deleteProfileImage();
                    setProfileImage(null);
                    toast.success('프로필 이미지가 삭제되었습니다.');
                  } catch {
                    toast.error('이미지 삭제에 실패했습니다.');
                  }
                }}
                className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
              >
                이미지 삭제
              </button>
            )}
          </div>

          <form onSubmit={handleUpdateProfile} className="flex-1 space-y-4 max-w-md">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">이메일 계정 (로그인 ID)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full h-11 px-4 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={nicknameLoading}
              className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {nicknameLoading ? '저장 중...' : '프로필 저장'}
            </button>
          </form>
        </div>
      </div>

      <div className="h-px bg-slate-200 w-full" />

      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">보안 및 알림 설정</h2>

        {isLocalAccount ? (
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md mb-8">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">현재 비밀번호</label>
              <input
                type="password"
                required
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder="현재 비밀번호를 입력해주세요"
                className="w-full h-11 px-4 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">새 비밀번호</label>
              <input
                type="password"
                required
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="새로운 비밀번호를 입력해주세요"
                className="w-full h-11 px-4 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">비밀번호 확인</label>
              <input
                type="password"
                required
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="새로운 비밀번호를 다시 입력해주세요"
                className={`w-full h-11 px-4 bg-white border rounded-xl focus:outline-none focus:ring-1 text-slate-900 text-sm ${
                  pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
              )}
            </div>
            <button
              type="submit"
              disabled={pwLoading}
              className="px-6 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 border border-slate-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pwLoading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        ) : (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-md mb-8">
            <p className="text-sm text-slate-600">
              소셜 계정({user?.provider === 'KAKAO' ? '카카오' : '구글'})으로 가입하셨습니다. 비밀번호 변경은 해당 소셜 서비스에서 진행해주세요.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <Bell size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">이메일 및 앱 푸시 알림</div>
              <div className="text-xs text-slate-500">중요 공시 및 AI 리포트 알림 수신</div>
            </div>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${notificationsEnabled ? "bg-blue-600" : "bg-slate-300"}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notificationsEnabled ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      <div className="h-px bg-slate-200 w-full" />

      <div>
        <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
          <AlertCircle size={20} />
          위험 구역
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          회원 탈퇴 시 모든 분석 데이터, 모의투자 내역, 커뮤니티 작성 글이 삭제되며 복구할 수 없습니다.
        </p>
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-2"
        >
          <LogOut size={16} />
          회원 탈퇴
        </button>
      </div>
    </div>
  );

  const renderSubscriptionTab = () => {
    const pct = MOCK_PLAN.tokensUsed / MOCK_PLAN.tokensMax * 100;
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6">내 구독 모델</h2>
          <div className="p-6 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-2xl text-white shadow-md relative overflow-hidden">
            <div className="absolute -right-10 -top-10 opacity-20"><Zap size={160} /></div>
            <div className="relative z-10">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm border border-white/30">현재 이용중인 플랜</span>
              <h3 className="text-3xl font-bold mt-4 mb-1">{MOCK_PLAN.plan}</h3>
              <p className="text-blue-100 text-sm mb-6">무제한 공시 열람 및 AI 분석 리포트 월 100건 제공</p>
              <div className="flex gap-4">
                <Link to="/subscription" className="px-5 py-2.5 bg-white text-blue-700 text-sm font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm inline-flex items-center justify-center">
                  구독 관리 및 플랜 변경
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Cpu className="text-slate-500" />
            당월 Gemini API 사용량 (토큰)
          </h2>
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex justify-between items-end mb-4">
              <div>
                <div className="text-sm font-medium text-slate-500 mb-1">이번 달 사용한 토큰</div>
                <div className="text-3xl font-bold text-slate-900">
                  {MOCK_PLAN.tokensUsed.toLocaleString()} <span className="text-lg font-medium text-slate-500">/ {MOCK_PLAN.tokensMax.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                잔여 {(MOCK_PLAN.tokensMax - MOCK_PLAN.tokensUsed).toLocaleString()}
              </div>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-3">매월 1일에 사용량이 초기화됩니다. 초과 사용 시 1,000 토큰당 10원이 과금됩니다.</p>
          </div>
        </div>
      </div>
    );
  };

  const renderBillingTab = () => (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">결제 수단 관리</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm flex items-start justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center text-[11px] font-bold text-white">{method.bankCode}</div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{method.provider}{method.isDefault ? " (기본 결제수단)" : ""}</div>
                  <div className="text-xs text-slate-500 font-mono tracking-widest mt-1">{method.number}</div>
                </div>
              </div>
              <button
                onClick={() => setPaymentMethods(paymentMethods.filter((m) => m.id !== method.id))}
                className="text-xs font-semibold text-slate-400 hover:text-red-600 p-2 transition-colors"
              >
                삭제
              </button>
            </div>
          ))}
          <button
            onClick={() => setIsAddCardModalOpen(true)}
            className="p-5 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-blue-300 transition-colors flex flex-col items-center justify-center gap-2 text-slate-500 min-h-[90px]"
          >
            <Plus size={22} className="text-slate-400" />
            <span className="text-sm font-semibold">새로운 결제 수단 추가</span>
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">결제 내역 및 영수증</h2>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-6 py-4">결제일</th>
                <th className="px-6 py-4">상품명</th>
                <th className="px-6 py-4">결제금액</th>
                <th className="px-6 py-4">상태</th>
                <th className="px-6 py-4 text-right">영수증/환불</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_BILLING_HISTORY.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-600">{item.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{item.plan}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{item.amount.toLocaleString()}원</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md border border-emerald-100">{item.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="영수증 출력">
                      <Receipt size={16} />
                    </button>
                    {idx === 0 && (
                      <button
                        onClick={() => handleRefundRequest(item.id)}
                        className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-colors"
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
  );

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start">
      <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 mb-4 px-2">마이페이지</h1>
        <nav className="flex flex-col gap-1">
          {[
            { id: "profile", icon: <Settings size={18} />, label: "회원 정보 관리" },
            { id: "subscription", icon: <Shield size={18} />, label: "구독 관리" },
            { id: "billing", icon: <CreditCard size={18} />, label: "결제 및 청구" },
          ].map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === id ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10 min-h-[600px]">
        {activeTab === "profile" && renderProfileTab()}
        {activeTab === "subscription" && renderSubscriptionTab()}
        {activeTab === "billing" && renderBillingTab()}
      </main>

      {/* Account deletion modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">회원 탈퇴</h3>
              <button onClick={() => { setIsDeleteModalOpen(false); setDeletePassword(''); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-6">
                탈퇴 시 모든 데이터가 삭제되며 <span className="font-semibold text-red-600">복구할 수 없습니다.</span><br />
                정말 탈퇴하시겠습니까?
              </p>
              {isLocalAccount && (
                <div className="space-y-1.5 mb-6">
                  <label className="text-sm font-semibold text-slate-700">비밀번호 확인</label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="현재 비밀번호를 입력해주세요"
                    className="w-full h-11 px-4 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 text-slate-900 text-sm"
                  />
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => { setIsDeleteModalOpen(false); setDeletePassword(''); }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleAccountDeletion}
                  disabled={deleteLoading || (isLocalAccount && !deletePassword)}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? '처리 중...' : '탈퇴하기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add card modal */}
      {isAddCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">새 결제 수단 추가</h3>
              <button onClick={() => setIsAddCardModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddCardSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">카드 번호</label>
                <input
                  type="text" required placeholder="0000-0000-0000-0000" maxLength={19}
                  value={newCard.number} onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">유효기간</label>
                  <input
                    type="text" required placeholder="MM/YY" maxLength={5}
                    value={newCard.expiry} onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">카드 비밀번호</label>
                  <input
                    type="password" required placeholder="앞 2자리" maxLength={2}
                    value={newCard.password} onChange={(e) => setNewCard({ ...newCard, password: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">생년월일 (또는 사업자번호)</label>
                <input
                  type="text" required placeholder="YYMMDD" maxLength={10}
                  value={newCard.birth} onChange={(e) => setNewCard({ ...newCard, birth: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsAddCardModalOpen(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">취소</button>
                <button type="submit" className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors">등록하기</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund modal */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">환불 신청</h3>
              <button onClick={() => setIsRefundModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
            </div>
            <div className="p-6">
              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                <p className="text-slate-600 mb-1">결제 번호: <span className="font-semibold text-slate-900">{selectedInvoiceId}</span></p>
                <p className="text-slate-600">환불 접수 후 영업일 기준 2~3일 내에 처리되며, 완료 시 이메일로 안내해 드립니다.</p>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-900">환불 사유를 선택해주세요</label>
                <div className="space-y-2">
                  {["단순 변심", "서비스 불만족", "타사 서비스 이용", "결제 오류 / 중복 결제", "custom"].map((reason) => (
                    <label key={reason} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <input type="radio" name="refundReason" value={reason} checked={refundReason === reason} onChange={(e) => setRefundReason(e.target.value)} className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 accent-blue-600" />
                      <span className="text-sm text-slate-700">{reason === "custom" ? "기타 (직접 입력)" : reason}</span>
                    </label>
                  ))}
                </div>
                {refundReason === "custom" && (
                  <textarea
                    placeholder="상세 환불 사유를 입력해주세요. (최소 10자 이상)"
                    value={customRefundReason} onChange={(e) => setCustomRefundReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                  />
                )}
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={() => setIsRefundModalOpen(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">취소</button>
                <button onClick={submitRefundRequest} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors">환불 신청하기</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
