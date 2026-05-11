import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, LogOut, Menu, User } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/features/auth/useAuth';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';

type NavbarProps = {
  variant?: 'public' | 'app';
  onToggleSidebar?: () => void;
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-(--bg-card) text-(--text-primary)'
      : 'text-(--text-secondary) hover:bg-(--bg-card) hover:text-(--text-primary)',
  );

export function Navbar({ variant = 'public', onToggleSidebar }: NavbarProps) {
  const { t } = useTranslation(['nav', 'common']);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-(--border) bg-(--bg-base)/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        {variant === 'app' ? (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-(--text-secondary) hover:bg-(--bg-card) lg:hidden"
          >
            <Menu size={18} aria-hidden />
          </button>
        ) : null}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-(--text-primary)">{t('common:app-name')}</span>
        </Link>

        {variant === 'public' ? (
          <nav className="ms-6 hidden items-center gap-1 md:flex">
            <NavLink to="/explore" className={navLinkClass}>
              {t('nav:explore')}
            </NavLink>
            {user ? (
              <NavLink to="/dashboard" className={navLinkClass}>
                {t('nav:dashboard')}
              </NavLink>
            ) : null}
          </nav>
        ) : null}

        <div className="ms-auto flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
          {user ? (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-sm text-(--text-secondary) hover:bg-(--bg-card) hover:text-(--text-primary)"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-(--cat-verb-fill)/15 text-(--cat-verb-ink)">
                  <User size={14} aria-hidden />
                </span>
                <span className="hidden font-medium sm:inline">{user.username}</span>
                <ChevronDown size={14} aria-hidden />
              </button>
              {menuOpen ? (
                <div
                  role="menu"
                  className="absolute end-0 mt-2 w-48 rounded-lg border border-(--border) bg-(--bg-base) p-1 shadow-lg"
                >
                  <Link
                    to="/profile"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-(--text-secondary) hover:bg-(--bg-card) hover:text-(--text-primary)"
                  >
                    <User size={14} aria-hidden />
                    {t('nav:profile')}
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      void logout().then(() => navigate('/'));
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-(--text-secondary) hover:bg-(--bg-card) hover:text-(--text-primary)"
                  >
                    <LogOut size={14} aria-hidden />
                    {t('nav:logout')}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Link
                to="/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-(--text-secondary) hover:text-(--text-primary)"
              >
                {t('nav:login')}
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-(--cat-verb-fill) px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                {t('nav:register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
