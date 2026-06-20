import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach JWT token ───────────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('tp_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auto-refresh on 401 ────────────────────────────────────
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (error.response?.data?.code === 'TOKEN_EXPIRED') {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('tp_refresh_token');
        if (!refreshToken) {
          localStorage.removeItem('tp_access_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh } = res.data;
          localStorage.setItem('tp_access_token', accessToken);
          localStorage.setItem('tp_refresh_token', newRefresh);
          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          return api(originalRequest);
        } catch (err) {
          processQueue(err, null);
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

// ── API methods ────────────────────────────────────────────
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  googleLogin: (idToken: string) => api.post('/auth/google', { idToken }),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  setup2FA: () => api.post('/auth/2fa/setup'),
  enable2FA: (token: string) => api.post('/auth/2fa/enable', { token }),
};

export const tradesAPI = {
  list: (params?: any) => api.get('/trades', { params }),
  get: (id: string) => api.get(`/trades/${id}`),
  create: (data: any) => api.post('/trades', data),
  update: (id: string, data: any) => api.put(`/trades/${id}`, data),
  delete: (id: string) => api.delete(`/trades/${id}`),
  analyze: (id: string) => api.post(`/trades/${id}/analyze`),
};

export const analyticsAPI = {
  dashboard: (period?: number) => api.get('/analytics/dashboard', { params: { period } }),
  drawdown: () => api.get('/analytics/drawdown'),
  monthly: () => api.get('/analytics/monthly'),
  psychology: () => api.get('/analytics/psychology'),
};

export const paymentsAPI = {
  create: () => api.post('/payments/create'),
  status: (id: string) => api.get(`/payments/status/${id}`),
  history: () => api.get('/payments/history'),
  subscription: () => api.get('/payments/subscription'),
};

export const aiAPI = {
  chat: (message: string, history?: any[]) => api.post('/ai/chat', { message, history }),
  report: (type: 'weekly' | 'monthly') => api.get(`/ai/report/${type}`),
  patterns: () => api.get('/ai/patterns'),
  reportsHistory: () => api.get('/ai/reports/history'),
};

export const journalAPI = {
  list: (params?: any) => api.get('/journal', { params }),
  create: (data: any) => api.post('/journal', data),
  update: (id: string, data: any) => api.put(`/journal/${id}`, data),
  delete: (id: string) => api.delete(`/journal/${id}`),
};

export const smcAPI = {
  list: (params?: any) => api.get('/smc', { params }),
  create: (data: any) => api.post('/smc', data),
  updateStatus: (id: string, status: string) => api.patch(`/smc/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/smc/${id}`),
};

export const importAPI = {
  upload: (broker: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/import/${broker}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  users: (params?: any) => api.get('/admin/users', { params }),
  updateUserRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  updateUserPlan: (id: string, plan: string, days?: number) => api.patch(`/admin/users/${id}/plan`, { plan, days }),
  tickets: () => api.get('/admin/tickets'),
  updateTicket: (id: string, data: any) => api.patch(`/admin/tickets/${id}`, data),
  auditLogs: () => api.get('/admin/audit-logs'),
  revenue: () => api.get('/payments/admin/revenue'),
  payments: (params?: any) => api.get('/payments/admin/all', { params }),
};

export default api;
