import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { User, Mail, Lock, Phone, MessageSquare, Image as ImageIcon } from "lucide-react";
import { signup } from "../../../shared/api/authApi";

export function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', nickname: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

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
    reader.onload = (ev) => setProfileImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      await signup({
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
        nickname: form.nickname,
        profileImage,
      });
      toast.success('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    } catch (err) {
      const msg = err?.message || (err?.status === 409 ? '이미 사용 중인 이메일입니다.' : '회원가입에 실패했습니다.');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">회원가입</h1>
          <p className="text-sm text-slate-500">darfin과 함께 새로운 투자 여정을 시작하세요.</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="flex flex-col items-center gap-2 mb-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 overflow-hidden relative group cursor-pointer hover:bg-slate-200 transition-colors"
            >
              {profileImage ? (
                <img src={profileImage} alt="프로필 미리보기" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="group-hover:opacity-0 transition-opacity" />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-full">
                <ImageIcon size={18} className="text-white mb-0.5" />
                <span className="text-[10px] font-medium text-white">{profileImage ? '변경' : '업로드'}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">프로필 사진 (선택, 미설정 시 기본 이미지 사용)</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">이름</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={form.name}
                onChange={set('name')}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50"
                placeholder="홍길동"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">닉네임</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MessageSquare className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={form.nickname}
                onChange={set('nickname')}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50"
                placeholder="커뮤니티에서 사용할 닉네임"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">전화번호</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={set('phone')}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50"
                placeholder="010-0000-0000"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">이메일</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={form.email}
                onChange={set('email')}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50"
                placeholder="hello@darfin.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">비밀번호</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                required
                value={form.password}
                onChange={set('password')}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50"
                placeholder="8자리 이상 영문, 숫자, 특수문자"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">비밀번호 확인</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-1 bg-slate-50 ${
                  form.confirmPassword && form.password !== form.confirmPassword
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="비밀번호를 다시 한 번 입력해주세요"
              />
            </div>
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">비밀번호가 일치하지 않습니다.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 mt-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? '처리 중...' : '가입하기'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
