import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { computePosition, offset, flip, shift, hide, autoUpdate } from "@floating-ui/dom";
import { getAnalysisCategoryLabel } from "../constants";
import { useLocale } from "@/app/shared/i18n";

// ── 하이라이트 마스크 빌더 ─────────────────────────────────────
// AI 분석 항목(charOffset 기반)과 전문용어(startIndex 기반)를 원문 전체(text) 길이의
// 마스크 배열 하나로 병합한다. 좌표계는 항상 원문 전체 기준이며, 문단/표/제목 블록은
// 이 마스크의 일부 구간을 sliceToSegments로 잘라서 사용한다.
// 우선순위: 두 종류가 겹치면 highlight > term (AI 분석 우선).
// 전문용어는 termId 기준으로 원문에서 첫 번째 등장 위치에만 밑줄을 친다.
export function buildHighlightMask(text, analysisItems, termHighlights, showHighlight, showTerms) {
  const mask = new Array(text.length).fill(null); // null | { type:"highlight", item } | { type:"term", th }

  if (showHighlight) {
    for (const item of analysisItems) {
      const s = item.charOffsetStart, e = item.charOffsetEnd;
      if (s >= 0 && e > s && e <= text.length) {
        for (let i = s; i < e; i++) {
          if (mask[i] === null) mask[i] = { type: "highlight", item };
        }
      }
    }
  }

  // 전문용어 밑줄 — termId 기준 첫 번째 등장 위치에만 적용
  if (showTerms) {
    const seenTermIds = new Set();
    const sortedTerms = [...termHighlights].sort((a, b) => a.startIndex - b.startIndex);
    for (const th of sortedTerms) {
      if (seenTermIds.has(th.termId)) continue;
      const s = th.startIndex, e = th.endIndex;
      if (s >= 0 && e > s && e <= text.length) {
        for (let i = s; i < e; i++) {
          if (mask[i] === null) mask[i] = { type: "term", th };
        }
        seenTermIds.add(th.termId);
      }
    }
  }

  return mask;
}

// mask의 [start, end) 구간을 연속 세그먼트 배열로 변환한다.
// 타입: "plain" | "highlight"(AI 핵심 문장) | "term"(전문용어)
// 방어적 처리: end/start가 마스크·텍스트 길이를 벗어나도(offset 드리프트·스테일 캐시 등)
// 크래시 없이 안전하게 자른다. mask 셀의 null/undefined는 모두 plain으로 취급한다.
export function sliceToSegments(text, mask, start, end) {
  const segments = [];
  const hi = Math.min(end, mask.length, text.length);
  let i = Math.max(0, start);
  while (i < hi) {
    const cell = mask[i];
    if (!cell) {
      let j = i + 1;
      while (j < hi && !mask[j]) j++;
      segments.push({ type: "plain", text: text.slice(i, j) });
      i = j;
    } else if (cell.type === "highlight") {
      const item = cell.item;
      let j = i + 1;
      while (j < hi && mask[j] && mask[j].type === "highlight" && mask[j].item === item) j++;
      segments.push({ type: "highlight", text: text.slice(i, j), item });
      i = j;
    } else {
      const th = cell.th;
      let j = i + 1;
      while (j < hi && mask[j] && mask[j].type === "term" && mask[j].th === th) j++;
      segments.push({ type: "term", text: text.slice(i, j), th });
      i = j;
    }
  }
  return segments;
}

// ── 표 variant 판정 (개선 2: 유형이 아니라 "셀 내용" 기준) ──────────
// 셀 하나의 평문. 중첩 표는 숫자 판정에서 제외(빈 문자열 취급)한다.
function cellPlainText(cell) {
  return (cell.blocks || [])
    .map((b) => (b.type === "table" ? "" : b.text || ""))
    .join(" ")
    .trim();
}

// 재무/실적표의 숫자 셀 형태: 앞의 음수기호(△▲▼-()), 천단위 콤마, 소수, 뒤의 %·)까지 허용.
const NUMERIC_CELL_RE = /^\s*[(△▲▼\-]?\s*[\d,]+(?:\.\d+)?\s*[)%]?\s*$/;
function isNumericText(s) {
  const t = (s || "").trim();
  if (!t || t === "-" || t === "–" || t === "—") return false; // "없음" 표시용 대시는 숫자 아님
  return NUMERIC_CELL_RE.test(t);
}

