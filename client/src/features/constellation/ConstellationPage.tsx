import { useTranslation } from 'react-i18next';

export default function ConstellationPage() {
  const { t } = useTranslation(['nav']);
  return (
    <main id="main" className="p-6">
      <h1 className="text-2xl font-semibold">{t('nav:constellation')}</h1>
      <p className="text-(--text-muted)">Constellation force-directed - stub (S2 J6).</p>
    </main>
  );
}
