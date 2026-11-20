import type { TocItem } from '@/lib/article';

export function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length < 3) return null;
  return (
    <nav aria-label="Índice do artigo" className="toc mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">Neste artigo</p>
      <ol className="mt-3 space-y-1.5 text-sm">
        {items.map(item => (
          <li key={item.id} className={item.level === 3 ? 'pl-4' : ''}>
            <a href={`#${item.id}`} className="text-white/60 hover:text-white">
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
