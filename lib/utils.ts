export { cn } from '@/ui';
export const formatDate = (v: string | Date) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(v));
