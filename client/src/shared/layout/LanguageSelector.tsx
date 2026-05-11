import { useEffect, useRef, useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useLanguage } from '@/shared/i18n/LanguageContext';
import type { SupportedLanguage } from '@/shared/lib/env';

const LANGS: Array<{ code: SupportedLanguage; label: string }> = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
];

export function LanguageSelector() {
  const { lang, setLang } = useLanguage();
  const { t } = useTranslation(['common']);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t('common:language')}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-(--text-secondary) hover:bg-(--bg-card) hover:text-(--text-primary)"
      >
        <Globe size={18} aria-hidden />
        <span className="text-sm font-medium uppercase">{lang}</span>
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute end-0 mt-2 min-w-40 rounded-lg border border-(--border) bg-(--bg-base) p-1 shadow-lg"
        >
          {LANGS.map((option) => {
            const active = option.code === lang;
            return (
              <li key={option.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setLang(option.code);
                    setOpen(false);
                  }}
                  className={clsx(
                    'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm',
                    active
                      ? 'bg-(--bg-card) text-(--text-primary)'
                      : 'text-(--text-secondary) hover:bg-(--bg-card) hover:text-(--text-primary)',
                  )}
                >
                  <span>{option.label}</span>
                  {active ? <Check size={14} aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
