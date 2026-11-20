import { notFound } from 'next/navigation';
import { serverApi } from '@/lib/api';
import { Card } from '@/ui';
import { FollowButton } from '@/components/follow-button';
import { ProfileAvatarEditor } from '@/components/profile-avatar-editor';
import { NewsNotificationPreferences } from '@/components/news-notification-preferences';
export default async function Profile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  let u: any;
  try {
    u = await serverApi(`/api/users/${username}`);
  } catch {
    notFound();
  }
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <ProfileAvatarEditor profile={{ id: u.id, name: u.name, username: u.username, avatarUrl: u.avatarUrl }} />
        <div>
          <h1 className="text-4xl font-black">{u.name}</h1>
          <p className="text-white/45">
            @{u.username}{' '}
            {u.subscription?.status === 'ACTIVE' && (
              <span className="ml-2 rounded-full bg-violet-500/20 px-2 py-1 text-xs text-violet-200">Premium</span>
            )}
          </p>
          <div className="mt-3 flex gap-4 text-sm">
            <span>
              Nível <b>{u.level}</b>
            </span>
            <span>
              <b>{u.xp}</b> XP
            </span>
            <span>
              <b>{u._count.followers}</b> seguidores
            </span>
            <span>
              <b>{u._count.following}</b> seguindo
            </span>
          </div>
        </div>
        <div className="sm:ml-auto">
          <FollowButton userId={u.id} />
        </div>
      </div>
      {u.bio && <p className="mt-6 max-w-2xl text-white/65">{u.bio}</p>}
      <NewsNotificationPreferences profileUsername={u.username} />
      <h2 className="mt-10 text-xl font-bold">Conquistas</h2>
      <div className="mt-3 flex flex-wrap gap-3">
        {u.achievements.map((a: any) => (
          <Card key={a.achievement.id} className="px-4 py-3">
            <b>{a.achievement.name}</b>
            <p className="text-xs text-white/40">{a.achievement.description}</p>
          </Card>
        ))}
      </div>
      <h2 className="mt-10 text-xl font-bold">Atividade recente</h2>
      <div className="mt-3 space-y-3">
        {u.communityPosts.map((p: any) => (
          <Card key={p.id} className="p-4">
            <p>{p.content}</p>
            <div className="mt-2 text-xs text-white/35">
              {p._count.reactions} reações · {p._count.comments} comentários
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
