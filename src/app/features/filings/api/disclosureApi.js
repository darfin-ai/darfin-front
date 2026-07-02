// 공시 통합검색 + 상세조회 API 클라이언트.
// 백엔드: Spring Boot (com.darfin.controller.DisclosureSearchController 등)
// 검색은 disclosure + stock + disclosure_type + ai_summary_result를 JOIN한 결과를
// 페이지 단위로 받아온다(서버 사이드 정렬·페이지네이션).

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? "http://localhost:8080";

/**
 * 공시 통합검색 (DART 자동 수집 포함).
 * GET /api/disclosures?companyName=&dateFrom=&dateTo=&typeCodes=&sortKey=&sortDirection=&page=&size=
 *
 * 서버에서 companyName+dateFrom+dateTo로 아직 DB에 수집된 공시가 없으면 DART에서
 * 자동으로 한 번 수집(UPSERT)한 뒤 검색 결과를 내려준다. 이미 수집되어 있으면
 * DART 호출 없이 DB 조회만 수행하므로, 같은 조건으로 다시 검색하면 빨라진다.
 *
 * @param {object} params
 * @param {string} params.companyName - 기업명 또는 종목코드
 * @param {Date|null} params.dateFrom
 * @param {Date|null} params.dateTo
 * @param {string[]} params.typeCodes - 빈 배열이면 전체 유형
 * @param {string|null} params.sortKey - "date" | "type" | "title" | "risk"
 * @param {string} params.sortDirection - "asc" | "desc"
 * @param {number} params.page - 0부터 시작
 * @param {number} params.size
 * @returns {Promise<{
 *   collected: boolean,
 *   savedStockCount: number|null,
 *   savedDisclosureCount: number|null,
 *   results: { content: object[], totalElements: number, totalPages: number }
 * }>}
 */
export async function searchDisclosures({
  companyName,
  dateFrom,
  dateTo,
  typeCodes = [],
  sortKey,
  sortDirection = "desc",
  page = 0,
  size = 5
}) {
  const query = new URLSearchParams();

  if (companyName) query.set("companyName", companyName);
  if (dateFrom) query.set("dateFrom", toDateOnly(dateFrom));
  if (dateTo) query.set("dateTo", toDateOnly(dateTo));
  if (typeCodes.length > 0) query.set("typeCodes", typeCodes.join(","));
  if (sortKey) query.set("sortKey", sortKey);
  query.set("sortDirection", sortDirection);
  query.set("page", String(page));
  query.set("size", String(size));

  const response = await fetch(`${API_BASE_URL}/api/disclosures?${query.toString()}`);

  if (!response.ok) {
    throw new Error(`공시 검색에 실패했습니다 (HTTP ${response.status})`);
  }

  return response.json();
}

/**
 * 공시 상세조회.
 * GET /api/disclosures/{rceptNo}
 * 원문(document), 요약(summary/glossary), 분석(analysisItems)을 한 번에 받아온다.
 *
 * @param {string} rceptNo - DART 접수번호
 */
export async function getDisclosureDetail(rceptNo) {
  const response = await fetch(`${API_BASE_URL}/api/disclosures/${encodeURIComponent(rceptNo)}`);

  if (!response.ok) {
    throw new Error(`공시 상세 정보를 불러오지 못했습니다 (HTTP ${response.status})`);
  }

  return response.json();
}

/**
 * 공시 원문에서 전문용어 위치 목록 조회.
 * GET /api/disclosures/{rceptNo}/terms
 * 첫 호출 시 dictionary_term 전체를 원문에서 찾아 dictionary_highlight에 저장하고,
 * 이후 호출은 DB에서 바로 반환한다(캐시).
 * 반환: [{ termId, term, category, definition, startIndex, endIndex }, ...]
 */
export async function getDisclosureTerms(rceptNo) {
  const response = await fetch(`${API_BASE_URL}/api/disclosures/${encodeURIComponent(rceptNo)}/terms`);
  if (!response.ok) {
    throw new Error(`전문용어 목록을 불러오지 못했습니다 (HTTP ${response.status})`);
  }
  return response.json(); // TermHighlightDto[]
}

