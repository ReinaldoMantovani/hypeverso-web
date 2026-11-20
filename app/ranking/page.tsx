import { serverApi } from '@/lib/api';
import { Card } from '@/ui';
import Link from 'next/link';
export default async function Ranking() {
  let users: any[] = [];
  try {
    users = await serverApi('/api/rankings');
  } catch {}
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Gamificação</p>
      <h1 className="mt-2 text-4xl font-black">Ranking Hypeverso</h1>
      <p className="mt-2 text-white/50">Experiência conquistada por participação real na plataforma.</p>
      <div className="mt-8 space-y-3">
        {users.map((u, i) => (
          <Link key={u.id} href={`/u/${u.username}`}>
            <Card className="mb-3 grid grid-cols-[56px_1fr_auto] items-center gap-3 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/15 font-black text-violet-200">
                #{i + 1}
              </div>
              <div>
                <b>{u.name}</b>
                <div className="text-xs text-white/40">
                  @{u.username} · Nível {u.level}
                </div>
              </div>
              <div className="font-black text-cyan-300">{u.xp} XP</div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
