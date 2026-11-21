'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, ImagePlus, Info, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { api } from '@/lib/api';
import { uploadImage } from '@/lib/upload-image';
import { assetUrl } from '@/lib/asset-url';
import { MediaCatalogBrowser } from '@/components/media-catalog-browser';
import { Card, Button, Input } from '@/ui';

const labels: any = {
  WATCHING: 'Assistindo',
  WANT_TO_WATCH: 'Quero assistir',
  COMPLETED: 'Concluído',
  DROPPED: 'Abandonado',
  READING: 'Lendo',
  WANT_TO_READ: 'Quero ler',
  PLAYING: 'Jogando',
  WANT_TO_PLAY: 'Quero jogar',
};
const imageAccept = 'image/jpeg,image/png,image/webp,image/gif,image/avif';

export default function Library() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'catalog' | 'manual'>('catalog');
  const [form, setForm] = useState({ title: '', mediaType: 'MOVIE', status: 'WANT_TO_WATCH' });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [changingImageId, setChangingImageId] = useState<string | null>(null);
  const { data = [], error } = useQuery({ queryKey: ['library'], queryFn: () => api<any[]>('/api/library') });
  const { data: moderationHealth } = useQuery({
    queryKey: ['image-moderation-health'],
    queryFn: async () => {
      try {
        return await api<any>('/api/uploads/moderation-health');
      } catch (e: any) {
        return { ok: false, message: e?.message || 'Moderador iniciando' };
      }
    },
    // Só fica conferindo enquanto o moderador não estiver pronto.
    refetchInterval: q => (q.state.data?.ok ? false : 30000),
    staleTime: 5000,
  });

  function chooseImage(file: File | null) {
    setImage(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
    setMessage(null);
  }
  async function addManual(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      let coverUrl: string | null = null;
      if (image) {
        const uploaded = await uploadImage(image, 'library');
        coverUrl = uploaded.url;
      }
      await api('/api/library', {
        method: 'POST',
        body: JSON.stringify({ ...form, externalId: crypto.randomUUID(), coverUrl }),
      });
      setForm({ title: '', mediaType: 'MOVIE', status: 'WANT_TO_WATCH' });
      chooseImage(null);
      setOpen(false);
      await qc.invalidateQueries({ queryKey: ['library'] });
    } catch (e: any) {
      setMessage(e?.message || 'Não foi possível adicionar o item.');
    } finally {
      setSaving(false);
    }
  }
  async function replaceCover(id: string, file: File | null) {
    if (!file) return;
    setChangingImageId(id);
    setMessage(null);
    try {
      const uploaded = await uploadImage(file, 'library');
      await api(`/api/library/${id}`, { method: 'PATCH', body: JSON.stringify({ coverUrl: uploaded.url }) });
      await qc.invalidateQueries({ queryKey: ['library'] });
    } catch (e: any) {
      setMessage(e?.message || 'Não foi possível alterar a imagem.');
    } finally {
      setChangingImageId(null);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black">Minha biblioteca</h1>
          <p className="mt-2 text-white/50">Acompanhe filmes, séries, games, anime, mangás e HQs.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(true);
              setMode('catalog');
            }}
          >
            Explorar catálogo
          </Button>
          <Button onClick={() => setOpen(!open)}>
            <Plus size={17} />
            Adicionar item
          </Button>
        </div>
      </div>

      {open && (
        <Card className="mt-6 p-5">
          <div className="mb-5 flex gap-2 border-b border-white/10 pb-4">
            <button
              type="button"
              onClick={() => setMode('catalog')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${mode === 'catalog' ? 'bg-violet-600 text-white' : 'text-white/55 hover:bg-white/5'}`}
            >
              Catálogo automático
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${mode === 'manual' ? 'bg-violet-600 text-white' : 'text-white/55 hover:bg-white/5'}`}
            >
              Cadastro manual
            </button>
          </div>
          {mode === 'catalog' ? (
            <>
              <div className="mb-4 flex items-start gap-3 rounded-xl border border-cyan-400/15 bg-cyan-400/5 p-4 text-sm text-white/60">
                <Info size={18} className="mt-0.5 shrink-0 text-cyan-300" />
                <p>
                  Pesquise uma obra e o Hypeverso preenche automaticamente capa, sinopse, ano, gêneros e metadados.
                  Anime e mangá funcionam sem chave externa; filmes/séries e games dependem das credenciais dos
                  respectivos provedores configuradas no backend.
                </p>
              </div>
              <MediaCatalogBrowser compact />
            </>
          ) : (
            <form onSubmit={addManual} className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[1fr_190px_210px_auto]">
                <Input
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Título"
                />
                <select
                  value={form.mediaType}
                  onChange={e => setForm({ ...form, mediaType: e.target.value })}
                  className="h-11 rounded-xl border border-white/10 bg-[#0b0714] px-3"
                >
                  <option value="MOVIE">Filme</option>
                  <option value="SERIES">Série</option>
                  <option value="GAME">Game</option>
                  <option value="ANIME">Anime</option>
                  <option value="MANGA">Mangá</option>
                  <option value="COMIC">HQ</option>
                </select>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="h-11 rounded-xl border border-white/10 bg-[#0b0714] px-3"
                >
                  <option value="WATCHING">Assistindo</option>
                  <option value="WANT_TO_WATCH">Quero assistir</option>
                  <option value="COMPLETED">Concluído</option>
                  <option value="DROPPED">Abandonado</option>
                  <option value="READING">Lendo</option>
                  <option value="WANT_TO_READ">Quero ler</option>
                  <option value="PLAYING">Jogando</option>
                  <option value="WANT_TO_PLAY">Quero jogar</option>
                </select>
                <Button disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="grid h-28 w-20 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  {preview ? (
                    <img src={preview} alt="Prévia da capa" className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus className="text-white/30" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">Imagem da biblioteca</div>
                  <p className="mt-1 text-sm text-white/45">
                    JPG, PNG, WebP, GIF estático ou AVIF, até 15 MB. A imagem passa por moderação automática antes de
                    ser aceita.
                  </p>
                  {moderationHealth && (
                    <p className={`mt-2 text-xs ${moderationHealth.ok ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {moderationHealth.ok ? 'Moderação local pronta.' : 'Moderador local inicializando/reconectando.'}
                    </p>
                  )}
                  <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/5">
                    <Upload size={16} />
                    {image ? 'Trocar imagem' : 'Escolher imagem'}
                    <input
                      className="hidden"
                      type="file"
                      accept={imageAccept}
                      disabled={saving || moderationHealth?.ok === false}
                      onChange={e => chooseImage(e.target.files?.[0] || null)}
                    />
                  </label>
                  {image && (
                    <button
                      type="button"
                      onClick={() => chooseImage(null)}
                      className="ml-3 text-sm text-white/50 hover:text-white"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}
        </Card>
      )}

      {message && (
        <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {message}
        </div>
      )}
      {error && <p className="mt-8 text-amber-300">Entre na sua conta para acessar a biblioteca.</p>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((i: any) => (
          <Card key={i.id} className="flex gap-4 p-4">
            <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-white/5">
              {i.coverUrl ? (
                <img src={assetUrl(i.coverUrl)} alt={`Capa de ${i.title}`} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-xs text-white/25">{i.mediaType}</div>
              )}
              {changingImageId === i.id && (
                <div className="absolute inset-0 grid place-items-center bg-black/70">
                  <Loader2 className="animate-spin" size={18} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <b className="line-clamp-2">{i.title}</b>
              <p className="mt-1 text-xs text-cyan-300">{labels[i.status]}</p>
              {i.catalogItem && (
                <>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/45">
                    {i.catalogItem.releaseDate && <span>{String(i.catalogItem.releaseDate).slice(0, 4)}</span>}
                    {typeof i.catalogItem.rating === 'number' && <span>★ {i.catalogItem.rating.toFixed(1)}</span>}
                    <span>{i.catalogItem.provider}</span>
                  </div>
                  {Array.isArray(i.catalogItem.genres) && (
                    <p className="mt-1 line-clamp-1 text-[11px] text-violet-200/60">
                      {i.catalogItem.genres.slice(0, 3).join(' · ')}
                    </p>
                  )}
                </>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white">
                  <ImagePlus size={14} />
                  Imagem
                  <input
                    className="hidden"
                    type="file"
                    accept={imageAccept}
                    disabled={changingImageId === i.id || moderationHealth?.ok === false}
                    onChange={e => void replaceCover(i.id, e.target.files?.[0] || null)}
                  />
                </label>
                {i.catalogItem?.sourceUrl && (
                  <a
                    href={i.catalogItem.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white"
                  >
                    <ExternalLink size={13} />
                    Fonte
                  </a>
                )}
                <Button
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                  onClick={async () => {
                    await api(`/api/library/${i.id}`, { method: 'DELETE' });
                    qc.invalidateQueries({ queryKey: ['library'] });
                  }}
                >
                  <Trash2 size={14} />
                  Remover
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {!error && !data.length && (
        <div className="mt-16 text-center text-white/40">
          Sua biblioteca ainda está vazia. Use <b>Explorar catálogo</b> para começar.
        </div>
      )}
    </section>
  );
}
