import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    login();
    toast.success("로그인되었습니다.");
    navigate("/");
  };

  const handleSocialLogin = (provider) => {
    login();
    toast.success(`${provider} 계정으로 로그인합니다.`);
    navigate("/");
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100%',
      background: '#F7F8FA',
      padding: '40px 16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: '#fff',
        border: '0.5px solid #E5E4E7',
        borderRadius: 12,
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          borderBottom: '0.5px solid #E5E4E7',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.01em' }}>
            Darfin
          </span>
          <div style={{ width: '0.5px', height: 14, background: '#E5E4E7' }} />
          <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>로그인</span>
        </div>

        {/* Form body */}
        <div style={{ padding: '24px 24px 20px' }}>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>
                이메일
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={14}
                  style={{
                    position: 'absolute', left: 10, top: '50%',
                    transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none',
                  }}
                />
                <input
                  type="email"
                  required
                  placeholder="hello@darfin.com"
                  style={{
                    width: '100%', padding: '8px 10px 8px 30px',
                    border: '0.5px solid #E5E4E7', borderRadius: 8,
                    fontSize: 13, color: '#1A1A1A', background: '#F7F8FA',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.1s, background 0.1s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = '#E5E4E7'; e.target.style.background = '#F7F8FA'; }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>
                비밀번호
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={14}
                  style={{
                    position: 'absolute', left: 10, top: '50%',
                    transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none',
                  }}
                />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '8px 10px 8px 30px',
                    border: '0.5px solid #E5E4E7', borderRadius: 8,
                    fontSize: 13, color: '#1A1A1A', background: '#F7F8FA',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.1s, background 0.1s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = '#E5E4E7'; e.target.style.background = '#F7F8FA'; }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%', padding: '9px 16px',
                background: '#2563EB', border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 600, color: '#fff',
                cursor: 'pointer', transition: 'background 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1D4ED8'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#2563EB'; }}
            >
              이메일로 로그인
            </button>
          </form>

          {/* Sub-links */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 14 }}>
            <Link to="/forgot-id" style={{ fontSize: 12, color: '#6B7280', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#1A1A1A'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; }}
            >
              아이디 찾기
            </Link>
            <div style={{ width: '0.5px', height: 11, background: '#E5E4E7' }} />
            <Link to="/reset-password" style={{ fontSize: 12, color: '#6B7280', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#1A1A1A'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; }}
            >
              비밀번호 재설정
            </Link>
            <div style={{ width: '0.5px', height: 11, background: '#E5E4E7' }} />
            <Link to="/signup" style={{ fontSize: 12, fontWeight: 600, color: '#2563EB', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#1D4ED8'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#2563EB'; }}
            >
              회원가입
            </Link>
          </div>
        </div>

        {/* Social login */}
        <div style={{ borderTop: '0.5px solid #E5E4E7', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, height: '0.5px', background: '#E5E4E7' }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF', whiteSpace: 'nowrap' }}>또는 소셜 로그인</span>
            <div style={{ flex: 1, height: '0.5px', background: '#E5E4E7' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => handleSocialLogin("카카오")}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '9px 16px', border: '0.5px solid #E5E4E7', borderRadius: 8,
                fontSize: 13, fontWeight: 600, color: '#1A1A1A',
                background: '#FEE500', cursor: 'pointer', transition: 'background 0.1s, border-color 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FDD800'; e.currentTarget.style.borderColor = '#E5C800'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FEE500'; e.currentTarget.style.borderColor = '#E5E4E7'; }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3C6.48 3 2 6.54 2 10.91c0 2.8 1.83 5.25 4.6 6.64-.23.83-.83 3.05-.86 3.19-.04.16.07.2.18.13.15-.09 3.45-2.3 4.88-3.32.39.04.79.06 1.2.06 5.52 0 10-3.54 10-7.91S17.52 3 12 3z" fill="#000000" />
              </svg>
              카카오 로그인
            </button>

            <button
              onClick={() => handleSocialLogin("구글")}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '9px 16px', border: '0.5px solid #E5E4E7', borderRadius: 8,
                fontSize: 13, fontWeight: 500, color: '#1A1A1A',
                background: '#F7F8FA', cursor: 'pointer', transition: 'background 0.1s, border-color 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#C7D2FE'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F7F8FA'; e.currentTarget.style.borderColor = '#E5E4E7'; }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              구글 로그인
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
