import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArabicText } from '@/shared/ui/ArabicText';
import { Button } from '@/shared/ui/Button';

export default function LandingPage() {
  const { t } = useTranslation(['common', 'nav']);
  return (
    <main id="main" className="mx-auto flex max-w-4xl flex-col gap-8 p-8">
      <header className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold">{t('common:app-name')}</h1>
        <p className="text-(--text-secondary)">
          {/* Showcase ArabicText with the canonical k-t-b root */}
          <ArabicText as="inline" unvocalized="ك ت ب">
            كَتَبَ
          </ArabicText>
          {' - écrire / to write'}
        </p>
      </header>
      <div className="flex gap-3">
        <Link to="/login">
          <Button variant="secondary">{t('nav:login')}</Button>
        </Link>
        <Link to="/register">
          <Button>{t('nav:register')}</Button>
        </Link>
      </div>
    </main>
  );
}
