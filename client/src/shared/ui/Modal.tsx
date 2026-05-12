import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Optional footer slot (action buttons). */
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

/**
 * Accessible modal with basic focus-trap + Esc + backdrop close. Animated via
 * Framer Motion (motion-safe globally honours prefers-reduced-motion).
 */
export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const { t } = useTranslation(['common']);
  const dialogRef = useRef<HTMLDivElement>(null);
  // Fix #2: useId for stable aria-labelledby relationship.
  const titleId = useId();
  // Fix #8: honour prefers-reduced-motion for Framer Motion JS animations.
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        // Basic focus-trap: cycle within the dialog.
        const root = dialogRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!first || !last) return;
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    // Focus first focusable element on open.
    const id = window.requestAnimationFrame(() => {
      dialogRef.current
        ?.querySelector<HTMLElement>(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
        )
        ?.focus();
    });
    return () => {
      document.removeEventListener('keydown', onKey);
      window.cancelAnimationFrame(id);
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
          className="fixed inset-0 z-50 flex max-sm:items-end sm:items-center justify-center max-sm:p-0 sm:p-4"
          onClick={onClose}
          aria-hidden
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            initial={{
              opacity: 0,
              scale: shouldReduceMotion ? 1 : 0.96,
              y: shouldReduceMotion ? 0 : 8,
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className={clsx(
              'w-full bg-(--bg-base) shadow-xl border border-(--border)',
              /* Fix #5: full-screen on mobile, constrained + rounded on sm+ */
              'max-sm:rounded-none max-sm:h-screen max-sm:max-w-none max-sm:overflow-y-auto',
              'sm:rounded-xl',
              SIZE_CLASSES[size],
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-(--border) p-4">
              {/* Fix #2: id on h2, referenced by aria-labelledby on dialog */}
              <h2 id={titleId} className="text-lg font-semibold text-(--text-primary)">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('common:cancel')}
                className="rounded-md p-1 text-(--text-muted) hover:text-(--text-primary)"
              >
                <X size={18} aria-hidden />
              </button>
            </header>
            <div className="p-4 text-(--text-primary)">{children}</div>
            {footer ? (
              <footer className="flex items-center justify-end gap-2 border-t border-(--border) p-4">
                {footer}
              </footer>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
