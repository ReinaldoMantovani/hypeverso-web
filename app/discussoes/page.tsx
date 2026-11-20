'use client';
import { useQuery } from '@tanstack/react-query';
import { CalendarClock, MessagesSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { ThreadCard, type Thread } from '@/components/catalog/catalog-threads';

export default function DiscussionsPage() {
  const upcoming = useQuery({
    queryKey: ['threads', 'upcoming'],
    queryFn: () => api<Thread[]>('/api/threads?kind=WATCH_PARTY&upcoming=1'),
  });
  const recent = useQuery({ queryKey: ['threads', 'recent'], queryFn: () => api<Thread[]>('/api/threads') });
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-black">Discussões</h1>
      <p className="mt-2 text-white/50">Threads de episódio e watch parties com proteção de spoiler.</p>
      <h2 className="mt-10 flex items-center gap-2 text-xl font-bold">
        <CalendarClock size={18} className="text-cyan-300" /> Próximas watch parties
      </h2>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {(upcoming.data || []).map(t => (
          <li key={t.id}>
            <ThreadCard thread={t} />
          </li>
        ))}
        {upcoming.data && !upcoming.data.length && (
          <li className="text-sm text-white/40">
            Nenhuma watch party marcada. Crie uma na página de uma obra do catálogo.
          </li>
        )}
      </ul>
      <h2 className="mt-10 flex items-center gap-2 text-xl font-bold">
        <MessagesSquare size={18} className="text-violet-300" /> Discussões recentes
      </h2>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {(recent.data || []).map(t => (
          <li key={t.id}>
            <ThreadCard thread={t} />
          </li>
        ))}
      </ul>
    </section>
  );
}
