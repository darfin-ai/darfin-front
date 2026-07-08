// 공시 대분류(검색화면 상단 칩)와 1:1 대응.
// 코드값은 백엔드 disclosure_group.group_code 그대로 사용한다.
export const DISCLOSURE_GROUPS = [
  { code: "PERIODIC" },
  { code: "MAJOR_EVENT" },
  { code: "ISSUANCE" },
  { code: "EQUITY" },
  { code: "OTHER" },
  { code: "AUDIT" },
  { code: "FUND" },
  { code: "ABS" },
  { code: "EXCHANGE" },
  { code: "FTC" },
];

export function getAnalysisCategoryLabel(t, code) {
  const key = `disclosure.categories.${code}`;
  const label = t(key);
  return label === key ? code : label;
}

export function getDisclosureGroupLabel(t, code) {
  const key = `disclosure.groups.${code}`;
  const label = t(key);
  return label === key ? code : label;
}
