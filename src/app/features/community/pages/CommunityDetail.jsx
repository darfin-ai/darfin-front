import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, CheckCircle2, MessageCircle, Edit2, Trash2, X, Save, CornerDownRight } from "lucide-react";

function Avatar({ src, alt, size = "md" }) {
  const cls = size === "sm" ? "w-6 h-6" : size === "md" ? "w-8 h-8" : "w-10 h-10";
  return (
    <img
      src={src || "/profile.png"}
      alt={alt}
      className={`${cls} rounded-full object-cover bg-slate-100 flex-shrink-0`}
    />
  );
}
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useAuth } from "../../auth/context/AuthContext";
import {
  getQuestion,
  updateQuestion,
  deleteQuestion,
  getAnswers,
  createAnswer,
  acceptAnswer,
  getReplies,
  createReply,
  deleteReply,
} from "../api/communityApi";

export function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newAnswer, setNewAnswer] = useState("");
  const [answerSubmitting, setAnswerSubmitting] = useState(false);

  // 대댓글: { [answerId]: Reply[] }
  const [replies, setReplies] = useState({});
  // 대댓글 로딩 여부: { [answerId]: boolean }
  const [repliesLoaded, setRepliesLoaded] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyInputs, setReplyInputs] = useState({});

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const isAuthor = user && question && user.userId === question.authorId;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [q, a] = await Promise.all([getQuestion(id), getAnswers(id)]);
        setQuestion(q);
        setAnswers(a ?? []);
        setEditTitle(q.title);
        setEditContent(q.content);
      } catch (err) {
        setError(err.message || "게시글을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSubmitAnswer = async () => {
    if (!newAnswer.trim()) {
      toast.error("답변 내용을 입력해주세요.");
      return;
    }
    setAnswerSubmitting(true);
    try {
      const answer = await createAnswer(id, newAnswer);
      setAnswers((prev) => [...prev, answer]);
      setNewAnswer("");
      toast.success("답변이 등록되었습니다.");
    } catch (err) {
      toast.error(err.message || "답변 등록에 실패했습니다.");
    } finally {
      setAnswerSubmitting(false);
    }
  };

  const handleAccept = async (answerId) => {
    if (question?.isResolved) return;
    try {
      await acceptAnswer(answerId);
      setAnswers((prev) => prev.map((a) => a.id === answerId ? { ...a, isAdopted: true } : a));
      setQuestion((prev) => ({ ...prev, isResolved: true }));
      toast.success("답변을 채택했습니다.");
    } catch (err) {
      toast.error(err.message || "채택에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;
    try {
      await deleteQuestion(id);
      toast.success("게시글이 삭제되었습니다.");
      navigate("/community");
    } catch (err) {
      toast.error(err.message || "삭제에 실패했습니다.");
    }
  };

  const handleEditSave = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error("제목과 내용을 모두 입력해주세요.");
      return;
    }
    setEditSubmitting(true);
    try {
      const updated = await updateQuestion(id, {
        title: editTitle,
        content: editContent,
        dartCorpCode: question.stock?.dartCorpCode,
      });
      setQuestion(updated);
      setIsEditing(false);
      toast.success("게시글이 수정되었습니다.");
    } catch (err) {
      toast.error(err.message || "수정에 실패했습니다.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleLoadReplies = async (answerId) => {
    if (repliesLoaded[answerId]) {
      setReplyingTo((prev) => (prev === answerId ? null : answerId));
      return;
    }
    try {
      const data = await getReplies(answerId);
      setReplies((prev) => ({ ...prev, [answerId]: data ?? [] }));
      setRepliesLoaded((prev) => ({ ...prev, [answerId]: true }));
      setReplyingTo(answerId);
    } catch (err) {
      toast.error(err.message || "대댓글을 불러오지 못했습니다.");
    }
  };

  const handleSubmitReply = async (answerId) => {
    const text = (replyInputs[answerId] || "").trim();
    if (!text) {
      toast.error("대댓글 내용을 입력해주세요.");
      return;
    }
    try {
      const reply = await createReply(answerId, text);
      setReplies((prev) => ({ ...prev, [answerId]: [...(prev[answerId] ?? []), reply] }));
      setReplyInputs((prev) => ({ ...prev, [answerId]: "" }));
      setReplyingTo(null);
      toast.success("대댓글이 등록되었습니다.");
    } catch (err) {
      toast.error(err.message || "대댓글 등록에 실패했습니다.");
    }
  };

  const handleDeleteReply = async (answerId, replyId) => {
    try {
      await deleteReply(replyId);
      setReplies((prev) => ({
        ...prev,
        [answerId]: (prev[answerId] ?? []).filter((r) => r.id !== replyId),
      }));
      toast.success("대댓글이 삭제되었습니다.");
    } catch (err) {
      toast.error(err.message || "대댓글 삭제에 실패했습니다.");
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto py-20 text-center text-slate-400">불러오는 중...</div>;
  }

  if (error || !question) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center text-slate-500">
        {error || "존재하지 않는 게시글입니다."}
        <br />
        <Link to="/community" className="text-blue-600 mt-4 inline-block hover:underline">목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      <Link to="/community" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 w-fit font-medium text-sm">
        <ArrowLeft size={16} />
        목록으로
      </Link>

      {/* 질문 카드 */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            {question.stock && (
              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">
                {question.stock.companyName}
              </span>
            )}
            {question.isResolved ? (
              <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-md">
                <CheckCircle2 size={14} />
                해결됨
              </span>
            ) : (
              <span className="text-slate-500 text-xs font-bold bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                답변 대기중
              </span>
            )}
          </div>

          {isAuthor && (
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => { setEditTitle(question.title); setEditContent(question.content); setIsEditing(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                    삭제
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X size={16} />
                    취소
                  </button>
                  <button
                    onClick={handleEditSave}
                    disabled={editSubmitting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save size={16} />
                    {editSubmitting ? "저장 중..." : "저장"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full text-2xl font-bold text-slate-900 mb-6 p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        ) : (
          <h1 className="text-2xl font-bold text-slate-900 mb-6">{question.title}</h1>
        )}

        <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
          <Avatar src={question.authorProfileImage} alt={question.authorNickname} size="lg" />
          <div>
            <div className="font-semibold text-sm text-slate-900">{question.authorNickname}</div>
            <div className="text-xs text-slate-500 font-medium">
              {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true, locale: ko })} · 조회 {question.views}
            </div>
          </div>
        </div>

        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full min-h-[200px] p-4 text-slate-700 leading-relaxed whitespace-pre-wrap border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
          />
        ) : (
          <div className="text-slate-700 leading-relaxed whitespace-pre-wrap min-h-[100px]">
            {question.content}
          </div>
        )}
      </div>

      {/* 답변 섹션 */}
      <div className="mt-4">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <MessageCircle className="text-blue-600" />
          답변 <span className="text-blue-600">{answers.length}</span>
        </h3>

        <div className="space-y-4">
          {answers.map((answer) => (
            <div
              key={answer.id}
              className={`p-6 rounded-2xl border ${answer.isAdopted ? "bg-emerald-50/30 border-emerald-200" : "bg-white border-slate-200 shadow-sm"}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-full ${answer.isAdopted ? "ring-2 ring-emerald-400" : ""}`}>
                    <Avatar src={answer.authorProfileImage} alt={answer.authorNickname} size="md" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                      {answer.authorNickname}
                      {answer.isAdopted && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 size={12} /> 채택된 답변
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true, locale: ko })}
                    </div>
                  </div>
                </div>
                {isAuthor && !question.isResolved && (
                  <button
                    onClick={() => handleAccept(answer.id)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
                  >
                    채택하기
                  </button>
                )}
              </div>

              <div className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap ml-11">
                {answer.content}
              </div>

              {/* 대댓글 목록 */}
              {repliesLoaded[answer.id] && (replies[answer.id] ?? []).length > 0 && (
                <div className="ml-11 mt-4 space-y-3">
                  {(replies[answer.id] ?? []).map((reply) => (
                    <div key={reply.id} className="flex gap-3 group">
                      <CornerDownRight size={15} className="text-slate-300 flex-shrink-0 mt-2" />
                      <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Avatar src={reply.authorProfileImage} alt={reply.authorNickname} size="sm" />
                            <span className="text-xs font-bold text-slate-800">{reply.authorNickname}</span>
                            <span className="text-xs text-slate-400">
                              {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: ko })}
                            </span>
                          </div>
                          {user && user.userId === reply.authorId && (
                            <button
                              onClick={() => handleDeleteReply(answer.id, reply.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500 p-1 rounded"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed ml-8">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 대댓글 토글 버튼 / 입력 */}
              <div className="ml-11 mt-3">
                {replyingTo === answer.id ? (
                  <div className="flex gap-2 items-start animate-in fade-in slide-in-from-top-1 duration-150">
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
                          onClick={() => { setReplyingTo(null); setReplyInputs((prev) => ({ ...prev, [answer.id]: "" })); }}
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
                  </div>
                ) : (
                  <button
                    onClick={() => handleLoadReplies(answer.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors py-1"
                  >
                    <CornerDownRight size={13} />
                    대댓글 {answer.replyCount > 0 ? `${answer.replyCount}개` : "달기"}
                  </button>
                )}
              </div>
            </div>
          ))}

          {answers.length === 0 && (
            <div className="text-center py-10 text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm border-dashed">
              아직 작성된 답변이 없습니다. 첫 번째 답변을 남겨보세요!
            </div>
          )}
        </div>
      </div>

      {/* 답변 작성 */}
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
            disabled={answerSubmitting}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {answerSubmitting ? "등록 중..." : "답변 등록"}
          </button>
        </div>
      </div>
    </div>
  );
}
