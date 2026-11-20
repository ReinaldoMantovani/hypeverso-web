import { SmartImage } from '@/components/smart-image';
import Link from 'next/link';
import { Bookmark, MessageCircle } from 'lucide-react';
import { Card } from '@/ui';
import { formatDate } from '@/lib/utils';
export function PostCard({ post }: { post: any }) {
  return (
    <Card className="group overflow-hidden">
      <Link href={`/post/${post.slug}`}>
        <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-violet-950 to-cyan-950">
          {post.coverImageUrl ? (
            <SmartImage
              src={post.coverImageUrl}
              alt=""
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center text-5xl font-black text-white/10">Hypeverso</div>
          )}
        </div>
        <div className="p-5">
          <div className="mb-3 flex items-center gap-2 text-xs text-cyan-300">
            <span>{post.category?.name}</span>
            <span className="text-white/25">•</span>
            <span className="text-white/45">{post.publishedAt ? formatDate(post.publishedAt) : ''}</span>
            {post.isPremium && (
              <span className="ml-auto rounded-full bg-violet-500/20 px-2 py-1 text-violet-200">Premium</span>
            )}
          </div>
          <h3 className="text-lg font-bold leading-snug group-hover:text-violet-200">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-white/55">{post.description}</p>
          {post._count && (
            <div className="mt-4 flex gap-4 text-xs text-white/35">
              <span className="flex items-center gap-1">
                <MessageCircle size={14} />
                {post._count.comments}
              </span>
              <span className="flex items-center gap-1">
                <Bookmark size={14} />
                {post._count.favorites}
              </span>
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}
