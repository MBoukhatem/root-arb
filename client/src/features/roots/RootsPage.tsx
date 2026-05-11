import { useTranslation } from 'react-i18next';

export default function RootsPage() {
  const { t } = useTranslation(['nav']);
  return (
    <main id="main" className="p-6">
      <h1 className="text-2xl font-semibold">{t('nav:explore')}</h1>
      <p className="text-(--text-muted)">Liste des racines (stub - S2 J3).</p>
    </main>
  );
}
