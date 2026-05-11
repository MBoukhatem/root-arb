import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { Button } from './Button';

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  tone?: 'default' | 'destructive';
  confirmLabel?: string;
};

/**
 * Confirmation dialog. Per agent_04 R3 §3, this is the ONLY place the
 * `--danger` token (#e23923) may surface in the chrome.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  tone = 'default',
  confirmLabel,
}: ConfirmDialogProps) {
  const { t } = useTranslation(['common']);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('common:cancel')}
          </Button>
          <Button
            variant={tone === 'destructive' ? 'destructive' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel ?? t('common:confirm')}
          </Button>
        </>
      }
    >
      {message ? <p className="text-(--text-secondary)">{message}</p> : null}
    </Modal>
  );
}
