import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import type { SemanticField } from '@/types/models';

type Props = {
  field: SemanticField;
  className?: string;
};

/**
 * Map a semantic field to a stable categorical token pair (ink + fill/10).
 * We deliberately reuse the existing grammatical-category tokens rather than
 * introducing a parallel palette.
 */
const FIELD_TONE: Record<SemanticField, string> = {
  knowledge: 'bg-(--cat-verb-fill)/10 text-(--cat-verb-ink) border-(--cat-verb-fill)/30',
  action: 'bg-(--cat-noun-fill)/10 text-(--cat-noun-ink) border-(--cat-noun-fill)/30',
  movement: 'bg-(--cat-adverb-fill)/10 text-(--cat-adverb-ink) border-(--cat-adverb-fill)/30',
  state: 'bg-(--cat-adjective-fill)/10 text-(--cat-adjective-ink) border-(--cat-adjective-fill)/30',
  place:
    'bg-(--cat-pluriel-brise-fill)/10 text-(--cat-pluriel-brise-ink) border-(--cat-pluriel-brise-fill)/30',
  time: 'bg-(--cat-derive-fill)/10 text-(--cat-derive-ink) border-(--cat-derive-fill)/30',
  person:
    'bg-(--cat-participle-fill)/10 text-(--cat-participle-ink) border-(--cat-participle-fill)/30',
  communication: 'bg-(--cat-masdar-fill)/10 text-(--cat-masdar-ink) border-(--cat-masdar-fill)/30',
  emotion: 'bg-(--cat-masdar-fill)/10 text-(--cat-masdar-ink) border-(--cat-masdar-fill)/30',
  object: 'bg-(--cat-noun-fill)/10 text-(--cat-noun-ink) border-(--cat-noun-fill)/30',
};

export function SemanticFieldBadge({ field, className }: Props) {
  const { t } = useTranslation(['roots']);
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        FIELD_TONE[field],
        className,
      )}
    >
      {t(`roots:semanticField.${field}`)}
    </span>
  );
}
