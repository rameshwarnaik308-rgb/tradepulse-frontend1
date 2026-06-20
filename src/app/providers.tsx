// src/app/providers.tsx
'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function Providers({ children }: { children: React.ReactNode }) {
  const fetchMe = useAuthStore(s => s.fetchMe);
  useEffect(() => { fetchMe(); }, []);
  return <>{children}</>;
}
