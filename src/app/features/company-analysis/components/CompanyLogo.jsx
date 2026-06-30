import { useState } from 'react';

const AVATAR_COLORS = {
  blue:   { bg: '#E6F1FB', text: '#185FA5' },
  teal:   { bg: '#E1F5EE', text: '#0F6E56' },
  amber:  { bg: '#FAEEDA', text: '#854F0B' },
  purple: { bg: '#EEEDFE', text: '#534AB7' },
  coral:  { bg: '#FAECE7', text: '#993C1D' },
};

export function CompanyLogo({ corpCode, initials, colorKey, size = 34, radius = 8 }) {
  const [imgFailed, setImgFailed] = useState(false);
  const avatar = AVATAR_COLORS[colorKey] ?? AVATAR_COLORS.blue;
  const logoUrl = `https://file.alphasquare.co.kr/media/images/stock_logo/kr/${corpCode}.png`;

  if (!imgFailed) {
    return (
      <div style={{
        width: size, height: size, borderRadius: radius, flexShrink: 0,
        background: '#F2F4F6', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img
          src={logoUrl}
          alt={initials}
          onError={() => setImgFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      backgroundColor: avatar.bg, color: avatar.text,
      fontSize: Math.round(size * 0.32), fontWeight: 700, letterSpacing: '0.02em',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {initials}
    </div>
  );
}