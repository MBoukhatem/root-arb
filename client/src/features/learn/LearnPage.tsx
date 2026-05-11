import { useTranslation } from 'react-i18next';

export default function LearnPage() {
  const { t } = useTranslation(['nav']);
  return (
    <main id="main" className="p-6">
      <h1 className="text-2xl font-semibold">{t('nav:learn')}</h1>
      <p className="text-(--text-muted)">Session SRS - stub (S2 J5).</p>
    </main>
  );
}
