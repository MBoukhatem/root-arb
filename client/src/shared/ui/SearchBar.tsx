import { useEffect, useState, type ChangeEvent } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useDebounce } from '@/shared/hooks/useDebounce';

type SearchBarProps = {
  value?: string;
  defaultValue?: string;
  /** Fires after the debounced delay. */
  onChange: (next: string) => void;
  placeholder?: string;
  delay?: number;
  className?: string;
};

export function SearchBar({
  value,
  defaultValue = '',
  onChange,
  placeholder,
  delay = 300,
  className,
}: SearchBarProps) {
  const { t } = useTranslation(['common']);
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string>(value ?? defaultValue);
  const debounced = useDebounce(internal, delay);

  // Fire change after debounce.
  useEffect(() => {
    onChange(debounced);
    // onChange is intentionally omitted — callers re-create it freely.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // Sync down when used as controlled.
  useEffect(() => {
    if (isControlled && value !== undefined) setInternal(value);
  }, [isControlled, value]);

  function update(e: ChangeEvent<HTMLInputElement>) {
    setInternal(e.target.value);
  }
  function clear() {
    setInternal('');
  }

  return (
    <div
      className={clsx(
        'relative flex items-center rounded-lg border border-(--border) bg-(--bg-card) focus-within:border-(--focus-ring)',
        className,
      )}
    >
      <Search
        size={18}
        className="pointer-events-none absolute start-3 text-(--text-muted)"
        aria-hidden
      />
      <input
        type="search"
        value={internal}
        onChange={update}
        placeholder={placeholder ?? t('common:search')}
        className="w-full bg-transparent ps-10 pe-10 py-2 text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none"
        aria-label={t('common:search')}
      />
      {internal.length > 0 ? (
        <button
          type="button"
          onClick={clear}
          aria-label={t('common:cancel')}
          className="absolute end-2 rounded-md p-1 text-(--text-muted) hover:text-(--text-primary)"
        >
          <X size={16} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
