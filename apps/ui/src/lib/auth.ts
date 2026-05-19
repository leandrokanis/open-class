const API_URL =
  `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api`;

export interface AuthError {
  status: number;
  message: string;
}

export interface AuthResult<T = void> {
  data?: T;
  error?: AuthError;
}

async function post<T>(path: string, body: unknown): Promise<AuthResult<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
  } catch {
    return { error: { status: 0, message: 'Erro de conexão. Verifique sua internet.' } };
  }

  if (res.ok) {
    const json = await res.json().catch(() => ({}));
    return { data: json as T };
  }

  const json = await res.json().catch(() => ({}));
  const message =
    res.status === 401
      ? 'E-mail ou senha incorretos'
      : res.status === 403
        ? 'Conta desativada. Entre em contato com o suporte'
        : res.status === 409
          ? 'Este e-mail já está cadastrado'
          : res.status === 400
            ? 'Link inválido ou expirado. Solicite um novo.'
            : (json as { message?: string }).message ?? 'Ocorreu um erro. Tente novamente.';

  return { error: { status: res.status, message } };
}

export function login(email: string, password: string) {
  return post('/auth/login', { email, password });
}

export function register(name: string, email: string, password: string) {
  return post('/auth/register', { name, email, password });
}

export function forgotPassword(email: string) {
  return post('/auth/forgot-password', { email });
}

export function resetPassword(token: string, password: string) {
  return post('/auth/reset-password', { token, password });
}

export function loginWithGoogle() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  window.location.href = `${base}/api/auth/google`;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
}

export async function getMe(): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
  } catch { /* ignore */ }
}
