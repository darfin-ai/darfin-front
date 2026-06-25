import { useState } from "react";
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
  X,
  Plus,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
const MOCK_USER = {
  name: "\uAE40\uB2E4\uD540",
  email: "user@darfin.com",
  currentPlan: "Darfin Pro",
  nextBillingDate: "2026-07-01"
};
const PLANS = [
  {
    id: "free",
    name: "Darfin Basic",
    price: 0,
    priceText: "\uBB34\uB8CC",
    period: "\uC601\uAD6C",
    description: "\uAC00\uBCBC\uC6B4 \uAE30\uC5C5 \uBD84\uC11D\uC774 \uD544\uC694\uD55C \uAC1C\uC778 \uD22C\uC790\uC790",
    features: [
      "\uC6D4 5\uD68C \uAE30\uC5C5 AI \uBD84\uC11D \uB9AC\uD3EC\uD2B8",
      "\uAE30\uBCF8 \uACF5\uC2DC \uC5F4\uB78C",
      "\uC2E4\uC2DC\uAC04 \uC8FC\uAC00 \uC870\uD68C",
      "\uCEE4\uBBA4\uB2C8\uD2F0 \uC77D\uAE30 \uAD8C\uD55C"
    ],
    recommended: false
  },
  {
    id: "pro",
    name: "Darfin Pro",
    price: 15e3,
    priceText: "15,000\uC6D0",
    period: "\uC6D4",
    description: "\uC804\uBB38\uC801\uC778 \uB525\uB2E4\uC774\uBE0C \uBD84\uC11D\uC774 \uD544\uC694\uD55C \uD22C\uC790\uC790",
    features: [
      "\uBB34\uC81C\uD55C \uAE30\uC5C5 AI \uBD84\uC11D \uB9AC\uD3EC\uD2B8",
      "\uC804\uBB38\uC6A9\uC5B4 \uD480\uC774 \uBC0F \uACF5\uC2DC \uD558\uC774\uB77C\uC774\uD2B8 \uD1A0\uAE00",
      "\uAD00\uC2EC \uAE30\uC5C5 \uC2E4\uC2DC\uAC04 \uC54C\uB9BC",
      "\uCEE4\uBBA4\uB2C8\uD2F0 \uC77D\uAE30/\uC4F0\uAE30 \uAD8C\uD55C",
      "\uBAA8\uC758\uD22C\uC790 \uAE30\uB2A5 \uBB34\uC81C\uD55C \uC0AC\uC6A9"
    ],
    recommended: true
  },
  {
    id: "enterprise",
    name: "Darfin Enterprise",
    price: 49e3,
    priceText: "49,000\uC6D0",
    period: "\uC6D4",
    description: "\uB370\uC774\uD130 \uAE30\uBC18\uC758 \uC758\uC0AC\uACB0\uC815\uC774 \uD544\uC694\uD55C \uAE30\uAD00/\uBC95\uC778",
    features: [
      "Pro \uAE30\uB2A5 \uBAA8\uB450 \uD3EC\uD568",
      "API \uC5F0\uB3D9 \uBC0F \uB370\uC774\uD130 \uB0B4\uBCF4\uB0B4\uAE30",
      "\uAE30\uC5C5 \uBD84\uC11D \uB9AC\uD3EC\uD2B8 PDF \uB2E4\uC6B4\uB85C\uB4DC",
      "1:1 \uC804\uB2F4 \uC560\uB110\uB9AC\uC2A4\uD2B8 Q&A",
      "\uC0AC\uC6A9\uC790 \uB9DE\uCDA4\uD615 \uB300\uC2DC\uBCF4\uB4DC \uCEE4\uC2A4\uD140"
    ],
    recommended: false
  }
];
export function SubscriptionManagement() {
  const [selectedPlanId, setSelectedPlanId] = useState("pro");
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([
    { id: "pm_1", provider: "\uAD6D\uBBFC\uCE74\uB4DC", number: "**** **** **** 1234", isDefault: true, bankCode: "KB" }
  ]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [newCard, setNewCard] = useState({ number: "", expiry: "", password: "", birth: "" });
  const handlePlanChange = () => {
    const selectedPlan2 = PLANS.find((p) => p.id === selectedPlanId);
    if (selectedPlan2?.price === 0) {
      setIsChangingPlan(true);
      setTimeout(() => {
        setIsChangingPlan(false);
        toast.success(`Darfin Basic \uD50C\uB79C\uC73C\uB85C \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4.`);
      }, 1e3);
    } else {
      setIsPaymentModalOpen(true);
    }
  };
  const processTossPayment = () => {
    setIsChangingPlan(true);
    setTimeout(() => {
      setIsChangingPlan(false);
      setIsPaymentModalOpen(false);
      toast.success(`\uACB0\uC81C\uAC00 \uC131\uACF5\uC801\uC73C\uB85C \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. (${PLANS.find((p) => p.id === selectedPlanId)?.name})`);
    }, 2e3);
  };
  const handleCancelSubscription = () => {
    if (confirm("\uC815\uB9D0\uB85C \uAD6C\uB3C5\uC744 \uD574\uC9C0\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C? \uC774\uBC88 \uACB0\uC81C \uC8FC\uAE30(2026-07-01)\uAE4C\uC9C0\uB294 \uD61C\uD0DD\uC774 \uC720\uC9C0\uB429\uB2C8\uB2E4.")) {
      toast.success("\uAD6C\uB3C5\uC774 \uD574\uC9C0\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
    }
  };
  const handleAddCardSubmit = (e) => {
    e.preventDefault();
    if (newCard.number.length < 14) {
      toast.error("\uC62C\uBC14\uB978 \uCE74\uB4DC \uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.");
      return;
    }
    const newMethod = {
      id: `pm_${Date.now()}`,
      provider: "\uC2E0\uD55C\uCE74\uB4DC",
      // Mocking provider detection
      number: `**** **** **** ${newCard.number.slice(-4)}`,
      isDefault: paymentMethods.length === 0,
      bankCode: "SH"
    };
    setPaymentMethods([...paymentMethods, newMethod]);
    setIsAddCardModalOpen(false);
    setNewCard({ number: "", expiry: "", password: "", birth: "" });
    toast.success("\uC0C8 \uACB0\uC81C \uC218\uB2E8\uC774 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
  };
  const defaultMethod = paymentMethods.find((m) => m.isDefault) || paymentMethods[0];
  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId);
  return <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        
        {
    /* Left Column: Current Status & Payment Info */
  }
        <div className="lg:col-span-1 space-y-6">
          {
    /* Current Status Card */
  }
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">이용 중인 플랜</h2>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-200">
                <CheckCircle2 size={14} /> 활성 상태
              </span>
            </div>
            <div className="mb-4">
              <span className="text-2xl font-extrabold text-slate-900">{MOCK_USER.currentPlan}</span>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar size={16} className="text-slate-400" />
                <span>다음 결제일: <strong className="text-slate-900">{MOCK_USER.nextBillingDate}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CreditCard size={16} className="text-slate-400" />
                <span>결제 수단: <strong className="text-slate-900">{defaultMethod ? `${defaultMethod.provider} ${defaultMethod.number}` : "\uB4F1\uB85D\uB41C \uC218\uB2E8 \uC5C6\uC74C"}</strong></span>
              </div>
            </div>

            <button
    onClick={handleCancelSubscription}
    className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-bold rounded-xl border border-slate-200 transition-colors"
  >
              구독 해지하기
            </button>
          </div>

          {
    /* Payment Method Management */
  }
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-600" />
              결제 수단 관리
            </h2>
            
            <div className="space-y-3 mb-4">
              {paymentMethods.map((method) => <div key={method.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-slate-200 rounded flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {method.bankCode}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{method.provider}</p>
                      <p className="text-xs text-slate-500">{method.number}</p>
                    </div>
                  </div>
                  {method.isDefault && <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded">기본</span>}
                </div>)}
              {paymentMethods.length === 0 && <p className="text-sm text-slate-500 text-center py-4">등록된 결제 수단이 없습니다.</p>}
            </div>

            <button
    onClick={() => setIsAddCardModalOpen(true)}
    className="w-full py-2 text-sm font-bold text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 rounded-xl transition-colors border-dashed flex items-center justify-center gap-1"
  >
              <Plus size={16} /> 새 결제 수단 추가
            </button>
          </div>
        </div>

        {
    /* Right Column: Plan Selection */
  }
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">플랜 변경</h2>
            
            <div className="space-y-4 mb-8">
              {PLANS.map((plan) => <label
    key={plan.id}
    className={`block relative cursor-pointer transition-all duration-200 rounded-2xl border-2 p-5 ${selectedPlanId === plan.id ? "border-blue-600 bg-blue-50/30 shadow-md ring-1 ring-blue-600 ring-opacity-50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"}`}
  >
                  <input
    type="radio"
    name="plan"
    value={plan.id}
    checked={selectedPlanId === plan.id}
    onChange={() => setSelectedPlanId(plan.id)}
    className="sr-only"
  />
                  
                  {plan.recommended && <div className="absolute -top-3 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Zap size={10} /> 추천
                    </div>}

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${selectedPlanId === plan.id ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"}`}>
                          {selectedPlanId === plan.id && <Check size={12} className="text-white" />}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                        {plan.id === "pro" && selectedPlanId !== "pro" && MOCK_USER.currentPlan === "Darfin Pro" && <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">현재 플랜</span>}
                      </div>
                      <p className="text-sm text-slate-500 ml-8">{plan.description}</p>
                    </div>
                    
                    <div className="text-left md:text-right ml-8 md:ml-0">
                      <div className="flex items-baseline gap-1 md:justify-end">
                        <span className="text-2xl font-extrabold text-slate-900">{plan.priceText}</span>
                        {plan.price !== 0 && <span className="text-sm text-slate-500 font-medium">/{plan.period}</span>}
                      </div>
                    </div>
                  </div>

                  {
    /* Feature List (Expands slightly when selected) */
  }
                  <div className={`mt-4 ml-8 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 transition-all duration-300 ${selectedPlanId === plan.id ? "opacity-100 h-auto" : "opacity-70 h-auto"}`}>
                    {plan.features.map((feature, idx) => <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 size={16} className={`flex-shrink-0 mt-0.5 ${selectedPlanId === plan.id ? "text-blue-500" : "text-slate-400"}`} />
                        <span className="leading-tight">{feature}</span>
                      </div>)}
                  </div>
                </label>)}
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6 flex gap-3">
              <Info size={20} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-600">
                <p className="font-bold text-slate-800 mb-1">결제 및 환불 안내</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>플랜 변경 시, 남은 기간에 대한 금액은 일할 계산되어 다음 결제일에 차감/청구됩니다.</li>
                  <li>결제 후 7일 이내, 서비스 사용 이력이 없는 경우에 한해 100% 환불이 가능합니다.</li>
                  <li>구독 해지 시, 결제된 기간까지는 정상적으로 서비스를 이용하실 수 있습니다.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
    onClick={handlePlanChange}
    disabled={isChangingPlan || selectedPlanId === "pro" && MOCK_USER.currentPlan === "Darfin Pro"}
    className={`px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all ${isChangingPlan ? "bg-slate-400 cursor-not-allowed" : selectedPlanId === "pro" && MOCK_USER.currentPlan === "Darfin Pro" ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow"}`}
  >
                {isChangingPlan ? "\uCC98\uB9AC \uC911..." : selectedPlanId === "pro" && MOCK_USER.currentPlan === "Darfin Pro" ? "\uD604\uC7AC \uC774\uC6A9 \uC911\uC778 \uD50C\uB79C\uC785\uB2C8\uB2E4" : `\uC120\uD0DD\uD55C \uD50C\uB79C\uC73C\uB85C ${selectedPlanId === "free" ? "\uBCC0\uACBD" : "\uACB0\uC81C"}\uD558\uAE30`}
                {!isChangingPlan && selectedPlanId !== "pro" && <ArrowRight size={18} />}
              </button>
            </div>
          </div>
        </div>

      </div>

      {
    /* Toss Payments Mock Modal */
  }
      {isPaymentModalOpen && selectedPlan && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            {
    /* Header */
  }
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
                <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                  <span className="text-white text-xs">toss</span>
                </div>
                토스페이먼츠
              </div>
              <button onClick={() => !isChangingPlan && setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            {
    /* Body */
  }
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-sm text-slate-500 mb-1">{selectedPlan.name} 플랜 결제</p>
                <h3 className="text-3xl font-extrabold text-slate-900">{selectedPlan.price.toLocaleString()}원</h3>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 border border-blue-500 rounded-xl bg-blue-50/30 ring-1 ring-blue-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-900">결제 수단</span>
                    <button onClick={() => {
    setIsPaymentModalOpen(false);
    setIsAddCardModalOpen(true);
  }} className="text-xs font-bold text-blue-600 hover:underline">다른 수단 추가</button>
                  </div>
                  {defaultMethod ? <div className="flex items-center gap-3">
                      <div className="w-10 h-6 bg-slate-200 rounded flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {defaultMethod.bankCode}
                      </div>
                      <span className="text-sm text-slate-700">{defaultMethod.provider} {defaultMethod.number}</span>
                    </div> : <p className="text-sm text-slate-500">등록된 결제 수단이 없습니다.</p>}
                </div>
              </div>

              <div className="flex items-start gap-2 mb-6">
                <input type="checkbox" id="terms" defaultChecked className="mt-1 accent-blue-600 rounded text-blue-600 focus:ring-blue-500" />
                <label htmlFor="terms" className="text-xs text-slate-500 leading-tight">
                  전자금융거래 기본약관, 개인정보 수집 및 이용 동의, 개인정보 제3자 제공 동의, 자동결제(빌링) 서비스 약관에 모두 동의합니다.
                </label>
              </div>

              <button
    onClick={processTossPayment}
    disabled={isChangingPlan || !defaultMethod}
    className={`w-full py-3.5 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-colors ${isChangingPlan || !defaultMethod ? "bg-blue-300 text-white cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"}`}
  >
                {isChangingPlan ? <>
                    <Loader2 className="animate-spin" size={20} />
                    결제 진행 중...
                  </> : `${selectedPlan.price.toLocaleString()}\uC6D0 \uACB0\uC81C\uD558\uAE30`}
              </button>
              {!defaultMethod && <p className="text-center text-xs text-red-500 mt-2">결제 수단을 먼저 추가해주세요.</p>}
            </div>
            
            <div className="bg-slate-50 py-3 px-6 text-center border-t border-slate-100">
              <p className="text-[10px] text-slate-400">
                실제 결제는 이루어지지 않는 Toss Payments 시뮬레이션 환경입니다.
              </p>
            </div>
          </div>
        </div>}

      {
    /* Add New Card Modal */
  }
      {isAddCardModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">새 결제 수단 추가</h3>
              <button onClick={() => setIsAddCardModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddCardSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">카드 번호</label>
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">유효기간</label>
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">카드 비밀번호</label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">생년월일 (또는 사업자번호)</label>
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
    </div>;
}
