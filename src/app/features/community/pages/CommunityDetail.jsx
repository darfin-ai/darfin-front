import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, CheckCircle2, MessageCircle, User, Edit2, Trash2, X, Save, CornerDownRight } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { mockQuestions, mockAnswers } from "../data/mockCommunity";
export function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const questionId = Number(id);
  const question = mockQuestions.find((q) => q.id === questionId);
  const [answers, setAnswers] = useState(mockAnswers.filter((a) => a.questionId === questionId));
  const [isResolved, setIsResolved] = useState(question?.isResolved || false);
  const [newAnswer, setNewAnswer] = useState("");
  const [replies, setReplies] = useState({
    // 초기 mock 대댓글
    ...mockAnswers.filter((a) => a.questionId === questionId)[0] ? { [mockAnswers.filter((a) => a.questionId === questionId)[0].id]: [
      { id: 1, author: "\uD22C\uC790\uC655\uAE40\uC528", content: "\uC800\uB3C4 \uAC19\uC740 \uC0DD\uAC01\uC785\uB2C8\uB2E4. \uCD94\uAC00\uB85C \uC7AC\uBB34\uC81C\uD45C \uD750\uB984\uB3C4 \uAC19\uC774 \uBCF4\uC2DC\uBA74 \uC88B\uC744 \uAC83 \uAC19\uC544\uC694.", createdAt: new Date(Date.now() - 1e3 * 60 * 30).toISOString() }
    ] } : {}
  });
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyInputs, setReplyInputs] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(question?.title || "");
  const [editContent, setEditContent] = useState(question?.content || "");
  if (!question) {
    return <div className="max-w-3xl mx-auto py-20 text-center text-slate-500">
        존재하지 않는 게시글입니다.
        <br />
        <Link to="/community" className="text-blue-600 mt-4 inline-block hover:underline">목록으로 돌아가기</Link>
      </div>;
  }
  const handleSubmitAnswer = () => {
    if (!newAnswer.trim()) {
      toast.error("\uB2F5\uBCC0 \uB0B4\uC6A9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
      return;
    }
    const answer = {
      id: Date.now(),
      questionId: question.id,
      author: "\uBC29\uBB38\uC790 (\uB098)",
      content: newAnswer,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      isAccepted: false
    };
    setAnswers([...answers, answer]);
    mockAnswers.push(answer);
    setNewAnswer("");
    toast.success("\uB2F5\uBCC0\uC774 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
  };
  const handleAccept = (answerId) => {
    if (isResolved) return;
    setAnswers(answers.map(
      (a) => a.id === answerId ? { ...a, isAccepted: true } : a
    ));
    setIsResolved(true);
    const targetQ = mockQuestions.find((q) => q.id === questionId);
    if (targetQ) targetQ.isResolved = true;
    const targetA = mockAnswers.find((a) => a.id === answerId);
    if (targetA) targetA.isAccepted = true;
    toast.success("\uB2F5\uBCC0\uC744 \uCC44\uD0DD\uD588\uC2B5\uB2C8\uB2E4.");
  };
  const handleSubmitReply = (answerId) => {
    const text = (replyInputs[answerId] || "").trim();
    if (!text) {
      toast.error("\uB300\uB313\uAE00 \uB0B4\uC6A9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
      return;
    }
    const newReply = {
      id: Date.now(),
      author: "\uBC29\uBB38\uC790 (\uB098)",
      content: text,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    setReplies((prev) => ({
      ...prev,
      [answerId]: [...prev[answerId] || [], newReply]
    }));
    setReplyInputs((prev) => ({ ...prev, [answerId]: "" }));
    setReplyingTo(null);
    toast.success("\uB300\uB313\uAE00\uC774 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
  };
  const handleDeleteReply = (answerId, replyId) => {
    setReplies((prev) => ({
      ...prev,
      [answerId]: (prev[answerId] || []).filter((r) => r.id !== replyId)
    }));
    toast.success("\uB300\uB313\uAE00\uC774 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
  };
  const handleDelete = () => {
    if (window.confirm("\uC815\uB9D0\uB85C \uC774 \uAC8C\uC2DC\uAE00\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?")) {
      const index = mockQuestions.findIndex((q) => q.id === questionId);
      if (index !== -1) {
        mockQuestions.splice(index, 1);
      }
      toast.success("\uAC8C\uC2DC\uAE00\uC774 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
      navigate("/community");
    }
  };
  const handleEditSave = () => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error("\uC81C\uBAA9\uACFC \uB0B4\uC6A9\uC744 \uBAA8\uB450 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
      return;
    }
    const targetQ = mockQuestions.find((q) => q.id === questionId);
    if (targetQ) {
      targetQ.title = editTitle;
      targetQ.content = editContent;
    }
    setIsEditing(false);
    toast.success("\uAC8C\uC2DC\uAE00\uC774 \uC218\uC815\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
  };
  return <div className="max-w-3xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      <Link to="/community" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 w-fit font-medium text-sm">
        <ArrowLeft size={16} />
        목록으로
      </Link>

      {
    /* Question Card */
  }
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">
              {question.stockName}
            </span>
            {isResolved ? <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-md">
                <CheckCircle2 size={14} />
                해결됨
              </span> : <span className="text-slate-500 text-xs font-bold bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                답변 대기중
              </span>}
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing ? <>
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 size={16} />
                  수정
                </button>
                <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                  삭제
                </button>
              </> : <>
                <button onClick={() => {
    setIsEditing(false);
    setEditTitle(question.title);
    setEditContent(question.content);
  }} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                  <X size={16} />
                  취소
                </button>
                <button onClick={handleEditSave} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  <Save size={16} />
                  저장
                </button>
              </>}
          </div>
        </div>
        
        {isEditing ? <input
    type="text"
    value={editTitle}
    onChange={(e) => setEditTitle(e.target.value)}
    className="w-full text-2xl font-bold text-slate-900 mb-6 p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
  /> : <h1 className="text-2xl font-bold text-slate-900 mb-6">{question.title}</h1>}
        
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
            <User size={20} />
          </div>
          <div>
            <div className="font-semibold text-sm text-slate-900">{question.author}</div>
            <div className="text-xs text-slate-500 font-medium">
              {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true, locale: ko })} · 조회 {question.views}
            </div>
          </div>
        </div>

        {isEditing ? <textarea
    value={editContent}
    onChange={(e) => setEditContent(e.target.value)}
    className="w-full min-h-[200px] p-4 text-slate-700 leading-relaxed whitespace-pre-wrap border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
  /> : <div className="text-slate-700 leading-relaxed whitespace-pre-wrap min-h-[100px]">
            {question.content}
          </div>}
      </div>

      {
    /* Answers Section */
  }
      <div className="mt-4">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <MessageCircle className="text-blue-600" />
          답변 <span className="text-blue-600">{answers.length}</span>
        </h3>

        <div className="space-y-4">
          {answers.map((answer) => <div
    key={answer.id}
    className={`p-6 rounded-2xl border ${answer.isAccepted ? "bg-emerald-50/30 border-emerald-200" : "bg-white border-slate-200 shadow-sm"}`}
  >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${answer.isAccepted ? "bg-emerald-500" : "bg-slate-300"}`}>
                    <User size={16} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                      {answer.author}
                      {answer.isAccepted && <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 size={12} /> 채택된 답변
                        </span>}
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true, locale: ko })}
                    </div>
                  </div>
                </div>
                {!isResolved && <button
    onClick={() => handleAccept(answer.id)}
    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
  >
                    채택하기
                  </button>}
              </div>
              <div className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap ml-11">
                {answer.content}
              </div>

              {
    /* 대댓글 목록 */
  }
              {(replies[answer.id] || []).length > 0 && <div className="ml-11 mt-4 space-y-3">
                  {(replies[answer.id] || []).map((reply) => <div key={reply.id} className="flex gap-3 group">
                      <CornerDownRight size={15} className="text-slate-300 flex-shrink-0 mt-2" />
                      <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                              <User size={12} className="text-slate-500" />
                            </div>
                            <span className="text-xs font-bold text-slate-800">{reply.author}</span>
                            <span className="text-xs text-slate-400">
                              {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: ko })}
                            </span>
                          </div>
                          <button
    onClick={() => handleDeleteReply(answer.id, reply.id)}
    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500 p-1 rounded"
  >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed ml-8">{reply.content}</p>
                      </div>
                    </div>)}
                </div>}

              {
    /* 대댓글 작성 토글 버튼 */
  }
              <div className="ml-11 mt-3">
                {replyingTo === answer.id ? <div className="flex gap-2 items-start animate-in fade-in slide-in-from-top-1 duration-150">
                    <CornerDownRight size={15} className="text-slate-300 flex-shrink-0 mt-2.5" />
                    <div className="flex-1">
                      <textarea
    autoFocus
    value={replyInputs[answer.id] || ""}
    onChange={(e) => setReplyInputs((prev) => ({ ...prev, [answer.id]: e.target.value }))}
    onKeyDown={(e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmitReply(answer.id);
      }
    }}
    placeholder="대댓글을 입력하세요. (Enter로 등록)"
    rows={2}
    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
  />
                      <div className="flex justify-end gap-2 mt-1.5">
                        <button
    onClick={() => {
      setReplyingTo(null);
      setReplyInputs((prev) => ({ ...prev, [answer.id]: "" }));
    }}
    className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
  >
                          취소
                        </button>
                        <button
    onClick={() => handleSubmitReply(answer.id)}
    className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
  >
                          등록
                        </button>
                      </div>
                    </div>
                  </div> : <button
    onClick={() => setReplyingTo(answer.id)}
    className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors py-1"
  >
                    <CornerDownRight size={13} />
                    대댓글 {(replies[answer.id] || []).length > 0 ? `${(replies[answer.id] || []).length}\uAC1C` : "\uB2EC\uAE30"}
                  </button>}
              </div>
            </div>)}

          {answers.length === 0 && <div className="text-center py-10 text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm border-dashed">
              아직 작성된 답변이 없습니다. 첫 번째 답변을 남겨보세요!
            </div>}
        </div>
      </div>

      {
    /* Write Answer Form */
  }
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-4">
        <h4 className="font-bold text-slate-900 mb-4">답변 작성하기</h4>
        <textarea
    value={newAnswer}
    onChange={(e) => setNewAnswer(e.target.value)}
    placeholder="질문에 대한 답변을 남겨주세요. 타인을 비방하는 글은 제재될 수 있습니다."
    className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none text-sm mb-4"
  />
        <div className="flex justify-end">
          <button
    onClick={handleSubmitAnswer}
    className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors text-sm"
  >
            답변 등록
          </button>
        </div>
      </div>

    </div>;
}
