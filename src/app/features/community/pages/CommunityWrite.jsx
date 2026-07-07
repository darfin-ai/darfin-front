import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";
import { searchStocks, createQuestion } from "../api/communityApi";
import {
  CARD,
  PAGE_TITLE,
  LABEL,
  INPUT,
  TEXTAREA,
  BTN_PRIMARY,
  BACK_LINK,
} from "../communityUi";

export function CommunityWrite() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [stockKeyword, setStockKeyword] = useState("");
  const [stockResults, setStockResults] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!stockKeyword.trim()) {
      setStockResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setStockLoading(true);
      try {
        const data = await searchStocks(stockKeyword);
        setStockResults(data ?? []);
        setShowDropdown(true);
      } catch {
        setStockResults([]);
      } finally {
        setStockLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [stockKeyword]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectStock = (stock) => {
    setSelectedStock(stock);
    setStockKeyword(stock.companyName);
    setShowDropdown(false);
  };

  const handleStockKeywordChange = (e) => {
    setStockKeyword(e.target.value);
    setSelectedStock(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      toast.error("내용을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      await createQuestion({
        title,
        content,
        dartCorpCode: selectedStock?.dartCorpCode ?? undefined,
      });
      toast.success("질문이 등록되었습니다.");
      navigate("/community");
    } catch (err) {
      toast.error(err.message || "질문 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-sm py-10 sm:py-12 flex flex-col gap-6">
      <Link to="/community" className={BACK_LINK}>
        <ArrowLeft size={16} />
        목록으로
      </Link>

      <div className={`${CARD} p-6 sm:p-8`}>
        <h1 className={`${PAGE_TITLE} mb-6`}>새 질문 작성</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className={LABEL}>관련 종목</label>
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                <input
                  type="text"
                  value={stockKeyword}
                  onChange={handleStockKeywordChange}
                  placeholder="종목명 검색 (예: 삼성전자)"
                  className={`${INPUT} pl-9`}
                />
                {stockLoading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">검색 중...</span>
                )}
              </div>

              {showDropdown && stockResults.length > 0 && (
                <ul className={`absolute z-10 mt-1 w-full ${CARD} shadow-lg max-h-52 overflow-y-auto`}>
                  {stockResults.map((s) => (
                    <li key={s.dartCorpCode}>
                      <button
                        type="button"
                        onClick={() => handleSelectStock(s)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{s.companyName}</span>
                        <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">{s.stockCode}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {showDropdown && !stockLoading && stockResults.length === 0 && (
                <div className={`absolute z-10 mt-1 w-full ${CARD} shadow-lg px-4 py-3 text-sm text-slate-500 dark:text-slate-400`}>
                  검색 결과가 없습니다.
                </div>
              )}
            </div>

            {selectedStock && (
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                선택됨: {selectedStock.companyName} ({selectedStock.stockCode})
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className={LABEL}>제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="질문 제목을 간결하게 작성해주세요."
              className={INPUT}
            />
          </div>

          <div className="space-y-2">
            <label className={LABEL}>내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="궁금한 내용을 자세히 작성해주세요."
              rows={12}
              className={TEXTAREA}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <button type="submit" disabled={submitting} className={BTN_PRIMARY}>
              {submitting ? "등록 중..." : "질문 등록하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
