const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('terranova_token') : null;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options?.headers },
  });
  if (!response.ok) throw new Error((await response.text()) || `Error HTTP ${response.status}`);
  return response.json();
}

export const terranovaApi = {
  login: (email: string, password: string) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  setToken: (token: string) => localStorage.setItem('terranova_token', token),
  logout: () => { localStorage.removeItem('terranova_token'); localStorage.removeItem('terranova_user'); },
  setUser: (user: unknown) => localStorage.setItem('terranova_user', JSON.stringify(user)),
  getUser: () => { try { return JSON.parse(localStorage.getItem('terranova_user') || 'null'); } catch { return null; } },
  hasToken: () => typeof window !== 'undefined' && !!localStorage.getItem('terranova_token'),
  dashboard: () => request<any>('/dashboard', { cache: 'no-store' }),
  createPromotion: (data: unknown) => request<any>('/promotions', { method: 'POST', body: JSON.stringify(data) }),
  createSchedule: (data: unknown) => request('/schedules', { method: 'POST', body: JSON.stringify(data) }),
  updatePromotion: (id: number, data: unknown) => request(`/promotions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  setPromotionStatus: (id: number, active: boolean) => request(`/promotions/${id}/status`, { method: 'PATCH', body: JSON.stringify({ active }) }),
  updateSchedule: (id: number, data: unknown) => request(`/schedules/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  replaceSchedules: (id: number, days: number[], sendTime: string, active: boolean) => request(`/promotions/${id}/schedules`, { method: 'POST', body: JSON.stringify({ days, sendTime, active }) }),
  deletePromotion: (id: number) => request(`/promotions/${id}`, { method: 'DELETE' }),
  sendPromotion: (id: number) => request(`/promotions/${id}/send`, { method: 'POST' }),
  duplicatePromotion: (id: number) => request<any>(`/promotions/${id}/duplicate`, { method: 'POST' }),
  saveSetting: (key: string, value: string) => request('/settings', { method: 'POST', body: JSON.stringify({ key, value }) }),
  createConfiguration: (data: unknown) => request<any>('/configurations', { method: 'POST', body: JSON.stringify(data) }),
  deleteConfiguration: (id: number) => request(`/configurations/${id}`, { method: 'DELETE' }),
};
