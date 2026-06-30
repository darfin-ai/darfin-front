import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { Search, PenSquare, MessageCircle, CheckCircle2 } from "lucide-react";

function Avatar({ src, alt, size = "sm" }) {
  const cls = size === "sm" ? "w-6 h-6" : "w-8 h-8";
  return (
    <img
      src={src ?? "/default-avatar.png"}
      alt={alt}
      className={`${cls} rounded-full object-cover bg-slate-100 flex-shrink-0`}
    />
  );
}
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { getQuestions } from "../api/communityApi";

export function CommunityList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuestions = useCallback(async (search) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getQuestions(search);
      setQuestions(data ?? []);
    } catch (err) {
      setError(err.message || "목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    fetchQuestions(searchTerm);
  }, [searchTerm, fetchQuestions]);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">종목 토론 커뮤니티</h1>
          <p className="text-slate-500 mt-1">궁금한 종목에 대해 질문하고 답변을 받아보세요.</p>
        </div>
        <Link
          to="/community/write"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <PenSquare size={18} />
          질문하기
        </Link>
      </div>

      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
        <Search className="text-slate-400 ml-3" size={20} />
        <input
          type="text"
          placeholder="게시글 제목, 내용, 종목명 검색..."
          className="flex-1 bg-transparent border-none outline-none py-2 text-slate-900 placeholder:text-slate-400"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">불러오는 중...</div>
        ) : error ? (
          <div className="py-20 text-center text-red-500">{error}</div>
        ) : questions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {questions.map((q) => (
              <Link
                key={q.id}
                to={`/community/${q.id}`}
                className="block p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  {q.stock && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">
                      {q.stock.companyName}
                    </span>
                  )}
                  {q.isResolved ? (
                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-1 rounded-md">
                      <CheckCircle2 size={12} />
                      해결됨
                    </span>
                  ) : (
                    <span className="text-slate-500 text-xs font-semibold bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                      답변 대기중
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">{q.title}</h2>
                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <Avatar src={q.authorProfileImage} alt={q.authorNickname} />
                    {q.authorNickname}
                  </span>
                  <span>{formatDistanceToNow(new Date(q.createdAt), { addSuffix: true, locale: ko })}</span>
                  <span>조회 {q.views}</span>
                  <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full ml-auto">
                    <MessageCircle size={14} />
                    {q.answerCount}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500">
            {searchTerm ? "검색 결과가 없습니다." : "등록된 질문이 없습니다."}
          </div>
        )}
      </div>
    </div>
  );
}