// 표 유형을 셀 내용만 보고 추정한다.
//  - financial: 숫자 셀 비중이 높은 재무/실적표 → 숫자 우측정렬
//  - form     : 2열 "항목명 : 값" 폼(주요사항보고·거래소 조회공시류) → 좌측 라벨 강조
//  - default  : 그 외 일반 표 → 기존 스타일 유지
function detectTableVariant(rows) {
  let numeric = 0, nonEmpty = 0;
  for (const row of rows) {
    for (const cell of row) {
      const t = cellPlainText(cell);
      if (!t) continue;
      nonEmpty++;
      if (isNumericText(t)) numeric++;
    }
  }
  const maxCols = rows.reduce((m, r) => Math.max(m, r.length), 0);

  if (nonEmpty > 0 && numeric / nonEmpty >= 0.35 && rows.length >= 2 && maxCols >= 2) {
    return "financial";
  }
  const twoColRows = rows.filter((r) => r.length === 2).length;
  if (maxCols === 2 && rows.length >= 2 && twoColRows >= Math.ceil(rows.length * 0.7)) {
    return "form";
  }
  return "default";
}

// ── 제목(heading) 스타일 (개선 1) ────────────────────────────────
// 레벨(1=장, 2=절, 3=항)에 따라 크기·굵기·색을 모두 달리해 위계가 한눈에 구분되게 한다.
// 첫 제목은 상단 여백을 없애고, 각 레벨은 위아래 여백으로 문서 리듬을 만든다.
const HEADING_CLASS = {
  1: "text-base font-bold text-slate-900 mt-7 mb-3 pb-2 border-b border-slate-200 first:mt-0",
  2: "text-sm font-bold text-slate-800 mt-6 mb-2 first:mt-0",
  3: "text-[13px] font-semibold text-slate-500 mt-4 mb-1.5 first:mt-0",
};

// ── 툴팁 (싱글톤 + 이벤트 위임) ────────────────────────────────────
// 화면에 실제로 떠 있는 툴팁은 언제나 최대 1개(마우스는 한 곳만)이므로, span마다 툴팁을
// 붙이는 대신 문서 전체에 단 하나의 툴팁 인스턴스만 두고, hover/focus된 노드의 data 속성으로
// 조회한 데이터만 주입한다. 순수 정보 표시용이라 pointer-events:none으로 상호작용은 받지 않는다.

const TOOLTIP_ID = "odoc-tooltip";

// 위험도 tier -> 칩 색상 (분석 하이라이트 툴팁용)
const RISK_CHIP_CLASS = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Neutral: "bg-slate-100 text-slate-600",
  Low: "bg-emerald-100 text-emerald-700",
};

// 주입 데이터(kind로 분기)를 툴팁 본문 노드로 변환한다. 순수 함수라 모듈 스코프에 둔다.
function renderTooltipBody(info, getCategoryLabel) {
  if (info.kind === "term") {
    const t = info.data;
    return (
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-sm font-semibold text-blue-800">{t.term}</span>
          {t.category && (
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
              {t.category}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">{t.definition}</p>
      </div>
    );
  }

  const it = info.data;
  const chip = RISK_CHIP_CLASS[it.riskTier] ?? "bg-slate-100 text-slate-600";
  return (
    <div className="p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-sm font-semibold text-slate-800">
          {getCategoryLabel(it.analysisCategory)}
        </span>
        {it.riskLevel && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${chip}`}>{it.riskLevel}</span>
        )}
      </div>
      {it.materialImpact && <p className="text-xs text-slate-600 leading-relaxed">{it.materialImpact}</p>}
    </div>
  );
}

// 전역 툴팁 하나. 부모(OriginalDocument)가 ref로 show(content, referenceEl)/hide()만 호출한다.
// 위치 계산·뷰포트 flip/shift·스크롤 추적·오프스크린 숨김은 Floating UI가 담당한다.
// 이 컴포넌트만 hover마다 리렌더되고, 본문 블록 트리는 리렌더되지 않는다(성능 격리).
const DocumentTooltip = forwardRef(function DocumentTooltip(_props, ref) {
  const floatingRef = useRef(null);
  const referenceRef = useRef(null);
  const cleanupRef = useRef(null);
  const [content, setContent] = useState(null);
  // ready: 첫 위치 계산 완료 전 좌상단(0,0) 깜빡임 방지 / hidden: 참조가 스크롤로 화면 밖에 나감
  const [style, setStyle] = useState({ x: 0, y: 0, ready: false, hidden: false });

  const update = useCallback(() => {
    const reference = referenceRef.current;
    const floating = floatingRef.current;
    if (!reference || !floating) return;
    computePosition(reference, floating, {
      placement: "top",
      middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 }), hide()],
    }).then(({ x, y, middlewareData }) => {
      setStyle({ x, y, ready: true, hidden: !!middlewareData.hide?.referenceHidden });
    });
  }, []);

  const stopTracking = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      show(bodyNode, reference) {
        referenceRef.current = reference;
        setContent(bodyNode);
        setStyle((s) => ({ ...s, ready: false, hidden: false }));
        // floatingRef가 채워진 다음 프레임에 autoUpdate 시작(스크롤/리사이즈 추적 포함)
        requestAnimationFrame(() => {
          stopTracking();
          if (referenceRef.current && floatingRef.current) {
            cleanupRef.current = autoUpdate(referenceRef.current, floatingRef.current, update);
          }
        });
      },
      hide() {
        stopTracking();
        referenceRef.current = null;
        setContent(null);
      },
    }),
    [update, stopTracking]
  );

  useEffect(() => () => stopTracking(), [stopTracking]);

  if (content === null) return null;

  return createPortal(
    <div
      ref={floatingRef}
      role="tooltip"
      id={TOOLTIP_ID}
      className="w-max max-w-xs bg-white border border-slate-200 rounded-lg shadow-lg text-left"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(${Math.round(style.x)}px, ${Math.round(style.y)}px)`,
        visibility: style.ready && !style.hidden ? "visible" : "hidden",
        pointerEvents: "none", // 순수 정보 표시 — 상호작용을 받지 않아 hover 가로채기/깜빡임이 없다
        zIndex: 60,
      }}
    >
      {content}
    </div>,
    document.body
  );
});

