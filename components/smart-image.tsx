import Image, { type ImageProps } from 'next/image';
import { assetUrl } from '@/lib/asset-url';

// Hosts liberados em next.config.ts (images.remotePatterns). Para qualquer outro
// host caímos para <img>, porque o next/image recusa domínios não configurados.
const OPTIMIZABLE_HOSTS = new Set(['image.tmdb.org', 'images.igdb.com', 'upload.wikimedia.org', 's4.anilist.co']);

function optimizable(src: string) {
  if (src.startsWith('/uploads/')) return true;
  try {
    const u = new URL(src);
    return u.protocol === 'https:' && OPTIMIZABLE_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

/**
 * Imagem otimizada (AVIF/WebP, tamanhos responsivos, lazy-load) via next/image
 * quando possível. Use `priority` para a imagem principal (LCP) da página.
 */
export function SmartImage({
  src,
  alt,
  className,
  sizes = '100vw',
  priority = false,
  fill = true,
  width,
  height,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}) {
  if (!src) return null;
  const resolved = assetUrl(src);
  if (!optimizable(resolved)) {
    return (
      <img
        src={resolved}
        alt={alt}
        className={`${fill ? 'absolute inset-0 h-full w-full ' : ''}${className || ''}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    );
  }
  const common: Partial<ImageProps> = { sizes, priority, className, quality: 80 };
  return fill ? (
    <Image src={resolved} alt={alt} fill {...common} />
  ) : (
    <Image src={resolved} alt={alt} width={width || 1200} height={height || 675} {...common} />
  );
}
