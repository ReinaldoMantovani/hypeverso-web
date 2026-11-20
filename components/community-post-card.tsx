'use client';
import { assetUrl } from '@/lib/asset-url';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, MessageCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Input, Card } from '@/ui';
import { FollowButton } from './follow-button';
import Link from 'next/link';
import { SpoilerText } from '@/components/spoiler-text';
export function CommunityPostCard({ post }: { post: any }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const comments = useQuery({
    queryKey: ['community-comments', post.id],
    queryFn: () => api<any[]>(`/api/community/posts/${post.id}/comments`),
    enabled: open,
  });
  async function react() {
    await api(`/api/community/posts/${post.id}/react`, { method: 'POST', body: JSON.stringify({ kind: 'LIKE' }) });
    qc.invalidateQueries({ queryKey: ['feed'] });
  }
  async function comment() {
    if (!text.trim()) return;
    try {
      await api(`/api/community/posts/${post.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: text }),
      });
      setText('');
      qc.invalidateQueries({ queryKey: ['community-comments', post.id] });
      qc.invalidateQueries({ queryKey: ['feed'] });
    } catch (e: any) {
      alert(e.message);
    }
  }
  return (
    <Card id={`post-${post.id}`} className="p-5">
      <div className="flex items-center gap-3">
        <Link
          href={`/u/${post.user.username}`}
          className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-violet-600 font-bold"
        >
          {post.user.avatarUrl ? (
            <img className="h-full w-full object-cover" src={assetUrl(post.user.avatarUrl)} alt="" />
          ) : (
            post.user.name[0]
          )}
        </Link>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/u/${post.user.username}`} className="font-bold hover:text-violet-200">
              {post.user.name}
            </Link>
            <FollowButton userId={post.user.id} initialFollowing={post.viewerFollowing} compact />
          </div>
          <div className="text-xs text-white/40">
            @{post.user.username} · Nv.{post.user.level}
          </div>
        </div>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-white/75">
        <SpoilerText text={post.content} />
      </p>
      {post.imageUrl && (
        <img className="mt-4 max-h-[520px] w-full rounded-2xl object-cover" src={assetUrl(post.imageUrl)} alt="" />
      )}
      <div className="mt-4 flex gap-5 text-sm text-white/45">
        <button onClick={react} className="flex items-center gap-1 hover:text-pink-300">
          <Heart size={17} />
          {post._count.reactions}
        </button>
        <button onClick={() => setOpen(!open)} className="flex items-center gap-1 hover:text-cyan-300">
          <MessageCircle size={17} />
          {post._count.comments}
        </button>
      </div>
      {open && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="flex gap-2">
            <Input value={text} onChange={e => setText(e.target.value)} placeholder="Comente nesta publicação..." />
            <Button onClick={comment}>Enviar</Button>
          </div>
          <div className="mt-3 space-y-2">
            {(comments.data || []).map((c: any) => (
              <div key={c.id} className="rounded-xl bg-black/20 p-3">
                <b className="text-sm">{c.user.name}</b>
                <p className="mt-1 text-sm text-white/60">
                  <SpoilerText text={c.content} />
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
