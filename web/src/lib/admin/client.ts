import { API_URL } from '@/lib/api';

const TOKEN_KEY = 'nq_admin_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

interface ListParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/login')) {
      window.location.href = '/admin/login';
    }
    throw new Error('Sesión expirada.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || 'Error en la petición.');
  return data as T;
}

export const api = {
  // --- Auth ---
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ user: any }>('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ success: boolean }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // --- CRUD genérico ---
  list: <T = any>(resource: string, params: ListParams = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && v !== '' && q.set(k, String(v)));
    return request<{ data: T[]; meta: { total: number; page: number; perPage: number; totalPages: number } }>(
      `/admin/${resource}?${q.toString()}`
    );
  },
  get: <T = any>(resource: string, id: number) => request<{ data: T }>(`/admin/${resource}/${id}`),
  create: <T = any>(resource: string, body: any) =>
    request<{ data: T }>(`/admin/${resource}`, { method: 'POST', body: JSON.stringify(body) }),
  update: <T = any>(resource: string, id: number, body: any) =>
    request<{ data: T }>(`/admin/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  toggle: (resource: string, id: number) =>
    request(`/admin/${resource}/${id}/toggle`, { method: 'PATCH' }),
  remove: (resource: string, id: number) =>
    request<{ success: boolean }>(`/admin/${resource}/${id}`, { method: 'DELETE' }),

  // --- Media ---
  upload: async (files: FileList | File[], folder = 'general') => {
    const token = getToken();
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append('files', f));
    fd.append('folder', folder);
    const res = await fetch(`${API_URL}/api/admin/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as any).error || 'Error al subir archivos.');
    return data as { data: any[] };
  },
  deleteMedia: (id: number) =>
    request<{ success: boolean }>(`/admin/media/${id}`, { method: 'DELETE' }),
};
