import { notFound, redirect } from 'next/navigation';
import { serverApi } from '@/lib/api';

export default async function ListRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const list = await serverApi<any>(`/api/lists/${encodeURIComponent(id)}`).catch(() => null);
  if (!list) notFound();
  redirect(`/listas/${list.id}/${list.slug}`);
}
