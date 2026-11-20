'use client';
import { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';
import { Button } from '@/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/auth';

type Category = { id: string; name: string };

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

/** Web Push: notícias (todas ou por categoria) e lembretes de lançamentos. */
export function PushSettings({ categories = [] }: { categories?: Category[] }) {
  const { user } = useAuth();
  const [supported, setSupported] = useState(true);
  const [config, setConfig] = useState<{ enabled: boolean; publicKey: string | null } | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [topics, setTopics] = useState<string[]>(['news']);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setSupported(false);
      return;
    }
    void api<{ enabled: boolean; publicKey: string | null }>('/api/push/public-key')
      .then(setConfig)
      .catch(() => setConfig({ enabled: false, publicKey: null }));
    void navigator.serviceWorker.getRegistration().then(async reg => {
      const sub = await reg?.pushManager.getSubscription();
      if (!sub) return;
      setSubscription(sub);
      const status = await api<{ topics: string[] }>('/api/push/status', {
        method: 'POST',
        body: JSON.stringify({ endpoint: sub.endpoint }),
      }).catch(() => null);
      if (status?.topics?.length) setTopics(status.topics);
    });
  }, []);

  async function save(nextTopics = topics) {
    setBusy(true);
    setMessage('');
    try {
      let sub = subscription;
      if (!sub) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') throw new Error('Permissão de notificações negada no navegador.');
        const reg =
          (await navigator.serviceWorker.getRegistration()) || (await navigator.serviceWorker.register('/sw.js'));
        await navigator.serviceWorker.ready;
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(config!.publicKey!),
        });
        setSubscription(sub);
      }
      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      await api('/api/push/subscribe', {
        method: 'POST',
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys, topics: nextTopics }),
      });
      setMessage('Preferências de notificação salvas.');
    } catch (err: any) {
      setMessage(err?.message || 'Não foi possível ativar as notificações.');
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    if (!subscription) return;
    setBusy(true);
    await api('/api/push/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    }).catch(() => undefined);
    await subscription.unsubscribe().catch(() => undefined);
    setSubscription(null);
    setBusy(false);
    setMessage('Notificações desativadas neste dispositivo.');
  }

  const toggle = (topic: string) => setTopics(t => (t.includes(topic) ? t.filter(x => x !== topic) : [...t, topic]));

  if (!supported)
    return (
      <p className="text-sm text-white/45">
        Este navegador não suporta notificações push. No iPhone, instale o app (Compartilhar › Adicionar à Tela de
        Início).
      </p>
    );
  if (config && !config.enabled)
    return <p className="text-sm text-white/45">As notificações push ainda não foram configuradas neste servidor.</p>;

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-sm">
        <BellRing size={16} className="text-violet-300" />
        {subscription ? 'Notificações ativas neste dispositivo.' : 'Receba alertas mesmo com o site fechado.'}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-white/65">
          <input
            type="checkbox"
            checked={topics.includes('news')}
            onChange={() => toggle('news')}
            className="accent-violet-500"
          />{' '}
          Todas as notícias
        </label>
        {user && (
          <label className="flex items-center gap-2 text-sm text-white/65">
            <input
              type="checkbox"
              checked={topics.includes('releases')}
              onChange={() => toggle('releases')}
              className="accent-violet-500"
            />{' '}
            Meus lembretes de lançamentos
          </label>
        )}
        {!topics.includes('news') &&
          categories.map(c => (
            <label key={c.id} className="flex items-center gap-2 text-sm text-white/55">
              <input
                type="checkbox"
                checked={topics.includes(`cat:${c.id}`)}
                onChange={() => toggle(`cat:${c.id}`)}
                className="accent-violet-500"
              />{' '}
              {c.name}
            </label>
          ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button disabled={busy || !config?.publicKey || !topics.length} onClick={() => void save()}>
          {subscription ? 'Salvar preferências' : 'Ativar notificações'}
        </Button>
        {subscription && (
          <Button variant="outline" disabled={busy} onClick={() => void disable()}>
            Desativar neste dispositivo
          </Button>
        )}
      </div>
      {message && <p className="text-xs text-white/55">{message}</p>}
    </div>
  );
}
