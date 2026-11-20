'use client';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/auth';

export function NotificationBell() {
  const user = useAuth(s => s.user);
  const q = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => api<{ count: number }>('/api/notifications/unread-count'),
    enabled: !!user,
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
    staleTime: 5_000,
  });
  if (!user) return null;
  const count = q.data?.count ?? 0;
  return (
    <Link
      href="/notificacoes"
      className="relative rounded-xl p-2 hover:bg-white/10"
      title="Notificações"
      aria-label={`${count} notificações não lidas`}
    >
      <Bell size={18} />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-violet-600 px-1 text-[10px] font-black leading-none text-white ring-2 ring-[#05030b]">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
