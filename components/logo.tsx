import Link from 'next/link';
export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-black tracking-[.18em]">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-black">
        H
      </span>
      <span>Hypeverso</span>
    </Link>
  );
}
