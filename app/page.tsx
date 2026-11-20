import Link from 'next/link';
import { ArrowRight, Gamepad2, Clapperboard, Sparkles, Cpu, BookOpen, Users } from 'lucide-react';
import { Button, Card } from '@/ui';
import { serverApi } from '@/lib/api';
import { PostCard } from '@/components/post-card';
import { AnimatedBackdrop } from '@/components/animated-backdrop';
import { Recommendations } from '@/components/recommendations';
export default async function Home() {
  let posts: any[] = [];
  let categories: any[] = [];
  try {
    const [p, c] = await Promise.all([serverApi<any>('/api/posts?limit=8'), serverApi<any[]>('/api/categories')]);
    posts = Array.isArray(p?.items) ? p.items : [];
    categories = Array.isArray(c) ? c : [];
  } catch {}
  return (
    <>
      <section className="relative overflow-hidden">
        <AnimatedBackdrop />
        <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-4 py-20 lg:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[.2em] text-violet-200">
              O multiverso geek começa aqui
            </div>
            <h1 className="neon-text text-5xl font-black leading-[1.02] sm:text-7xl">
              Explore. Conecte.{' '}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
                Viva o Hypeverso.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">
              Notícias, comunidade, biblioteca pessoal, recomendações e tudo que move cinema, games, anime, HQs e
              tecnologia.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/noticias">
                <Button className="h-12 px-6">
                  Explorar conteúdos <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/comunidade">
                <Button variant="outline" className="h-12 px-6">
                  Entrar na comunidade <Users size={18} />
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute inset-10 rounded-full bg-violet-600/20 blur-3xl" />
            <Card className="relative rotate-2 p-7">
              <div className="grid grid-cols-2 gap-4">
                {[
                  [Gamepad2, 'Games'],
                  [Clapperboard, 'Cinema'],
                  [Sparkles, 'Anime'],
                  [Cpu, 'Tecnologia'],
                  [BookOpen, 'HQs'],
                  [Users, 'Comunidade'],
                ].map(([Icon, label]: any) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-6">
                    <Icon className="mb-5 text-cyan-300" />
                    <div className="text-xl font-bold">{label}</div>
                    <div className="mt-2 h-1 w-12 rounded bg-gradient-to-r from-violet-500 to-cyan-400" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Radar Hypeverso</p>
            <h2 className="mt-2 text-3xl font-black">Últimas publicações</h2>
          </div>
          <Link href="/noticias" className="text-sm text-violet-300">
            Ver tudo →
          </Link>
        </div>
        {posts.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {posts.map(p => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center text-white/45">
            O portal está pronto. Publique o primeiro conteúdo pelo CMS administrativo.
          </Card>
        )}
      </section>
      <Recommendations />
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="mb-6 text-2xl font-black">Explore por universo</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map(c => (
            <Link
              key={c.id}
              href={`/noticias?categoria=${c.slug}`}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm hover:border-violet-400/40 hover:bg-violet-500/10"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
