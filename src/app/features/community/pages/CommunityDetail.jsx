import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, CheckCircle2, MessageCircle, Edit2, Trash2, X, Save, CornerDownRight } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../../auth/context/AuthContext";
import { useLocale } from "../../../shared/i18n";
import { getDateFnsLocale } from "../../../shared/i18n/localeFormat";
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
import {
  CARD,
  PAGE_TITLE,
  SECTION_TITLE,
  INPUT,
  TEXTAREA,
  BTN_PRIMARY,
  BTN_GHOST,
  BTN_DANGER_GHOST,
  BACK_LINK,
} from "../communityUi";

function Avatar({ src, alt, size = "md" }) {
  const cls = size === "sm" ? "w-6 h-6" : size === "md" ? "w-8 h-8" : "w-10 h-10";
  return (
    <img
      src={src || "/profile.png"}
      alt={alt}
      className={`${cls} rounded-full object-cover bg-slate-100 dark:bg-slate-800 flex-shrink-0`}
    />
  );
}

export function CommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, locale } = useLocale();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newAnswer, setNewAnswer] = useState("");
  const [answerSubmitting, setAnswerSubmitting] = useState(false);

  const [replies, setReplies] = useState({});
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
        setError(err.message || t("community.detail.loadFail"));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSubmitAnswer = async () => {
    if (!newAnswer.trim()) {
      toast.error(t("community.detail.answerRequired"));
      return;
    }
    setAnswerSubmitting(true);
    try {
      const answer = await createAnswer(id, newAnswer);
      setAnswers((prev) => [...prev, answer]);
      setNewAnswer("");
      toast.success(t("community.detail.answerSuccess"));
    } catch (err) {
      toast.error(err.message || t("community.detail.answerFail"));
    } finally {
      setAnswerSubmitting(false);
    }
  };

  const handleAccept = async (answerId) => {
    if (question?.isResolved) return;
    try {
      await acceptAnswer(answerId);
      setAnswers((prev) => prev.map((a) => (a.id === answerId ? { ...a, isAdopted: true } : a)));
      setQuestion((prev) => ({ ...prev, isResolved: true }));
      toast.success(t("community.detail.adoptSuccess"));
    } catch (err) {
      toast.error(err.message || t("community.detail.adoptFail"));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t("community.detail.confirmDelete"))) return;
    try {
      await deleteQuestion(id);
      toast.success(t("community.detail.deleteSuccess"));
      navigate("/community");
    } catch (err) {
      toast.error(err.message || t("community.detail.deleteFail"));
    }
  };

  const handleEditSave = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error(t("community.detail.titleBodyRequired"));
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
      toast.success(t("community.detail.editSuccess"));
    } catch (err) {
      toast.error(err.message || t("community.detail.editFail"));
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
      toast.error(err.message || t("community.detail.replyLoadFail"));
    }
  };

  const handleSubmitReply = async (answerId) => {
    const text = (replyInputs[answerId] || "").trim();
    if (!text) {
      toast.error(t("community.detail.replyRequired"));
      return;
    }
    try {
      const reply = await createReply(answerId, text);
      setReplies((prev) => ({ ...prev, [answerId]: [...(prev[answerId] ?? []), reply] }));
      setReplyInputs((prev) => ({ ...prev, [answerId]: "" }));
      setReplyingTo(null);
      toast.success(t("community.detail.replySuccess"));
    } catch (err) {
      toast.error(err.message || t("community.detail.replyFail"));
    }
  };

  const handleDeleteReply = async (answerId, replyId) => {
    try {
      await deleteReply(replyId);
      setReplies((prev) => ({
        ...prev,
        [answerId]: (prev[answerId] ?? []).filter((r) => r.id !== replyId),
      }));
      toast.success(t("community.detail.replyDeleteSuccess"));
    } catch (err) {
      toast.error(err.message || t("community.detail.replyDeleteFail"));
    }
  };

  if (loading) {
    return (
      <div className="container-sm py-20 text-center text-slate-400 dark:text-slate-500">{t("common.loading")}</div>
    );
  }

  if (error || !question) {
    return (
      <div className="container-sm py-20 text-center text-slate-500 dark:text-slate-400">
        {error || t("common.notFound")}
        <br />
        <Link to="/community" className="text-blue-600 dark:text-blue-400 mt-4 inline-block hover:underline">
          {t("common.backToList")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-sm py-10 sm:py-12 flex flex-col gap-6">
      <Link to="/community" className={BACK_LINK}>
        <ArrowLeft size={16} />
        {t("common.backToList")}
      </Link>

      <div className={`${CARD} p-6 sm:p-8`}>
        <div className="flex justify-between items-start mb-4 gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {question.stock && (
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-md">
                {question.stock.companyName}
              </span>
            )}
            {question.isResolved ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
                <CheckCircle2 size={12} />
                {t("community.detail.resolved")}
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400 text-xs font-medium bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                {t("community.detail.awaiting")}
              </span>
            )}
          </div>

          {isAuthor && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {!isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setEditTitle(question.title); setEditContent(question.content); setIsEditing(true); }}
                    className={BTN_GHOST}
                  >
                    <Edit2 size={15} />
                    {t("common.edit")}
                  </button>
                  <button type="button" onClick={handleDelete} className={BTN_DANGER_GHOST}>
                    <Trash2 size={15} />
                    {t("common.delete")}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => setIsEditing(false)} className={BTN_GHOST}>
                    <X size={15} />
                    {t("common.cancel")}
                  </button>
                  <button type="button" onClick={handleEditSave} disabled={editSubmitting} className={BTN_PRIMARY}>
                    <Save size={15} />
                    {editSubmitting ? t("common.saving") : t("common.save")}
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
            className={`${INPUT} text-lg font-semibold mb-5`}
          />
        ) : (
          <h1 className={`${PAGE_TITLE} mb-5`}>{question.title}</h1>
        )}

        <div className="flex items-center gap-3 pb-5 border-b border-slate-200 dark:border-slate-800 mb-5">
          <Avatar src={question.authorProfileImage} alt={question.authorNickname} size="lg" />
          <div>
            <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{question.authorNickname}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true, locale: getDateFnsLocale(locale) })} · {t("common.views")} {question.views}
            </div>
          </div>
        </div>

        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={10}
            className={TEXTAREA}
          />
        ) : (
          <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[80px] text-sm">
            {question.content}
          </div>
        )}
      </div>

      <div>
        <h3 className={`${SECTION_TITLE} mb-4 flex items-center gap-2`}>
          <MessageCircle className="text-blue-600 dark:text-blue-400" size={20} />
          {t("community.detail.answers")} <span className="text-blue-600 dark:text-blue-400">{answers.length}</span>
        </h3>

        <div className="space-y-3">
          {answers.map((answer) => (
            <div
              key={answer.id}
              className={`p-5 rounded-xl border ${
                answer.isAdopted
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50"
                  : `${CARD}`
              }`}
            >
              <div className="flex items-start justify-between mb-3 gap-3">
                <div className="flex items-center gap-3">
                  <div className={`rounded-full ${answer.isAdopted ? "ring-2 ring-emerald-400 dark:ring-emerald-600" : ""}`}>
                    <Avatar src={answer.authorProfileImage} alt={answer.authorNickname} size="md" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
                      {answer.authorNickname}
                      {answer.isAdopted && (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 size={12} /> {t("community.detail.adopted")}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true, locale: getDateFnsLocale(locale) })}
                    </div>
                  </div>
                </div>
                {isAuthor && !question.isResolved && (
                  <button
                    type="button"
                    onClick={() => handleAccept(answer.id)}
                    className="text-xs font-medium px-3 py-1.5 rounded-md border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors flex-shrink-0"
                  >
                    {t("community.detail.adopt")}
                  </button>
                )}
              </div>

              <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap ml-11">
                {answer.content}
              </div>

              {repliesLoaded[answer.id] && (replies[answer.id] ?? []).length > 0 && (
                <div className="ml-11 mt-4 space-y-2">
                  {(replies[answer.id] ?? []).map((reply) => (
                    <div key={reply.id} className="flex gap-2 group">
                      <CornerDownRight size={14} className="text-slate-300 dark:text-slate-600 flex-shrink-0 mt-2" />
                      <div className="flex-1 rounded-lg px-3 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Avatar src={reply.authorProfileImage} alt={reply.authorNickname} size="sm" />
                            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{reply.authorNickname}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: getDateFnsLocale(locale) })}
                            </span>
                          </div>
                          {user && user.userId === reply.authorId && (
                            <button
                              type="button"
                              onClick={() => handleDeleteReply(answer.id, reply.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed ml-8">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="ml-11 mt-3">
                {replyingTo === answer.id ? (
                  <div className="flex gap-2 items-start">
                    <CornerDownRight size={14} className="text-slate-300 dark:text-slate-600 flex-shrink-0 mt-2.5" />
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
                        placeholder={t("community.detail.replyPlaceholder")}
                        rows={2}
                        className={`${TEXTAREA} resize-none`}
                      />
                      <div className="flex justify-end gap-2 mt-1.5">
                        <button
                          type="button"
                          onClick={() => { setReplyingTo(null); setReplyInputs((prev) => ({ ...prev, [answer.id]: "" })); }}
                          className={BTN_GHOST}
                        >
                          {t("common.cancel")}
                        </button>
                        <button type="button" onClick={() => handleSubmitReply(answer.id)} className={BTN_PRIMARY}>
                          {t("common.submit")}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleLoadReplies(answer.id)}
                    className="flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1"
                  >
                    <CornerDownRight size={13} />
                    {t("community.detail.reply")}{" "}
                    {answer.replyCount > 0
                      ? `${answer.replyCount}${t("community.detail.replyCount")}`
                      : t("community.detail.addReply")}
                  </button>
                )}
              </div>
            </div>
          ))}

          {answers.length === 0 && (
            <div className={`${CARD} text-center py-10 text-slate-500 dark:text-slate-400 border-dashed`}>
              {t("community.detail.noAnswers")}
            </div>
          )}
        </div>
      </div>

      <div className={`${CARD} p-5 sm:p-6`}>
        <h4 className={`${SECTION_TITLE} mb-4`}>{t("community.detail.writeAnswer")}</h4>
        <textarea
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          placeholder={t("community.detail.answerPlaceholder")}
          rows={5}
          className={`${TEXTAREA} mb-4 bg-slate-50 dark:bg-slate-800/40`}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmitAnswer}
            disabled={answerSubmitting}
            className={BTN_PRIMARY}
          >
            {answerSubmitting ? t("common.submitting") : t("community.detail.submitAnswer")}
          </button>
        </div>
      </div>
    </div>
  );
}
