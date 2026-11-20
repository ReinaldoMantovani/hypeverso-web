'use client';
import { useMemo, useState } from 'react';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/ui';
import { api } from '@/lib/api';
import { uploadImage } from '@/lib/upload-image';
import { assetUrl } from '@/lib/asset-url';
import { useAuth } from '@/stores/auth';

type Props = { profile: { id: string; name: string; username: string; avatarUrl?: string | null } };
const imageAccept = 'image/jpeg,image/png,image/webp,image/gif,image/avif';

export function ProfileAvatarEditor({ profile }: Props) {
  const router = useRouter();
  const { user, loadMe } = useAuth();
  const ownProfile = user?.id === profile.id;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const avatar = useMemo(
    () => (ownProfile ? (user?.avatarUrl ?? profile.avatarUrl) : profile.avatarUrl),
    [ownProfile, user?.avatarUrl, profile.avatarUrl],
  );

  async function updateAvatar(file: File | null) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const uploaded = await uploadImage(file, 'avatar');
      await api('/api/me', { method: 'PATCH', body: JSON.stringify({ avatarUrl: uploaded.url }) });
      await loadMe();
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Não foi possível atualizar o avatar.');
    } finally {
      setBusy(false);
    }
  }

  async function removeAvatar() {
    setBusy(true);
    setError(null);
    try {
      await api('/api/me', { method: 'PATCH', body: JSON.stringify({ avatarUrl: null }) });
      await loadMe();
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Não foi possível remover o avatar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shrink-0">
      <div className="relative grid h-28 w-28 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 to-cyan-400 text-4xl font-black text-black">
        {avatar ? (
          <img className="h-full w-full object-cover" src={assetUrl(avatar)} alt={`Avatar de ${profile.name}`} />
        ) : (
          profile.name[0]
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-black/65 text-white">
            <Loader2 className="animate-spin" />
          </div>
        )}
      </div>
      {ownProfile && (
        <div className="mt-3 flex max-w-44 flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold hover:bg-white/5">
            <Camera size={14} />
            {avatar ? 'Trocar avatar' : 'Adicionar avatar'}
            <input
              className="hidden"
              type="file"
              accept={imageAccept}
              disabled={busy}
              onChange={e => void updateAvatar(e.target.files?.[0] || null)}
            />
          </label>
          {avatar && (
            <Button
              type="button"
              variant="ghost"
              className="h-8 px-2 text-xs"
              disabled={busy}
              onClick={() => void removeAvatar()}
            >
              <Trash2 size={13} />
              Remover
            </Button>
          )}
          <p className="w-full text-[11px] leading-4 text-white/35">
            A imagem é verificada automaticamente antes de ser usada no perfil.
          </p>
          {error && <p className="w-full text-xs text-rose-300">{error}</p>}
        </div>
      )}
    </div>
  );
}
