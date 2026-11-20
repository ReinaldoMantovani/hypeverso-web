'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, ApiError } from '@/lib/api';

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  level: number;
  xp: number;
  avatarUrl?: string | null;
  emailVerifiedAt?: string | null;
  mfaEnabled?: boolean;
  isPremium?: boolean;
  subscription?: { status?: string; currentPeriodEnd?: string | null } | null;
};

export type LoginResult = { mfaRequired: true; mfaToken: string } | { mfaRequired?: false };

type State = {
  user: User | null;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyMfa: (mfaToken: string, code: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  loadMe: () => Promise<void>;
  logout: () => Promise<void>;
};

/** Premium ativo dentro do período pago. */
export function isPremiumUser(user: User | null | undefined) {
  if (!user) return false;
  if (typeof user.isPremium === 'boolean') return user.isPremium;
  const sub = user.subscription;
  return sub?.status === 'ACTIVE' && (!sub.currentPeriodEnd || new Date(sub.currentPeriodEnd) > new Date());
}

// Só dados de perfil (não sensíveis) ficam no localStorage para render rápido;
// os tokens ficam exclusivamente em cookies HttpOnly.
export const useAuth = create<State>()(
  persist(
    set => ({
      user: null,
      hydrated: false,
      setHydrated: hydrated => set({ hydrated }),
      login: async (email, password) => {
        const r = await api<any>(
          '/api/auth/login',
          { method: 'POST', body: JSON.stringify({ email, password }) },
          false,
        );
        if (r?.mfaRequired) return { mfaRequired: true, mfaToken: r.mfaToken };
        set({ user: r.user });
        return { mfaRequired: false };
      },
      verifyMfa: async (mfaToken, code) => {
        const r = await api<any>(
          '/api/auth/mfa/verify',
          { method: 'POST', body: JSON.stringify({ mfaToken, code }) },
          false,
        );
        set({ user: r.user });
      },
      register: async data => {
        const r = await api<any>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }, false);
        set({ user: r.user });
      },
      loadMe: async () => {
        try {
          const user = await api<User>('/api/me');
          set({ user });
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) set({ user: null });
        }
      },
      logout: async () => {
        try {
          await api('/api/auth/logout', { method: 'POST' }, false);
        } catch {
        } finally {
          set({ user: null });
        }
      },
    }),
    {
      name: 'nexverse-auth',
      partialize: s => ({ user: s.user }),
      onRehydrateStorage: () => state => {
        state?.setHydrated(true);
        // Remove o token legado salvo por versões anteriores.
        try {
          localStorage.removeItem('nv_access');
        } catch {}
      },
    },
  ),
);
