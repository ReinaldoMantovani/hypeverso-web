import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/ui';
import { MediaCatalogBrowser } from '@/components/media-catalog-browser';

export default function CatalogoPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.28em] text-cyan-300">Hypeverso Media Hub</p>
          <h1 className="mt-2 text-4xl font-black">Explore entretenimento</h1>
          <p className="mt-2 max-w-2xl text-white/50">
            Encontre filmes, séries, games, anime e mangás, acompanhe lançamentos e adicione tudo à sua biblioteca sem
            preencher dados manualmente.
          </p>
        </div>
        <Link href="/calendario">
          <Button variant="outline">
            <CalendarDays size={16} />
            Calendário de lançamentos
          </Button>
        </Link>
      </div>
      <MediaCatalogBrowser />
    </section>
  );
}
