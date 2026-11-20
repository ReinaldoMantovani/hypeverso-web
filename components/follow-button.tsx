'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/stores/auth';

export function FollowButton({
  userId,
  initialFollowing,
  compact = false,
}: {
  userId: string;
  initialFollowing?: boolean;
  compact?: boolean;
}) {
  const me = useAuth(s => s.user);
  const qc = useQueryClient();
  const status = useQuery({
    queryKey: ['follow-status', userId],
    queryFn: () => api<{ following: boolean }>(`/api/users/${userId}/follow-status`),
    enabled: !!me && me.id !== userId && initialFollowing === undefined,
    initialData: initialFollowing === undefined ? undefined : { following: initialFollowing },
    staleTime: 30_000,
  });
  if (!me || me.id === userId) return null;
  const following = !!status.data?.following;
  return (
    <Button
      variant="outline"
      className={compact ? 'h-7 rounded-lg px-2.5 text-xs' : ''}
      disabled={status.isFetching}
      onClick={async () => {
        try {
          const r = await api<{ following: boolean }>(`/api/users/${userId}/follow`, { method: 'POST' });
          qc.setQueryData(['follow-status', userId], r);
          qc.invalidateQueries({ queryKey: ['feed'] });
        } catch (e: any) {
          alert(e.message);
        }
      }}
    >
      {following ? 'Seguindo' : 'Seguir'}
    </Button>
  );
}
