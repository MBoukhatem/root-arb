import { type ElementType, type ReactNode } from 'react';
import clsx from 'clsx';

type As = 'title' | 'body' | 'inline';

type ArabicTextProps = {
  children: ReactNode;
  /**
   * Optional unvocalized form. Used as `aria-label` so screen readers (NVDA,
   * JAWS) pronounce the word without diacritic noise. Per agent_08 R3 §3.
   */
  unvocalized?: string;
  /** True when content is fully vocalized (informational; styling identical). */
  vocalized?: boolean;
  /**
   * Visual size class:
   * - `title`: Amiri, >=24px, gold accent allowed.
   * - `body`: Noto Naskh, >=18px.
   * - `inline`: Noto Naskh, >=20px so diacritics remain legible inline.
   */
  as?: As;
  className?: string;
  /** Underlying HTML element. Defaults to `span` for inline-safety. */
  tag?: ElementType;
};

const AS_CLASSES: Record<As, string> = {
  title: 'font-arabic-title text-[clamp(24px,4vw,32px)] leading-[1.8] text-(--text-primary)',
  body: 'font-arabic text-[18px] leading-[1.8]',
  inline: 'font-arabic text-[20px] leading-[1.8] inline',
};

/**
 * `<ArabicText>` - the SINGLE authorised vector for raw Arabic content in the
 * UI (agent_08 R3 §3). Imposes `lang="ar"`, `dir="rtl"`, font floor, and an
 * `aria-label` from the unvocalized form for assistive tech.
 *
 * An ESLint custom rule (S2+) will forbid Arabic literals outside this comp.
 */
export function ArabicText({
  children,
  unvocalized,
  vocalized: _vocalized,
  as = 'body',
  className,
  tag,
}: ArabicTextProps) {
  const Tag = (tag ?? 'span') as ElementType;
  return (
    <Tag lang="ar" dir="rtl" aria-label={unvocalized} className={clsx(AS_CLASSES[as], className)}>
      {children}
    </Tag>
  );
}
