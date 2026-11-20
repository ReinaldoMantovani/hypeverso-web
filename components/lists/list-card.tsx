import Link from 'next/link';
import { Eye, ListChecks } from 'lucide-react';

export type ListSummary = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  isPublic: boolean;
  viewCount: number;
  user: { name: string; username: string };
  _count: { items: number };
  items: { catalogItem: { coverUrl: string | null; title: string } }[];
};

export function ListCard({ list }: { list: ListSummary }) {
  return (
    <Link
      href={`/listas/${list.id}/${list.slug}`}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:border-violet-400/30"
    >
      <div className="grid h-32 grid-cols-4 gap-0.5 bg-white/5">
        {Array.from({ length: 4 }, (_, i) => list.items[i]?.catalogItem.coverUrl).map((cover, i) =>
          cover ? (
            <img key={i} src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div key={i} className="bg-gradient-to-br from-violet-950 to-cyan-950" />
          ),
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-bold group-hover:text-violet-200">{list.title}</h3>
        <p className="mt-1 text-xs text-white/45">
          por {list.user.name} · <ListChecks size={12} className="inline" /> {list._count.items} ·{' '}
          <Eye size={12} className="inline" /> {list.viewCount}
          {!list.isPublic && ' · privada'}
        </p>
      </div>
    </Link>
  );
}
