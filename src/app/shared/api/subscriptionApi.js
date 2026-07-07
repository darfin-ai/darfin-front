import { request } from './apiClient';

export async function getPlans() {
  return request('/api/v1/subscriptions/plans', { method: 'GET' });
}

export async function getMySubscription() {
  return request('/api/v1/subscriptions/me', { method: 'GET' });
}

export async function changePlan(planName) {
  return request('/api/v1/subscriptions/change', {
    method: 'POST',
    body: JSON.stringify({ planName }),
  });
}

export async function cancelSubscription() {
  return request('/api/v1/subscriptions/cancel', { method: 'POST' });
}

export async function resumeSubscription() {
  return request('/api/v1/subscriptions/resume', { method: 'POST' });
}
