'use client';
import { assetUrl } from '@/lib/asset-url';
import Link from 'next/link';
import { Search, Menu, X, UserCircle, Shield, LogOut, Bookmark, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/ui';
import { Logo } from './logo';
import { useAuth } from '@/stores/auth';
import { NotificationBell } from './notification-bell';
import { LanguageSwitcher } from './language-switcher';
import { useI18n } from '@/lib/i18n';
// O CMS roda localmente (projeto hypeverso-cms). Defina NEXT_PUBLIC_CMS_URL
// (ex.: http://localhost:3001) para mostrar o atalho aos membros da equipe.
const CMS_URL = (process.env.NEXT_PUBLIC_CMS_URL || '').trim();

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();
  // Fecha o menu ao trocar de página.
  useEffect(() => setOpen(false), [pathname]);
  const isStaff = Boolean(CMS_URL && user && ['ADMIN', 'EDITOR', 'MODERATOR'].includes(user.role));
  const links = [
    [t('news'), '/noticias'],
    [t('community'), '/comunidade'],
    [t('explore'), '/catalogo'],
    [t('calendar'), '/calendario'],
    [t('lists'), '/listas'],
    [t('library'), '/biblioteca'],
    [t('ranking'), '/ranking'],
    [t('shop'), '/shop'],
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05030bdd] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-4">
        <Logo />
        <nav className="ml-3 hidden gap-4 text-sm text-white/70 xl:flex">
          {links.map(([a, b]) => (
            <Link key={b} href={b} className="whitespace-nowrap hover:text-white">
              {a}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          {/* No celular o idioma fica dentro do menu (☰). */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          <Link href="/buscar" aria-label={t('search')} className="rounded-xl p-2 hover:bg-white/10">
            <Search size={19} />
          </Link>
          {user ? (
            <>
              <Link
                href="/favoritos"
                className="hidden rounded-xl p-2 hover:bg-white/10 sm:block"
                title={t('favorites')}
              >
                <Bookmark size={18} />
              </Link>
              <NotificationBell />
              <Link
                href={`/u/${user.username}`}
                className="hidden items-center gap-2 rounded-xl px-2 py-2 text-sm hover:bg-white/10 lg:flex"
              >
                {user.avatarUrl ? (
                  <img src={assetUrl(user.avatarUrl)} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <UserCircle size={18} />
                )}{' '}
                {user.name}
              </Link>
              <Link
                href="/conta/privacidade"
                className="hidden rounded-xl p-2 hover:bg-white/10 sm:block"
                title={t('privacyCenter')}
                aria-label={t('privacyCenter')}
              >
                <Lock size={18} />
              </Link>
              {isStaff && (
                <a href={CMS_URL} className="hidden rounded-xl p-2 hover:bg-white/10 sm:block" title={t('admin')}>
                  <Shield size={18} />
                </a>
              )}
              <button
                onClick={() => {
                  void logout().catch(() => undefined);
                }}
                className="hidden rounded-xl p-2 hover:bg-white/10 sm:block"
                title={t('logout')}
                aria-label={t('logout')}
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link href="/login">
              <Button>{t('login')}</Button>
            </Link>
          )}
          <button
            type="button"
            className="shrink-0 rounded-xl p-2 hover:bg-white/10 xl:hidden"
            onClick={() => setOpen(!open)}
            aria-label={t('menu')}
            aria-expanded={open}
            aria-controls="menu-principal"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="menu-principal"
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-white/10 p-4 xl:hidden"
        >
          {links.map(([a, b]) => (
            <Link
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-3 hover:bg-white/5 ${pathname === b ? 'bg-white/5 text-white' : 'text-white/80'}`}
              key={b}
              href={b}
            >
              {a}
            </Link>
          ))}

          <div className="my-3 border-t border-white/10" />

          {user ? (
            <div className="space-y-1 sm:hidden">
              <Link href={`/u/${user.username}`} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-white/5">
                {user.avatarUrl ? (
                  <img src={assetUrl(user.avatarUrl)} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <UserCircle size={18} />
                )}
                {t('myProfile')}
              </Link>
              <Link href="/favoritos" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-white/5">
                <Bookmark size={18} /> {t('favorites')}
              </Link>
              <Link href="/conta/privacidade" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-white/5">
                <Lock size={18} /> {t('privacyCenter')}
              </Link>
              {isStaff && (
                <a href={CMS_URL} className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-white/5">
                  <Shield size={18} /> {t('admin')}
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void logout().catch(() => undefined);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-rose-300 hover:bg-white/5"
              >
                <LogOut size={18} /> {t('logout')}
              </button>
            </div>
          ) : null}

          {/* Idioma: no celular só aparece aqui. */}
          <div className="mt-2 flex items-center justify-between gap-3 rounded-lg px-3 py-2 md:hidden">
            <span className="text-sm text-white/70">{t('language')}</span>
            <LanguageSwitcher />
          </div>
        </nav>
      )}
    </header>
  );
}
