import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SUGGESTED_QUESTIONS = [
  '이 기업의 부채 리스크는 어느 정도인가요?',
  '전분기 대비 가장 크게 변한 재무 지표는 무엇인가요?',
  '배당 투자자 입장에서 주목해야 할 신호가 있나요?',
  '이번 공시에서 경영진 톤이 달라진 부분이 있나요?',
  '단기 유동성 위험이 있나요?',
  '위험 요인 항목에서 새로 추가된 내용은 무엇인가요?',
];

// Stub responses keyed by question fragment — real implementation would call an LLM
// grounded in the company's loaded filing data.
const STUB_RESPONSES = {
  '부채': '이번 분기 공시 기준으로, 부채비율은 전분기 대비 소폭 상승하였으나 업종 평균 대비 양호한 수준입니다. 다만 유동부채 비중이 증가하여 단기 상환 부담이 커지고 있는 점은 주의가 필요합니다. 근거 체인의 "재무 변동" 항목에서 관련 원문 발췌를 확인할 수 있습니다.',
  '재무 지표': '매출액은 전분기 대비 약 2.2% 증가하였으나, 영업현금흐름은 오히려 감소하였습니다. 유동자산이 24% 급증한 반면 현금성 자산 증가폭은 제한적이어서 재고 부담이 실질 현금 흐름을 압박하고 있을 가능성이 있습니다.',
  '배당': '최근 6개 분기 기준으로 배당 관련 공시 변경 사항은 감지되지 않았습니다. 다만 영업현금흐름 감소 추세가 지속될 경우 향후 배당 여력에 영향을 줄 수 있으며, 지배구조·공시 점수가 이번 분기에도 안정적으로 유지되고 있는 점은 긍정적입니다.',
  '경영진': '이번 분기 MD&A(경영진 논의·분석) 섹션에서 "글로벌 수요 불확실성"과 "공급망 재편" 관련 표현이 이전 분기 대비 더 빈번하게 등장하였습니다. 특히 반도체 부문 전망 표현이 "성장 기대"에서 "수요 회복 모니터링"으로 완화되었습니다.',
  '유동성': '유동비율은 전분기 대비 소폭 하락하였으나 여전히 100% 이상을 유지하고 있습니다. 단기차입금 증가와 맞물려 유동성 리스크가 완전히 없다고 보기는 어렵지만, 현재 시점에서 즉각적인 위험 수준은 아닙니다.',
  '위험 요인': '이번 공시에서 "지정학적 리스크"와 "원자재 가격 변동성" 항목이 신규 추가되었습니다. 기존 위험 요인 항목과 비교하면 총 2건의 추가, 1건의 수정이 감지됐으며, 서술형 항목 변경 탭에서 전후 비교를 확인할 수 있습니다.',
};

function getStubResponse(question) {
  const match = Object.keys(STUB_RESPONSES).find((key) => question.includes(key));
  if (match) return STUB_RESPONSES[match];
  return '해당 질문에 대한 분석은 공시 데이터를 기반으로 준비 중입니다. 위의 추천 질문을 통해 주요 리스크 항목을 먼저 확인해보세요.';
}

function Message({ msg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {msg.role === 'assistant' && (
        <div className="mr-2 mt-1 shrink-0 rounded-full bg-blue-100 p-1.5">
          <Sparkles size={12} className="text-blue-600" />
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          msg.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-white border border-slate-200 text-slate-700'
        }`}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2"
    >
      <div className="rounded-full bg-blue-100 p-1.5">
        <Sparkles size={12} className="text-blue-600" />
      </div>
      <div className="flex gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-slate-400"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/**
 * @param {{ companyName: string }} props
 */
export function AiAnalysisTab({ companyName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  function sendMessage(text) {
    if (!text.trim() || isTyping) return;
    const userMsg = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Stub: simulate network delay then echo a canned response
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: getStubResponse(text) },
      ]);
    }, 1200 + Math.random() * 600);
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col" style={{ minHeight: '520px' }}>
      {/* Intro header */}
      <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
        <Sparkles size={15} className="text-blue-600" />
        <span className="text-base font-semibold text-slate-900">{companyName} 공시 분석 AI</span>
        <span className="ml-auto text-xs text-slate-500">공시 원문 기반 · 투자 조언 아님</span>
      </div>

      {/* Message area */}
      <div className="flex-1 space-y-3 overflow-y-auto pb-2">
        <AnimatePresence>
          {isEmpty && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="mb-3 text-xs font-medium text-slate-500">추천 질문</p>
              <div className="space-y-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700"
                  >
                    {q}
                    <ChevronRight size={14} className="ml-2 shrink-0 text-slate-300" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}

        <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex items-end gap-2 border-t border-slate-100 pt-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          placeholder="공시 내용에 대해 질문하세요..."
          rows={1}
          className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          style={{ maxHeight: '120px' }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isTyping}
          className="shrink-0 rounded-xl bg-blue-600 p-2.5 text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>

      {!isEmpty && (
        <p className="mt-2 text-center text-xs text-slate-500">
          AI 응답은 공시 원문을 기반으로 생성됩니다. 투자 조언이 아닙니다.
        </p>
      )}
    </div>
  );
}
