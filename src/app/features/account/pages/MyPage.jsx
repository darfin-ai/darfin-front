import { useState } from "react";
import { Link } from "react-router";
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
  Plus
} from "lucide-react";
import { toast } from "sonner";
const MOCK_USER = {
  name: "\uAE40\uB2E4\uD540",
  email: "user@darfin.com",
  plan: "Darfin Pro",
  tokensUsed: 6540,
  tokensMax: 1e4,
  nextBillingDate: "2026-07-01"
};
const MOCK_BILLING_HISTORY = [
  { id: "INV-202606", date: "2026-06-01", amount: 15e3, status: "\uACB0\uC81C\uC644\uB8CC", plan: "Darfin Pro" },
  { id: "INV-202605", date: "2026-05-01", amount: 15e3, status: "\uACB0\uC81C\uC644\uB8CC", plan: "Darfin Pro" },
  { id: "INV-202604", date: "2026-04-01", amount: 15e3, status: "\uACB0\uC81C\uC644\uB8CC", plan: "Darfin Pro" }
];
export function MyPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [nickname, setNickname] = useState(MOCK_USER.name);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [customRefundReason, setCustomRefundReason] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([
    { id: "pm_1", provider: "\uC0BC\uC131\uCE74\uB4DC", number: "**** **** **** 1234", isDefault: true, bankCode: "SS" }
  ]);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({ number: "", expiry: "", password: "", birth: "" });
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    toast.success("\uD504\uB85C\uD544 \uC815\uBCF4\uAC00 \uC131\uACF5\uC801\uC73C\uB85C \uC5C5\uB370\uC774\uD2B8 \uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
  };
  const handlePasswordChange = (e) => {
    e.preventDefault();
    toast.success("\uBE44\uBC00\uBC88\uD638\uAC00 \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
  };
  const handleAccountDeletion = () => {
    if (confirm("\uC815\uB9D0\uB85C \uD0C8\uD1F4\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C? \uC774 \uC791\uC5C5\uC740 \uB418\uB3CC\uB9B4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.")) {
      toast.success("\uD68C\uC6D0 \uD0C8\uD1F4 \uCC98\uB9AC\uAC00 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
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
      toast.error("\uC62C\uBC14\uB978 \uCE74\uB4DC \uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.");
      return;
    }
    const newMethod = {
      id: `pm_${Date.now()}`,
      provider: "\uC2E0\uD55C\uCE74\uB4DC",
      number: `**** **** **** ${newCard.number.replace(/\D/g, "").slice(-4)}`,
      isDefault: paymentMethods.length === 0,
      bankCode: "SH"
    };
    setPaymentMethods([...paymentMethods, newMethod]);
    setIsAddCardModalOpen(false);
    setNewCard({ number: "", expiry: "", password: "", birth: "" });
    toast.success("\uC0C8 \uACB0\uC81C \uC218\uB2E8\uC774 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
  };
  const submitRefundRequest = () => {
    if (!refundReason) {
      toast.error("\uD658\uBD88 \uC0AC\uC720\uB97C \uC120\uD0DD\uD574\uC8FC\uC138\uC694.");
      return;
    }
    if (refundReason === "custom" && !customRefundReason.trim()) {
      toast.error("\uC0C1\uC138 \uC0AC\uC720\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.");
      return;
    }
    setIsRefundModalOpen(false);
    toast.success("\uD658\uBD88 \uC2E0\uCCAD\uC774 \uC811\uC218\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB2F4\uB2F9\uC790 \uD655\uC778 \uD6C4 \uC601\uC5C5\uC77C \uAE30\uC900 2~3\uC77C \uB0B4\uC5D0 \uCC98\uB9AC\uB429\uB2C8\uB2E4.");
  };
  const renderProfileTab = () => <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">프로필 관리</h2>
        <div className="flex items-start gap-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 overflow-hidden relative group cursor-pointer hover:bg-slate-200 transition-colors">
              <User size={40} className="group-hover:opacity-0 transition-opacity" />
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageIcon size={20} className="text-slate-600 mb-1" />
                <span className="text-[10px] font-medium text-slate-600">변경</span>
              </div>
            </div>
            <button className="text-sm font-medium text-slate-500 hover:text-slate-900">이미지 삭제</button>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="flex-1 space-y-4 max-w-md">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">이메일 계정 (로그인 ID)</label>
              <input type="email" disabled value={MOCK_USER.email} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm cursor-not-allowed" />
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
            <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
              프로필 저장
            </button>
          </form>
        </div>
      </div>

      <div className="h-px bg-slate-200 w-full" />

      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">보안 및 알림 설정</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md mb-8">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">새 비밀번호</label>
            <input type="password" placeholder="새로운 비밀번호를 입력해주세요" className="w-full h-11 px-4 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">비밀번호 확인</label>
            <input type="password" placeholder="새로운 비밀번호를 다시 입력해주세요" className="w-full h-11 px-4 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 text-sm" />
          </div>
          <button type="submit" className="px-6 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 border border-slate-200 transition-colors">
            비밀번호 변경
          </button>
        </form>

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
        <button onClick={handleAccountDeletion} className="px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-2">
          <LogOut size={16} />
          회원 탈퇴
        </button>
      </div>
    </div>;
  const renderSubscriptionTab = () => {
    const tokenPercentage = MOCK_USER.tokensUsed / MOCK_USER.tokensMax * 100;
    return <div className="space-y-8 animate-in fade-in duration-300">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6">내 구독 모델</h2>
          <div className="p-6 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-2xl text-white shadow-md relative overflow-hidden">
            <div className="absolute -right-10 -top-10 opacity-20">
              <Zap size={160} />
            </div>
            <div className="relative z-10">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm border border-white/30">
                현재 이용중인 플랜
              </span>
              <h3 className="text-3xl font-bold mt-4 mb-1">{MOCK_USER.plan}</h3>
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
                  {MOCK_USER.tokensUsed.toLocaleString()} <span className="text-lg font-medium text-slate-500">/ {MOCK_USER.tokensMax.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                잔여 {(MOCK_USER.tokensMax - MOCK_USER.tokensUsed).toLocaleString()}
              </div>
            </div>
            
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
      className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-1000"
      style={{ width: `${tokenPercentage}%` }}
    />
            </div>
            <p className="text-xs text-slate-400 mt-3">
              매월 1일에 사용량이 초기화됩니다. 초과 사용 시 1,000 토큰당 10원이 과금됩니다.
            </p>
          </div>
        </div>
      </div>;
  };
  const renderBillingTab = () => <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">결제 수단 관리</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => <div key={method.id} className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm flex items-start justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center text-[11px] font-bold text-white">
                  {method.bankCode}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {method.provider}{method.isDefault ? " (\uAE30\uBCF8 \uACB0\uC81C\uC218\uB2E8)" : ""}
                  </div>
                  <div className="text-xs text-slate-500 font-mono tracking-widest mt-1">{method.number}</div>
                </div>
              </div>
              <button
    onClick={() => setPaymentMethods(paymentMethods.filter((m) => m.id !== method.id))}
    className="text-xs font-semibold text-slate-400 hover:text-red-600 p-2 transition-colors"
  >
                삭제
              </button>
            </div>)}

          {
    /* Add New Card */
  }
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
              {MOCK_BILLING_HISTORY.map((item, idx) => <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-600">{item.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{item.plan}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{item.amount.toLocaleString()}원</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md border border-emerald-100">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="영수증 출력">
                      <Receipt size={16} />
                    </button>
                    {idx === 0 && <button
    onClick={() => handleRefundRequest(item.id)}
    className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-colors"
  >
                        환불신청
                      </button>}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
  return <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start">
      {
    /* Sidebar Navigation */
  }
      <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 mb-4 px-2">마이페이지</h1>
        
        <nav className="flex flex-col gap-1">
          <button
    onClick={() => setActiveTab("profile")}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "profile" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}
  >
            <Settings size={18} />
            회원 정보 관리
          </button>
          
          <button
    onClick={() => setActiveTab("subscription")}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "subscription" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}
  >
            <Shield size={18} />
            구독 관리
          </button>
          
          <button
    onClick={() => setActiveTab("billing")}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "billing" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}
  >
            <CreditCard size={18} />
            결제 및 청구
          </button>
        </nav>
      </aside>

      {
    /* Main Content Area */
  }
      <main className="flex-1 w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10 min-h-[600px]">
        {activeTab === "profile" && renderProfileTab()}
        {activeTab === "subscription" && renderSubscriptionTab()}
        {activeTab === "billing" && renderBillingTab()}
      </main>

      {
    /* Add New Card Modal */
  }
      {isAddCardModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">새 결제 수단 추가</h3>
              <button onClick={() => setIsAddCardModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddCardSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">카드 번호</label>
                  <input
    type="text"
    required
    placeholder="0000-0000-0000-0000"
    maxLength={19}
    value={newCard.number}
    onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">유효기간</label>
                    <input
    type="text"
    required
    placeholder="MM/YY"
    maxLength={5}
    value={newCard.expiry}
    onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
  />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">카드 비밀번호</label>
                    <input
    type="password"
    required
    placeholder="앞 2자리"
    maxLength={2}
    value={newCard.password}
    onChange={(e) => setNewCard({ ...newCard, password: e.target.value })}
    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
  />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">생년월일 (또는 사업자번호)</label>
                  <input
    type="text"
    required
    placeholder="YYMMDD"
    maxLength={10}
    value={newCard.birth}
    onChange={(e) => setNewCard({ ...newCard, birth: e.target.value })}
    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
    type="button"
    onClick={() => setIsAddCardModalOpen(false)}
    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
  >
                  취소
                </button>
                <button
    type="submit"
    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
  >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* Refund Modal */
  }
      {isRefundModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">환불 신청</h3>
              <button onClick={() => setIsRefundModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                <p className="text-slate-600 mb-1">결제 번호: <span className="font-semibold text-slate-900">{selectedInvoiceId}</span></p>
                <p className="text-slate-600">환불 접수 후 영업일 기준 2~3일 내에 처리되며, 완료 시 이메일로 안내해 드립니다.</p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-900">환불 사유를 선택해주세요</label>
                
                <div className="space-y-2">
                  {["\uB2E8\uC21C \uBCC0\uC2EC", "\uC11C\uBE44\uC2A4 \uBD88\uB9CC\uC871", "\uD0C0\uC0AC \uC11C\uBE44\uC2A4 \uC774\uC6A9", "\uACB0\uC81C \uC624\uB958 / \uC911\uBCF5 \uACB0\uC81C", "custom"].map((reason) => <label key={reason} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <input
    type="radio"
    name="refundReason"
    value={reason}
    checked={refundReason === reason}
    onChange={(e) => setRefundReason(e.target.value)}
    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 accent-blue-600"
  />
                      <span className="text-sm text-slate-700">{reason === "custom" ? "\uAE30\uD0C0 (\uC9C1\uC811 \uC785\uB825)" : reason}</span>
                    </label>)}
                </div>

                {refundReason === "custom" && <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
                    <textarea
    placeholder="상세 환불 사유를 입력해주세요. (최소 10자 이상)"
    value={customRefundReason}
    onChange={(e) => setCustomRefundReason(e.target.value)}
    rows={3}
    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
  />
                  </div>}
              </div>

              <div className="mt-8 flex gap-3">
                <button
    onClick={() => setIsRefundModalOpen(false)}
    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
  >
                  취소
                </button>
                <button
    onClick={submitRefundRequest}
    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
  >
                  환불 신청하기
                </button>
              </div>
            </div>
          </div>
        </div>}
    </div>;
}
