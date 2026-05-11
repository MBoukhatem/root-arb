import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArabicText } from '@/shared/ui/ArabicText';
import { Button } from '@/shared/ui/Button';
import { RootTree } from '@/shared/viz';
import { DEMO_ROOT_KTB } from './_demoData';

export default function LandingPage() {
  const { t } = useTranslation(['common', 'nav']);

  const handleDemoWordClick = useCallback((wordId: string) => {
    // No routing wired yet on the public demo; log for now.
    console.info('[LandingPage demo] word selected:', wordId);
  }, []);

  return (
    <main id="main" className="mx-auto flex max-w-5xl flex-col gap-12 p-8">
      <header className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold">{t('common:app-name')}</h1>
        <p className="text-(--text-secondary)">
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

      <section
        aria-labelledby="demo-tree-heading"
        className="flex flex-col gap-4 rounded-xl border border-(--border) bg-(--bg-card) p-6"
      >
        <div className="flex flex-col gap-1">
          <h2 id="demo-tree-heading" className="text-2xl font-semibold">
            Découvrez la racine{' '}
            <ArabicText as="inline" unvocalized="ك ت ب">
              ك ت ب
            </ArabicText>
          </h2>
          <p className="text-(--text-secondary)">
            Une seule racine, huit mots dérivés - explorez l’arbre interactif.
          </p>
        </div>
        <RootTree
          root={DEMO_ROOT_KTB.root}
          words={DEMO_ROOT_KTB.words}
          onWordClick={handleDemoWordClick}
        />
      </section>
    </main>
  );
}
