import { request } from './apiClient';

export async function registerCard(authKey, cardName) {
  return request('/api/v1/billing/methods', {
    method: 'POST',
    body: JSON.stringify({ authKey, cardName }),
  });
}

export async function getPaymentMethods() {
  return request('/api/v1/billing/methods', { method: 'GET' });
}

export async function deletePaymentMethod(id) {
  return request(`/api/v1/billing/methods/${id}`, { method: 'DELETE' });
}

export async function setDefaultPaymentMethod(id) {
  return request(`/api/v1/billing/methods/${id}/default`, { method: 'PATCH' });
}

export async function getBillingHistory() {
  return request('/api/v1/billing/history', { method: 'GET' });
}

export async function refundPayment(id, reason) {
  return request(`/api/v1/billing/history/${id}/refund`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}
