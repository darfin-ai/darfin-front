import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

const CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY;

// 백엔드(TossPaymentsClient)와 동일한 규칙으로 customerKey를 생성한다.
export function buildCustomerKey(userId) {
  return `USER_${userId}`;
}

// 카드 등록(자동결제 빌링키 발급) 플로우 시작 — 토스 호스팅 페이지로 리다이렉트되며
// 완료 후 successUrl(/billing/callback/success)로 authKey와 함께 돌아온다.
export async function startCardRegistration({ userId, customerEmail, customerName }) {
  if (!CLIENT_KEY) {
    throw new Error('결제 모듈 설정이 완료되지 않았습니다. (VITE_TOSS_CLIENT_KEY 누락)');
  }
  const tossPayments = await loadTossPayments(CLIENT_KEY);
  const payment = tossPayments.payment({ customerKey: buildCustomerKey(userId) });

  const origin = window.location.origin;
  await payment.requestBillingAuth({
    method: 'CARD',
    successUrl: `${origin}/billing/callback/success`,
    failUrl: `${origin}/billing/callback/fail`,
    customerEmail,
    customerName,
  });
}