// ── 메인 컴포넌트 ────────────────────────────────────────────────
// DisclosureViewer의 인라인 렌더 로직(문단/표/세그먼트)을 분리한 제네릭 렌더러.
// 블록 타입 스위치(BlockRenderer)가 유일한 확장점이며, 문서 유형(사업/감사/거래소…)과
// 무관하게 동일한 프리미티브(제목/문단/표)로 그린다.
export function OriginalDocument({
  text,
  blocks,
  analysisItems = [],
  termHighlights = [],
  highlightEnabled = true,
  termsEnabled = false,
  activeHighlightKey = null,
  activeTermId = null,
  onHighlightSelect,
  onTermSelect,
}) {
  const { t } = useLocale();
  const rootRef = useRef(null);
  const tooltipRef = useRef(null);
  const getCategoryLabelRef = useRef((code) => code);
  getCategoryLabelRef.current = (code) => getAnalysisCategoryLabel(t, code);

  const highlightMask = useMemo(
    () =>
      text
        ? buildHighlightMask(text, analysisItems, termHighlights, highlightEnabled, termsEnabled)
        : null,
    [text, analysisItems, termHighlights, highlightEnabled, termsEnabled]
  );

  // 조회맵 — hover마다 배열을 .find로 훑지 않도록 termId/targetKey 키의 Map을 미리 만든다(O(1)).
  const termMap = useMemo(() => {
    const m = new Map();
    for (const th of termHighlights) if (!m.has(th.termId)) m.set(th.termId, th);
    return m;
  }, [termHighlights]);

  const analysisMap = useMemo(() => {
    const m = new Map();
    for (const it of analysisItems) if (it.targetKey != null) m.set(it.targetKey, it);
    return m;
  }, [analysisItems]);

  // 위임 리스너는 마운트 시 한 번만 붙이므로, 최신 조회맵은 ref로 읽는다(리스너 재등록 방지).
  const mapsRef = useRef({ termMap, analysisMap });
  mapsRef.current = { termMap, analysisMap };

  // 목차(TOC)는 좌측 레일(DocumentToc)로 분리됐다. 이 컴포넌트는 제목 블록에 anchor id(odoc-h-*)만
  // 그려두고, 레일이 그 id로 스크롤/활성표시를 제어한다.

  // ── 싱글톤 툴팁 이벤트 위임 (포인터 전용) ──────────────────────────
  // 패널 루트에 리스너 한 벌만 붙이고, hover된 노드를 closest로 잡아 전역 툴팁에 주입한다.
  // 순수 정보 표시용 마우스 미리보기이며, 전체 정의는 접근 가능한 우측 탭이 담당한다.
  //  - pointer(마우스/펜): 150ms 지연 후 표시.
  //  - 터치: 미리보기 생략 — 탭이 용어사전/분석 탭으로 이동한다.
  // (인라인 트리거는 키보드 포커스 대상이 아니므로 focus/Escape/aria-describedby는 두지 않는다.)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let showTimer = null;
    let hideTimer = null;

    const resolve = (el) => {
      const termId = el.getAttribute("data-term-id");
      if (termId) {
        const d = mapsRef.current.termMap.get(termId);
        return d ? { kind: "term", data: d } : null;
      }
      const hk = el.getAttribute("data-highlight-key");
      if (hk) {
        const d = mapsRef.current.analysisMap.get(hk);
        return d ? { kind: "highlight", data: d } : null;
      }
      return null;
    };

    const show = (el) => {
      const info = resolve(el);
      if (!info) return;
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      if (showTimer) clearTimeout(showTimer);
      showTimer = setTimeout(() => {
        tooltipRef.current?.show(
          renderTooltipBody(info, (code) => getCategoryLabelRef.current(code)),
          el
        );
      }, 150);
    };

    const hideSoon = () => {
      if (showTimer) {
        clearTimeout(showTimer);
        showTimer = null;
      }
      if (hideTimer) return;
      hideTimer = setTimeout(() => {
        hideTimer = null;
        tooltipRef.current?.hide();
      }, 80); // 인접한 다른 용어로 이동할 때의 깜빡임 방지용 짧은 유예
    };

    const triggerFrom = (target) =>
      target?.closest?.("[data-term-id],[data-highlight-key]") || null;

    const onPointerOver = (e) => {
      if (e.pointerType === "touch") return; // 터치는 미리보기 생략(탭이 용어사전/분석 탭으로 이동)
      const el = triggerFrom(e.target);
      if (el) show(el);
    };
    const onPointerOut = (e) => {
      if (e.pointerType === "touch") return;
      const el = triggerFrom(e.target);
      if (!el) return;
      if (e.relatedTarget && el.contains(e.relatedTarget)) return; // 같은 노드 내부 이동은 무시
      hideSoon();
    };

    root.addEventListener("pointerover", onPointerOver);
    root.addEventListener("pointerout", onPointerOut);
    return () => {
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
      root.removeEventListener("pointerover", onPointerOver);
      root.removeEventListener("pointerout", onPointerOut);
      tooltipRef.current?.hide();
    };
  }, []);

  // 세그먼트(plain/highlight/term) 배열을 mark/abbr가 섞인 노드로 렌더링한다.
  // 네이티브 title은 제거했다 — 정보 표시는 싱글톤 툴팁(hover)이, 접근 가능한 전체 내용은 우측 탭이 맡는다.
  // 인라인 트리거는 클릭 시 탭으로 이동하지만, 용어가 많은 문서의 탭 정지점 폭증을 피하기 위해
  // 키보드 포커스 대상으로 만들지 않는다(클릭-이동의 키보드 접근성은 우측 탭이 대체 경로).
  const renderSegments = (segments, keyPrefix) =>
    segments.map((seg, i) => {
      const key = `${keyPrefix}-${i}`;
      if (seg.type === "plain") return <span key={key}>{seg.text}</span>;

      if (seg.type === "highlight") {
        const isActive = activeHighlightKey === seg.item.targetKey;
        return (
          <mark
            key={key}
            data-highlight-key={seg.item.targetKey}
            onClick={() => onHighlightSelect?.(seg.item.targetKey)}
            className={`bg-yellow-200 rounded-sm px-0.5 cursor-pointer transition-all duration-200
              ${isActive ? "outline outline-2 outline-offset-1 outline-yellow-500" : ""}`}
          >
            {seg.text}
          </mark>
        );
      }

      const isActive = activeTermId === seg.th.termId;
      return (
        <abbr
          key={key}
          data-term-id={seg.th.termId}
          onClick={() => onTermSelect?.(seg.th.termId)}
          className={`cursor-pointer border-b-2 border-dotted transition-all duration-200 no-underline
            ${isActive
              ? "border-blue-600 text-blue-900 bg-blue-50"
              : "border-blue-400 text-blue-800 hover:border-blue-600"}`}
          style={{ textDecoration: "none" }}
        >
          {seg.text}
        </abbr>
      );
    });

  // 표 셀 하나의 내용 렌더링. 한 셀에 <br>로 여러 줄이 이어진 경우(거래소 조회공시류 등)는
  // 옆 셀과 줄 수가 1:1로 맞지 않으므로 구분선으로 "이 셀 안에 값이 N개"임을 보여준다.
  const renderCellContent = (cellBlocks, key) => {
    const isMultiLine = cellBlocks.length > 1 && cellBlocks.every((cb) => cb.type === "paragraph");
    if (!isMultiLine) {
      return cellBlocks.map((cb, cbi) => renderBlock(cb, `${key}-${cbi}`, cbi));
    }
    return (
      <div className="divide-y divide-slate-200 -my-1">
        {cellBlocks.map((cb, cbi) => {
          const segments =
            cb.charStart != null && highlightMask
              ? sliceToSegments(text, highlightMask, cb.charStart, cb.charEnd)
              : null;
          return (
            <div key={`${key}-${cbi}`} className="py-1">
              {segments ? renderSegments(segments, `${key}-${cbi}`) : cb.text}
            </div>
          );
        })}
      </div>
    );
  };

  // ── BlockRenderer — 블록 타입별 렌더링(유일한 확장점) ────────────
  // 표 셀 안에서도 재귀 호출되며, charStart/charEnd는 중첩 깊이와 무관하게 원문 전체
  // 기준으로 이미 계산돼 내려오므로 여기서는 그대로 슬라이스만 한다.
  const renderBlock = (block, key, idx = 0) => {
    // 개선 1: 제목 블록 — 레벨별 위계 + 목차 anchor
    if (block.type === "heading") {
      const level = block.level >= 1 && block.level <= 3 ? block.level : 2;
      const segments =
        block.charStart != null && highlightMask
          ? sliceToSegments(text, highlightMask, block.charStart, block.charEnd)
          : null;
      return (
        <p key={key} id={`odoc-h-${idx}`} className={HEADING_CLASS[level]}>
          {segments ? renderSegments(segments, key) : block.text}
        </p>
      );
    }

    // 개선 2: 표 — 셀 내용으로 variant를 정해 정렬/강조를 다르게 준다.
    if (block.type === "table") {
      const variant = detectTableVariant(block.rows);
      // 첫 행에 숫자 셀이 하나도 없으면 헤더 행으로 간주(재무/폼 표에 한함).
      const firstRowIsHeader =
        variant !== "default" &&
        block.rows.length > 1 &&
        block.rows[0].every((c) => !isNumericText(cellPlainText(c)));

      return (
        <div key={key} className="my-4 overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full border-collapse text-[13px]">
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => {
                    const plain = cellPlainText(cell);
                    const isHeader = firstRowIsHeader && ri === 0;
                    const isNumeric = !isHeader && variant === "financial" && isNumericText(plain);
                    const isFormLabel = !isHeader && variant === "form" && ci === 0;

                    const tdClass = [
                      "border border-slate-200 px-2.5 py-1.5 align-top leading-6 whitespace-pre-wrap",
                      isHeader
                        ? "bg-slate-100 font-semibold text-slate-700 text-center"
                        : isNumeric
                          ? "text-right tabular-nums font-medium text-slate-800"
                          : "text-slate-700",
                      isFormLabel ? "bg-slate-50 font-medium text-slate-600 w-1/3" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <td
                        key={ci}
                        rowSpan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
                        colSpan={cell.colSpan > 1 ? cell.colSpan : undefined}
                        className={tdClass}
                      >
                        {renderCellContent(cell.blocks, `${key}-${ri}-${ci}`)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // 개선 3: 미지 타입 폴백 — paragraph 및 알 수 없는 타입은 모두 문단으로 안전하게 그린다.
    // (백엔드에 새 블록 타입이 추가되거나 구버전 캐시 데이터가 남아 있어도 화면이 깨지지 않는다.)
    const segments =
      block.charStart != null && highlightMask
        ? sliceToSegments(text, highlightMask, block.charStart, block.charEnd)
        : null;
    return (
      <p
        key={key}
        className="text-sm text-slate-700 leading-7 whitespace-pre-wrap font-sans mb-3 last:mb-0"
      >
        {segments ? renderSegments(segments, key) : block.text}
      </p>
    );
  };

  const hasBlocks = blocks && blocks.length > 0;

  return (
    <div ref={rootRef}>
      {/* 본문 */}
      {hasBlocks ? (
        blocks.map((block, bi) => renderBlock(block, `b${bi}`, bi))
      ) : (
        // 구조화 블록이 없을 때(파싱 폴백)는 평문 전체를 하나의 문단으로 그린다.
        <p className="text-sm text-slate-700 leading-7 whitespace-pre-wrap font-sans">
          {text && highlightMask
            ? renderSegments(sliceToSegments(text, highlightMask, 0, text.length), "fallback")
            : text}
        </p>
      )}

      {/* 전역 툴팁 하나 — hover 시 위임 리스너가 데이터를 주입한다 */}
      <DocumentTooltip ref={tooltipRef} />
    </div>
  );
}
