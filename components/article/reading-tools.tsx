'use client';
import { useEffect, useState } from 'react';
import { BookOpenText, Minus, Plus, X } from 'lucide-react';

const FONT_KEY = 'hv-reading-font';

/**
 * Barra de progresso de leitura, modo leitura (esconde cabeçalho, rodapé,
 * anúncios e comentários; tipografia maior) e revelação de spoilers.
 */
export function ReadingTools({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0);
  const [reading, setReading] = useState(false);
  const [font, setFont] = useState(0);

  useEffect(() => {
    try {
      setFont(Number(localStorage.getItem(FONT_KEY) || 0));
    } catch {}
    const el = document.getElementById(targetId);
    const onScroll = () => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, Math.max(0, (-rect.top / total) * 100)) : 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [targetId]);

  // Spoilers do editor (<span class="spoiler">): acessíveis por teclado e clique.
  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root) return;
    root.querySelectorAll<HTMLElement>('.spoiler').forEach(el => {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', 'Spoiler oculto. Ative para revelar.');
    });
    const reveal = (target: EventTarget | null) => {
      const el = (target as HTMLElement | null)?.closest?.('.spoiler') as HTMLElement | null;
      if (!el || el.classList.contains('revealed')) return false;
      el.classList.add('revealed');
      el.removeAttribute('aria-label');
      return true;
    };
    const onClick = (e: MouseEvent) => {
      if (reveal(e.target)) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && reveal(e.target)) e.preventDefault();
    };
    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKey);
    return () => {
      root.removeEventListener('click', onClick);
      root.removeEventListener('keydown', onKey);
    };
  }, [targetId]);

  useEffect(() => {
    document.documentElement.toggleAttribute('data-reading-mode', reading);
    return () => document.documentElement.removeAttribute('data-reading-mode');
  }, [reading]);

  useEffect(() => {
    document.documentElement.style.setProperty('--reading-scale', String(1 + font * 0.1));
    try {
      localStorage.setItem(FONT_KEY, String(font));
    } catch {}
  }, [font]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent" aria-hidden>
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="reading-toolbar mt-6 flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => setReading(v => !v)}
          aria-pressed={reading}
          className="flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-1.5 hover:bg-white/5"
        >
          {reading ? <X size={15} /> : <BookOpenText size={15} />}
          {reading ? 'Sair do modo leitura' : 'Modo leitura'}
        </button>
        <span className="ml-1 text-white/40">Texto</span>
        <button
          type="button"
          aria-label="Diminuir texto"
          onClick={() => setFont(f => Math.max(-1, f - 1))}
          className="rounded-lg border border-white/15 p-1.5 hover:bg-white/5"
        >
          <Minus size={14} />
        </button>
        <button
          type="button"
          aria-label="Aumentar texto"
          onClick={() => setFont(f => Math.min(4, f + 1))}
          className="rounded-lg border border-white/15 p-1.5 hover:bg-white/5"
        >
          <Plus size={14} />
        </button>
      </div>
    </>
  );
}
