import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { resetPassword } from "../../../shared/api/authApi";

export function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword({ email });
      setSent(true);
    } catch (err) {
      const msg = err?.status === 404 ? '입력하신 이메일로 가입된 계정을 찾을 수 없습니다.' : (err?.message || '비밀번호 재설정에 실패했습니다.');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative">
        <Link to="/login" className="absolute left-6 top-6 p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>

        <div className="text-center mb-8 mt-2">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">비밀번호 재설정</h1>
          <p className="text-sm text-slate-500">가입하신 이메일로 임시 비밀번호를 보내드립니다.</p>
        </div>

        {!sent ? (
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50"
                  placeholder="가입 시 등록한 이메일 주소"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 mt-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? '발송 중...' : '임시 비밀번호 발송'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-green-600" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">이메일을 발송했습니다</p>
              <p className="text-sm text-slate-500">
                <span className="font-medium text-slate-700">{email}</span>으로<br />
                임시 비밀번호를 보내드렸습니다.<br />
                로그인 후 반드시 비밀번호를 변경해주세요.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-block mt-4 w-full py-2.5 text-center bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              로그인하기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
