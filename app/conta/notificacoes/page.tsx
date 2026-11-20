'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Bell, Mail } from 'lucide-react';
import { Button, Card } from '@/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/auth';
import { AccountNav } from '@/components/account-nav';
import { PushSettings } from '@/components/engagement/push-settings';
import { NewsNotificationPreferences } from '@/components/news-notification-preferences';

type Category = { id: string; name: string };
type Newsletter = { subscription: { status: string; categoryIds: string[] } | null; email: string };

export default function NotificationSettingsPage() {
  const { user, hydrated } = useAuth();
  const categories = useQuery({ queryKey: ['categories'], queryFn: () => api<Category[]>('/api/categories') });
  const newsletter = useQuery({
    queryKey: ['newsletter-me'],
    queryFn: () => api<Newsletter>('/api/newsletter/me'),
    enabled: !!user,
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (newsletter.data?.subscription) setSelected(newsletter.data.subscription.categoryIds);
  }, [newsletter.data]);
  const status = newsletter.data?.subscription?.status;

  async function saveNewsletter(subscribed: boolean) {
    setMessage('');
    try {
      const r = await api<{ status: string }>('/api/newsletter/me', {
        method: 'PUT',
        body: JSON.stringify({ subscribed, categoryIds: selected }),
      });
      setMessage(
        r.status === 'pending'
          ? 'Enviamos um link de confirmação para o seu e-mail.'
          : r.status === 'confirmed'
            ? 'Newsletter atualizada.'
            : 'Inscrição cancelada.',
      );
      await newsletter.refetch();
    } catch (e: any) {
      setMessage(e?.message || 'Não foi possível salvar.');
    }
  }

  if (hydrated && !user)
    return (
      <section className="mx-auto max-w-2xl px-4 py-14">
        <Card className="p-7">
          <h1 className="text-2xl font-black">Notificações</h1>
          <p className="mt-2 text-white/55">Entre para configurar notificações e a newsletter.</p>
          <Link href="/login">
            <Button className="mt-5">Entrar</Button>
          </Link>
        </Card>
      </section>
    );

  return (
    <section className="mx-auto max-w-3xl space-y-5 px-4 py-14" data-no-i18n>
      <AccountNav />
      <h1 className="flex items-center gap-2 text-3xl font-black">
        <Bell className="text-violet-300" /> Notificações e newsletter
      </h1>
      <Card className="p-6">
        <h2 className="text-lg font-bold">Notificações push (navegador/app)</h2>
        <div className="mt-3">
          <PushSettings categories={categories.data || []} />
        </div>
      </Card>
      <Card className="p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Mail size={18} /> Newsletter semanal
        </h2>
        <p className="mt-1 text-sm text-white/55">
          Status:{' '}
          <b>
            {status === 'CONFIRMED' ? 'inscrito' : status === 'PENDING' ? 'aguardando confirmação' : 'não inscrito'}
          </b>
          . Escolha categorias (nenhuma = todas).
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(categories.data || []).map(c => (
            <button
              key={c.id}
              type="button"
              aria-pressed={selected.includes(c.id)}
              onClick={() => setSelected(s => (s.includes(c.id) ? s.filter(x => x !== c.id) : [...s, c.id]))}
              className={`rounded-full border px-3 py-1 text-xs ${selected.includes(c.id) ? 'border-violet-400/50 bg-violet-500/20 text-violet-100' : 'border-white/10 text-white/55'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => void saveNewsletter(true)}>
            {status === 'CONFIRMED' ? 'Salvar categorias' : 'Assinar newsletter'}
          </Button>
          {status && status !== 'UNSUBSCRIBED' && (
            <Button variant="outline" onClick={() => void saveNewsletter(false)}>
              Cancelar inscrição
            </Button>
          )}
        </div>
        {message && <p className="mt-3 text-sm text-emerald-300">{message}</p>}
      </Card>
      <Card className="p-6">
        <h2 className="text-lg font-bold">Notificações no site</h2>
        <div className="mt-3">
          <NewsNotificationPreferences profileUsername={user?.username || ''} />
        </div>
      </Card>
    </section>
  );
}
