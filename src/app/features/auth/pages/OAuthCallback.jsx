import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export function OAuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const error = params.get('error');     // 백엔드가 에러 시 redirect: ?error=메시지

    if (accessToken && refreshToken) {
      login({ accessToken, refreshToken });
      toast.success('로그인되었습니다.');
      navigate('/', { replace: true });
    } else {
      const msg = error
        ? decodeURIComponent(error)
        : '소셜 로그인에 실패했습니다. 다시 시도해주세요.';
      toast.error(msg);
      navigate('/login', { replace: true });
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">로그인 처리 중...</p>
      </div>
    </div>
  );
}
