import { Link } from "react-router";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
export function ResetPassword() {
  const handleReset = (e) => {
    e.preventDefault();
    toast.success("\uBE44\uBC00\uBC88\uD638 \uC7AC\uC124\uC815 \uB9C1\uD06C\uB97C \uC774\uBA54\uC77C\uB85C \uBC1C\uC1A1\uD588\uC2B5\uB2C8\uB2E4.");
  };
  return <div className="flex flex-col items-center justify-center py-12 animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative">
        <Link to="/login" className="absolute left-6 top-6 p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        
        <div className="text-center mb-8 mt-2">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">비밀번호 재설정</h1>
          <p className="text-sm text-slate-500">가입하신 이메일로 비밀번호 재설정 링크를 보내드립니다.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">이메일</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
    type="email"
    required
    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50"
    placeholder="가입 시 등록한 이메일 주소"
  />
            </div>
          </div>

          <button
    type="submit"
    className="w-full py-2.5 px-4 mt-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
  >
            재설정 링크 전송
          </button>
        </form>
      </div>
    </div>;
}