/**
 * DART 공시 원문 ZIP 다운로드.
 * GET /api/disclosures/{rceptNo}/download-zip
 * Spring이 Python /dart/document/{rcept_no}/zip 을 프록시해서 ZIP을 스트리밍한다.
 * DART API가 실제로 제공하는 파일은 ZIP(HWP 변환 XML 포함)이며 PDF는 API로 제공되지 않는다.
 *
 * @param {string} rceptNo
 */
export async function downloadDisclosureZip(rceptNo) {
  const response = await fetch(`${API_BASE_URL}/api/disclosures/${encodeURIComponent(rceptNo)}/download-zip`);

  if (!response.ok) {
    throw new Error(`원문 ZIP 다운로드에 실패했습니다 (HTTP ${response.status})`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${rceptNo}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * DART 공식 뷰어 URL 반환.
 * https://dart.fss.or.kr/dsaf001/main.do?rcpNo={rceptNo}
 * DART 공식 페이지에서 HWP/PDF 형태로 원문을 열람할 수 있다.
 *
 * @param {string} rceptNo
 * @returns {string}
 */
export function getDartViewerUrl(rceptNo) {
  return `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${encodeURIComponent(rceptNo)}`;
}

/**
 * 공시 원문 다운로드 트리거.
 * GET /api/disclosures/{rceptNo}/download
 * 서버가 raw_zip_path를 스트리밍으로 내려준다고 가정하고, 브라우저 다운로드를 그대로 띄운다.
 */
export async function downloadDisclosureOriginal(rceptNo) {
  const response = await fetch(`${API_BASE_URL}/api/disclosures/${encodeURIComponent(rceptNo)}/download`);

  if (!response.ok) {
    throw new Error(`원문 다운로드에 실패했습니다 (HTTP ${response.status})`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${rceptNo}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * 공시 원문 평문 조회.
 * GET /api/disclosures/{rceptNo}/original-text
 * DART document.xml에서 태그를 제거한 평문을 받아온다. DisclosureViewer.jsx 좌측 "공시 원문" 탭에
 * 표시하고, 그대로 generateSummary/generateAnalysis의 입력(dartContext/dartFullText)으로 재사용한다.
 *
 * @param {string} rceptNo
 * @returns {Promise<{ success: boolean, text: string|null, errorMessage: string|null }>}
 */
export async function getDisclosureOriginalText(rceptNo) {
  const response = await fetch(`${API_BASE_URL}/api/disclosures/${encodeURIComponent(rceptNo)}/original-text`);
  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(data?.errorMessage ?? `공시 원문을 불러오지 못했습니다 (HTTP ${response.status})`);
  }

  return data;
}

/**
 * AI 요약 생성("압축 -> 요약하기"). 이미 DB에 저장된 요약이 있으면 그대로 반환한다(서버 측 캐시).
 * POST /api/summary
 *
 * @param {object} params
 * @param {string} params.rceptNo
 * @param {string} params.corpName
 * @param {string} params.dartContext - getDisclosureOriginalText로 받은 원문 평문
 */
export async function generateSummary({ rceptNo, corpName, dartContext }) {
  const response = await fetch(`${API_BASE_URL}/api/summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rceptNo, corpName, dartContext })
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    throw new Error(data?.error ?? data?.errorMessage ?? `AI 요약 생성에 실패했습니다 (HTTP ${response.status})`);
  }

  return data;
}

/**
 * AI 핵심 분석 생성("압축 -> 분석하기"). 재호출 시 서버가 기존 분석결과를 지우고 새로 채운다.
 * POST /api/analysis
 *
 * @param {object} params
 * @param {string} params.rceptNo
 * @param {string} params.corpName
 * @param {string} params.dartFullText - getDisclosureOriginalText로 받은 원문 평문(압축하지 않은 전체)
 */
export async function generateAnalysis({ rceptNo, corpName, dartFullText }) {
  const response = await fetch(`${API_BASE_URL}/api/analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rceptNo, corpName, dartFullText })
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    throw new Error(data?.error ?? data?.errorMessage ?? `AI 핵심 분석 생성에 실패했습니다 (HTTP ${response.status})`);
  }

  return data;
}

function toDateOnly(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
