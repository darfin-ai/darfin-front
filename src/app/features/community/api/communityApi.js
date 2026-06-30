import { request } from '../../../shared/api/apiClient';

// 종목 검색
export function searchStocks(keyword) {
  const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
  return request(`/api/community/stocks${query}`);
}

// 질문 목록
export function getQuestions(search) {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return request(`/api/community/questions${query}`);
}

// 질문 상세 (조회수 자동 +1)
export function getQuestion(id) {
  return request(`/api/community/questions/${id}`);
}

// 질문 작성
export function createQuestion({ title, content, dartCorpCode }) {
  const body = { title, content };
  if (dartCorpCode) body.dartCorpCode = dartCorpCode;
  return request('/api/community/questions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// 질문 수정
export function updateQuestion(id, { title, content, dartCorpCode }) {
  return request(`/api/community/questions/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, content, dartCorpCode }),
  });
}

// 질문 삭제
export function deleteQuestion(id) {
  return request(`/api/community/questions/${id}`, { method: 'DELETE' });
}

// 질문 해결됨 처리
export function resolveQuestion(id) {
  return request(`/api/community/questions/${id}/resolve`, { method: 'PATCH' });
}

// 답변 목록
export function getAnswers(questionId) {
  return request(`/api/community/questions/${questionId}/answers`);
}

// 답변 작성
export function createAnswer(questionId, content) {
  return request(`/api/community/questions/${questionId}/answers`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

// 답변 채택 (isAdopted=true + 질문 isResolved=true 동시 처리)
export function acceptAnswer(answerId) {
  return request(`/api/community/answers/${answerId}/accept`, { method: 'PATCH' });
}

// 대댓글 목록
export function getReplies(answerId) {
  return request(`/api/community/answers/${answerId}/replies`);
}

// 대댓글 작성
export function createReply(answerId, content) {
  return request(`/api/community/answers/${answerId}/replies`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

// 대댓글 삭제
export function deleteReply(replyId) {
  return request(`/api/community/replies/${replyId}`, { method: 'DELETE' });
}
