import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Compass, Github, GraduationCap, Sparkles } from 'lucide-react';
import { ArabicText } from '@/shared/ui/ArabicText';
import { Button } from '@/shared/ui/Button';
import { RootTree } from '@/shared/viz';
import { DEMO_ROOT_KTB } from './_demoData';

export default function LandingPage() {
  const { t } = useTranslation(['landing', 'common', 'nav']);

  // Routing to word detail not yet wired in the public demo.
  const handleDemoWordClick = useCallback((_wordId: string) => void _wordId, []);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-6 py-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[clamp(34px,5vw,56px)] font-bold leading-tight text-(--text-primary)"
        >
          {t('landing:heroTitle')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl text-lg text-(--text-secondary)"
        >
          {t('landing:heroSubtitle')}
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/explore">
            <Button size="lg">{t('landing:ctaExplore')}</Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              {t('landing:ctaRegister')}
            </Button>
          </Link>
        </div>
        <div className="pt-2 text-(--text-muted)">
          <ArabicText as="inline" unvocalized="كتب" className="text-2xl">
            كَتَبَ
          </ArabicText>
          <span className="ms-2">{t('landing:heroEyebrow')}</span>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <h2 className="mb-8 text-center text-2xl font-semibold text-(--text-primary)">
          {t('landing:stepsTitle')}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StepCard
            icon={<Compass size={22} aria-hidden />}
            title={t('landing:step1Title')}
            body={t('landing:step1Body')}
          />
          <StepCard
            icon={<GraduationCap size={22} aria-hidden />}
            title={t('landing:step2Title')}
            body={t('landing:step2Body')}
          />
          <StepCard
            icon={<Sparkles size={22} aria-hidden />}
            title={t('landing:step3Title')}
            body={t('landing:step3Body')}
          />
        </div>
      </section>

      {/* Demo tree */}
      <section
        aria-labelledby="demo-tree-heading"
        className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-10"
      >
        <div className="flex flex-col gap-1 text-center">
          <h2 id="demo-tree-heading" className="text-2xl font-semibold text-(--text-primary)">
            {t('landing:demoTitle')}
          </h2>
        </div>
        <div className="rounded-2xl border border-(--border) bg-(--bg-card) p-6">
          <RootTree
            root={DEMO_ROOT_KTB.root}
            words={DEMO_ROOT_KTB.words}
            onWordClick={handleDemoWordClick}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-(--border) py-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-6 text-sm text-(--text-muted) sm:flex-row">
          <span>{t('landing:footerTagline')}</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-(--text-primary)"
          >
            <Github size={14} aria-hidden />
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-(--border) bg-(--bg-card) p-6">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-(--cat-verb-fill)/15 text-(--cat-verb-ink)">
        {icon}
      </span>
      <h3 className="text-lg font-semibold text-(--text-primary)">{title}</h3>
      <p className="text-sm text-(--text-secondary)">{body}</p>
    </div>
  );
}
