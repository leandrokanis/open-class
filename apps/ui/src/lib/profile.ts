const API_URL =
  `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api`;

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  bio: string | null;
  avatarUrl: string | null;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResult<T = void> {
  data?: T;
  error?: string;
}

async function request<T>(
  path: string,
  options: RequestInit,
): Promise<ProfileResult<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
      ...options,
    });
  } catch {
    return { error: 'Erro de conexão. Verifique sua internet.' };
  }

  if (res.ok) {
    if (res.status === 204) return { data: undefined as T };
    const json = await res.json().catch(() => ({}));
    return { data: json as T };
  }

  const json = await res.json().catch(() => ({}));
  const message = (json as { message?: string }).message ?? 'Ocorreu um erro. Tente novamente.';
  return { error: message };
}

export function getProfile(): Promise<ProfileResult<ProfileData>> {
  return request<ProfileData>('/users/me', { method: 'GET' });
}

export function updateProfile(data: { name?: string; bio?: string }): Promise<ProfileResult<ProfileData>> {
  return request<ProfileData>('/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function uploadAvatar(file: File): Promise<ProfileResult<ProfileData>> {
  const form = new FormData();
  form.append('avatar', file);
  return request<ProfileData>('/users/me/avatar', { method: 'POST', body: form });
}

export function deleteAvatar(): Promise<ProfileResult<ProfileData>> {
  return request<ProfileData>('/users/me/avatar', { method: 'DELETE' });
}

export function changePassword(data: {
  currentPassword?: string;
  newPassword: string;
}): Promise<ProfileResult> {
  return request('/auth/change-password', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
