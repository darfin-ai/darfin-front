import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { STOCKS, mockQuestions } from "../data/mockCommunity";
export function CommunityWrite() {
  const navigate = useNavigate();
  const [stockName, setStockName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!stockName) {
      toast.error("\uAD00\uB828 \uC885\uBAA9\uC744 \uC120\uD0DD\uD574\uC8FC\uC138\uC694.");
      return;
    }
    if (!title.trim()) {
      toast.error("\uC81C\uBAA9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
      return;
    }
    if (!content.trim()) {
      toast.error("\uB0B4\uC6A9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
      return;
    }
    const newQuestion = {
      id: Date.now(),
      stockName,
      title,
      content,
      author: "\uC775\uBA85\uC0AC\uC6A9\uC790",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      isResolved: false,
      views: 0
    };
    mockQuestions.push(newQuestion);
    toast.success("\uC9C8\uBB38\uC774 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
    navigate("/community");
  };
  return <div className="max-w-3xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      <Link to="/community" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 w-fit font-medium text-sm">
        <ArrowLeft size={16} />
        목록으로
      </Link>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">새 질문 작성</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">관련 종목 선택</label>
            <select
    value={stockName}
    onChange={(e) => setStockName(e.target.value)}
    className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 text-sm"
  >
              <option value="" disabled>종목을 선택해주세요</option>
              {STOCKS.map((stock) => <option key={stock.id} value={stock.name}>{stock.name} ({stock.id})</option>)}
            </select>
          </div>

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
    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
  >
              질문 등록하기
            </button>
          </div>
        </form>
      </div>
    </div>;
}
