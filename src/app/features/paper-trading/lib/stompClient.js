import { Client } from '@stomp/stompjs';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const BROKER_URL = BASE_URL.replace(/^http/, 'ws') + '/ws/stomp';

// 싱글턴 STOMP 클라이언트 — 앱 전체에서 하나의 WebSocket 연결만 유지한다.
export const stompClient = new Client({
  brokerURL: BROKER_URL,
  reconnectDelay: 3000,
  heartbeatIncoming: 10000,
  heartbeatOutgoing: 10000,
});

// destination별 등록된 구독자 목록 — 재연결 시 전부 다시 구독해야 하므로 상태로 유지한다.
const registrations = new Map(); // destination -> Set<{ callback, sub }>

function subscribeEntry(destination, entry) {
  entry.sub = stompClient.subscribe(destination, (message) => {
    try {
      entry.callback(message.body ? JSON.parse(message.body) : null);
    } catch (e) {
      console.warn('STOMP 메시지 파싱 실패', destination, e);
    }
  });
}

stompClient.onConnect = () => {
  registrations.forEach((entries, destination) => {
    entries.forEach((entry) => subscribeEntry(destination, entry));
  });
};

let activated = false;

/** 최초 호출 시 1회 연결. 이미 연결되어 있으면 아무 것도 하지 않는다. */
export function ensureConnected() {
  if (activated) return;
  activated = true;
  stompClient.activate();
}

/**
 * destination 구독 헬퍼 — 연결 전이면 연결되는 즉시, 재연결 시에도 자동으로 다시 구독한다.
 * 반환값(구독 해제 함수)을 컴포넌트 언마운트/의존성 변경 시 호출해야 한다.
 */
export function subscribe(destination, callback) {
  const entry = { callback, sub: null };
  if (!registrations.has(destination)) registrations.set(destination, new Set());
  registrations.get(destination).add(entry);

  if (stompClient.connected) subscribeEntry(destination, entry);

  ensureConnected();

  return () => {
    const entries = registrations.get(destination);
    if (entries) {
      entries.delete(entry);
      if (entries.size === 0) registrations.delete(destination);
    }
    if (entry.sub) entry.sub.unsubscribe();
  };
}
