import { api } from './api';

export type UploadPurpose = 'avatar' | 'library' | 'article' | 'community';

export async function uploadImage(file: File, purpose: UploadPurpose) {
  const form = new FormData();
  form.append('file', file);
  return api<{ url: string; format: string; mimeType: string; originalName: string; moderated: boolean }>(
    `/api/uploads?purpose=${encodeURIComponent(purpose)}`,
    { method: 'POST', body: form },
  );
}
