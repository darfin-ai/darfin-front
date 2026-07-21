import { useState } from 'react';
import { avatarLabel, avatarGradientForCompany, avatarSeed } from '../lib/avatar';

/**
 * 실제 종목 로고를 시도하고, 없으면(404 등) 기존 그라디언트+이니셜로 폴백한다.
 * 모의투자(paper-trading) 쪽 Avatar 컴포넌트와 동일한 방식(alphasquare 종목 로고 CDN).
 * @param {{ company: import('../../../../mocks/companyAnalysis/types').Company, size?: number, className?: string }} props
 */
export function CompanyAvatar({ company, size = 36, className = '' }) {
  const [imgFailed, setImgFailed] = useState(false);
  const ticker = avatarSeed(company);

  if (!imgFailed && ticker) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={`https://file.alphasquare.co.kr/media/images/stock_logo/kr/${ticker}.png`}
          alt=""
          onError={() => setImgFailed(true)}
          className="h-full w-full object-contain"
        />
      </span>
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ${avatarGradientForCompany(company)} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {avatarLabel(company)}
    </span>
  );
}
