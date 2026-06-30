import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";
import { searchStocks, createQuestion } from "../api/communityApi";

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

  // 종목 검색 디바운스
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

  // 드롭다운 외부 클릭 시 닫기
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
    <div className="max-w-3xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      <Link
        to="/community"
        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 w-fit font-medium text-sm"
      >
        <ArrowLeft size={16} />
        목록으로
      </Link>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">새 질문 작성</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 종목 검색 */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">
              관련 종목 <span className="text-slate-400 font-normal"></span>
            </label>
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={stockKeyword}
                  onChange={handleStockKeywordChange}
                  placeholder="종목명 검색 (예: 삼성전자)"
                  className="w-full h-12 pl-9 pr-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 text-sm"
                />
                {stockLoading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">검색 중...</span>
                )}
              </div>

              {showDropdown && stockResults.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                  {stockResults.map((s) => (
                    <li key={s.dartCorpCode}>
                      <button
                        type="button"
                        onClick={() => handleSelectStock(s)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <span className="font-semibold text-sm text-slate-900">{s.companyName}</span>
                        <span className="ml-2 text-xs text-slate-400">{s.stockCode}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {showDropdown && !stockLoading && stockResults.length === 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm text-slate-500">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>

            {selectedStock && (
              <p className="text-xs text-blue-600 font-medium">
                선택됨: {selectedStock.companyName} ({selectedStock.stockCode})
              </p>
            )}
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="질문 제목을 간결하게 작성해주세요."
              className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 text-sm"
            />
          </div>

          {/* 내용 */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="궁금한 내용을 자세히 작성해주세요."
              className="w-full min-h-[300px] p-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 text-sm resize-y"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "등록 중..." : "질문 등록하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
