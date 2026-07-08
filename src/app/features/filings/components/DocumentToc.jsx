import { useEffect, useRef } from "react";
import { List } from "lucide-react";

// 공시 원문 좌측 목차 레일. 원문 패널과 형제로 놓여, 제목 클릭 시 원문의 해당 위치로 스크롤하고
// (onSelect), 스크롤에 따라 현재 위치의 제목(activeId)을 강조한다. 제목 데이터는 DisclosureViewer가
// originalBlocks에서 뽑아 내려주고, 각 제목의 id는 OriginalDocument가 그린 anchor(odoc-h-*)와 일치한다.
export function DocumentToc({ headings, activeId, onSelect }) {
  const navRef = useRef(null);

  // 활성 제목이 바뀌면 레일 안에서도 그 항목이 보이도록 스크롤을 따라오게 한다.
  useEffect(() => {
    if (!activeId || !navRef.current) return;
    const el = navRef.current.querySelector(`[data-toc-id="${CSS.escape(activeId)}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  if (!headings || headings.length === 0) return null;

  return (
    <aside className="w-56 shrink-0 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50 text-sm font-medium text-slate-700 shrink-0">
        <List size={16} className="text-blue-600" />
        목차
        <span className="ml-auto text-xs text-slate-400 font-normal">{headings.length}</span>
      </div>
      <nav ref={navRef} className="flex-1 overflow-y-auto p-2">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          return (
            <button
              key={h.id}
              type="button"
              data-toc-id={h.id}
              onClick={() => onSelect(h.id)}
              title={h.text}
              className={`w-full text-left px-2 py-1.5 rounded-md text-xs leading-snug transition-colors truncate block border-l-2
                ${isActive
                  ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                  : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
              style={{ paddingLeft: `${(h.level - 1) * 12 + 8}px` }}
            >
              {h.text}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
