import { createContext, useContext } from 'react';

// DART 패널(SourceExcerptDialog)이 "이 공시 분석 보러가기" 링크의 auto-collect
// 폴백에 쓸 회사명을 얻기 위한 컨텍스트. 9개 패널 각각에 prop을 뚫지 않기 위해 사용.
const CompanyNameContext = createContext(null);

export function CompanyNameProvider({ name, children }) {
  return <CompanyNameContext.Provider value={name}>{children}</CompanyNameContext.Provider>;
}

export function useCompanyName() {
  return useContext(CompanyNameContext);
}
