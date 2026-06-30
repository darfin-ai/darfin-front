import { request } from './apiClient';

export async function getUserProfile() {
  return request('/api/v1/users/me', { method: 'GET' });
}

export async function updateNickname(nickname) {
  return request('/api/v1/users/me/nickname', {
    method: 'PATCH',
    body: JSON.stringify({ nickname }),
  });
}

export async function updatePassword({ currentPassword, newPassword }) {
  return request('/api/v1/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function updateProfileImage(imageUrl) {
  return request('/api/v1/users/me/profile-image', {
    method: 'PATCH',
    body: JSON.stringify({ imageUrl }),
  });
}

export async function deleteProfileImage() {
  return request('/api/v1/users/me/profile-image', { method: 'DELETE' });
}

export async function deleteAccount(currentPassword) {
  return request('/api/v1/users/me', {
    method: 'DELETE',
    body: JSON.stringify({ currentPassword }),
  });
}

export async function deleteSocialAccount() {
  return request('/api/v1/users/me/social', { method: 'DELETE' });
}
