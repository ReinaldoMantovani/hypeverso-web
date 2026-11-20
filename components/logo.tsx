'use client';
import Link from 'next/link';
import { useId } from 'react';

/** Símbolo do Hypeverso: "H" em movimento + órbita (o universo geek) + faísca (o hype). */
export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const bg = `hv-bg-${uid}`;
  const glow = `hv-glow-${uid}`;
  const front = `hv-front-${uid}`;
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c3aed" />
          <stop offset=".55" stopColor="#a21caf" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
        <radialGradient id={glow} cx=".28" cy=".2" r=".85">
          <stop offset="0" stopColor="#fff" stopOpacity=".3" />
          <stop offset=".6" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={front}>
          <rect x="0" y="262" width="512" height="250" />
        </clipPath>
      </defs>
      <rect width="512" height="512" rx="124" fill={`url(#${bg})`} />
      <rect width="512" height="512" rx="124" fill={`url(#${glow})`} />
      <g transform="rotate(-16 256 262)">
        <ellipse cx="256" cy="262" rx="200" ry="60" fill="none" stroke="#0b0716" strokeOpacity=".45" strokeWidth="22" />
      </g>
      <g fill="#fff">
        <path d="M170 116h68l-50 280h-68z" />
        <path d="M328 116h68l-50 280h-68z" />
        <path d="M200 228h146l-11 58H189z" />
      </g>
      <g transform="rotate(-16 256 262)">
        <ellipse
          cx="256"
          cy="262"
          rx="200"
          ry="60"
          fill="none"
          stroke="#0b0716"
          strokeWidth="22"
          clipPath={`url(#${front})`}
        />
      </g>
      <path d="M424 92l10 26 26 10-26 10-10 26-10-26-26-10 26-10z" fill="#fff" />
      <circle cx="108" cy="402" r="9" fill="#fff" fillOpacity=".85" />
    </svg>
  );
}

export function Logo({ href = '/', suffix }: { href?: string; suffix?: React.ReactNode }) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-2.5" aria-label="Hypeverso — início">
      <LogoMark size={36} className="drop-shadow-[0_4px_14px_rgba(168,85,247,.35)]" />
      <span className="text-xl font-black tracking-tight" data-no-i18n>
        Hype
        <span className="bg-gradient-to-r from-violet-300 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">verso</span>
      </span>
      {suffix}
    </Link>
  );
}
