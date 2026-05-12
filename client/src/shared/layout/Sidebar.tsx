import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Compass,
  FolderHeart,
  GraduationCap,
  LayoutDashboard,
  NotebookPen,
} from 'lucide-react';
import clsx from 'clsx';
import { FocusTrap } from 'focus-trap-react';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

type Item = {
  to: string;
  labelKey: string;
  icon: typeof BookOpen;
};

const ITEMS: Item[] = [
  { to: '/dashboard', labelKey: 'nav:dashboard', icon: LayoutDashboard },
  { to: '/explore', labelKey: 'nav:explore', icon: BookOpen },
  { to: '/learn', labelKey: 'nav:learn', icon: GraduationCap },
  { to: '/constellation', labelKey: 'nav:constellation', icon: Compass },
  { to: '/notes', labelKey: 'nav:notes', icon: NotebookPen },
  { to: '/collections', labelKey: 'nav:collections', icon: FolderHeart },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-(--cat-verb-fill)/10 text-(--cat-verb-ink)'
      : 'text-(--text-secondary) hover:bg-(--bg-card) hover:text-(--text-primary)',
  );

export function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation(['nav']);

  return (
    <>
      {/* Mobile backdrop */}
      {open ? (
        <button
          type="button"
          aria-label={t('nav:closeMenu', 'Fermer le menu')}
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      ) : null}
      {/* Fix #3: FocusTrap wraps the aside on mobile when open.
          On desktop the aside is static and never traps focus. */}
      <FocusTrap
        active={open}
        focusTrapOptions={{
          onDeactivate: onClose,
          escapeDeactivates: true,
          allowOutsideClick: true,
          returnFocusOnDeactivate: true,
        }}
      >
        <aside
          role={open ? 'dialog' : undefined}
          aria-modal={open ? 'true' : undefined}
          aria-label={open ? t('nav:siteNavigation', 'Navigation principale') : undefined}
          className={clsx(
            'fixed inset-y-0 start-0 z-40 w-64 transform border-e border-(--border) bg-(--bg-base) p-4 transition-transform lg:static lg:translate-x-0',
            open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full lg:translate-x-0',
          )}
        >
          <nav className="flex flex-col gap-1">
            {ITEMS.map(({ to, labelKey, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={linkClass}
                onClick={onClose}
                end={to === '/dashboard'}
              >
                <Icon size={18} aria-hidden />
                <span>{t(labelKey)}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
      </FocusTrap>
    </>
  );
}
