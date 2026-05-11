import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, type LucideProps } from 'lucide-react';
import { useDirection } from '@/shared/i18n/useDirection';

type DirectionalIconName = 'chevron-prev' | 'chevron-next' | 'arrow-prev' | 'arrow-next';

type DirectionalIconProps = LucideProps & {
  name: DirectionalIconName;
};

/**
 * Lucide-icon wrapper that swaps chevrons / arrows according to the logical
 * direction (prev/next), so an "arrow-next" icon points right in LTR and
 * left in RTL.
 *
 * Per agent_08 R3 §3 - icons must follow logical direction, never physical.
 */
export function DirectionalIcon({ name, ...props }: DirectionalIconProps) {
  const { isRTL } = useDirection();

  switch (name) {
    case 'chevron-prev':
      return isRTL ? <ChevronRight {...props} /> : <ChevronLeft {...props} />;
    case 'chevron-next':
      return isRTL ? <ChevronLeft {...props} /> : <ChevronRight {...props} />;
    case 'arrow-prev':
      return isRTL ? <ArrowRight {...props} /> : <ArrowLeft {...props} />;
    case 'arrow-next':
      return isRTL ? <ArrowLeft {...props} /> : <ArrowRight {...props} />;
  }
}
