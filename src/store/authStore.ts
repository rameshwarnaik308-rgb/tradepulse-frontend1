import { create } from 'zustand';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: 'free' | 'pro';
  avatar_url?: string;
  two_fa_enabled?: boolean;
  trade_count_this_month?: number;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string, twoFaToken?: string) => Promise<any>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  setUser: (user) => set({ user }),

  login: async (email, password, twoFaToken) => {
    set({ loading: true });
    try {
      const res = await authAPI.login({ email, password, twoFaToken });
      const { user, accessToken, refreshToken, requires2FA } = res.data;

      if (requires2FA) {
        set({ loading: false });
        return { requires2FA: true };
      }

      localStorage.setItem('tp_access_token', accessToken);
      localStorage.setItem('tp_refresh_token', refreshToken);
      set({ user, loading: false });
      return { success: true };
    } catch (err: any) {
      set({ loading: false });
      throw new Error(err.response?.data?.error || 'Login failed');
    }
  },

  logout: () => {
    localStorage.removeItem('tp_access_token');
    localStorage.removeItem('tp_refresh_token');
    set({ user: null });
    window.location.href = '/login';
  },

  fetchMe: async () => {
    const token = localStorage.getItem('tp_access_token');
    if (!token) { set({ initialized: true }); return; }
    try {
      const res = await authAPI.me();
      set({ user: res.data.user, initialized: true });
    } catch {
      localStorage.removeItem('tp_access_token');
      set({ user: null, initialized: true });
    }
  },
}));
