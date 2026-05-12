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
    <div className="relative flex flex-col">
      {/* Subtle parchment grain — pure CSS, no asset cost */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 10%, var(--gold-light, oklch(0.92 0.07 80)) 0%, transparent 38%), radial-gradient(circle at 85% 80%, oklch(0.93 0.04 30) 0%, transparent 40%)',
        }}
      />

      {/* HERO */}
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-7 px-6 pb-20 pt-16 text-center sm:pt-24">
        {/* Badge / eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-(--border-strong) bg-(--bg-card) px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-(--text-secondary) shadow-[var(--shadow-sm)]"
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-(--gold-accent)"
            style={{ boxShadow: '0 0 0 3px rgba(196,154,63,0.15)' }}
          />
          {t('landing:heroBadge', { defaultValue: 'Apprentissage par les racines trilitères' })}
        </motion.div>

        {/* Title with italic accent */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="max-w-4xl text-[clamp(40px,6.2vw,76px)] font-medium leading-[1.04] text-(--text-primary)"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}
        >
          {t('landing:heroTitle').split(' ').slice(0, -1).join(' ')}{' '}
          <em
            className="not-italic sm:italic"
            style={{
              fontStyle: 'italic',
              color: 'var(--gold)',
              fontWeight: 400,
              fontFamily: 'var(--font-display)',
            }}
          >
            {t('landing:heroTitle').split(' ').slice(-1)[0]}
          </em>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-xl text-[17px] leading-relaxed text-(--text-secondary) sm:text-lg"
        >
          {t('landing:heroSubtitle')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-3"
        >
          <Link to="/explore">
            <Button size="lg">{t('landing:ctaExplore')}</Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              {t('landing:ctaRegister')}
            </Button>
          </Link>
        </motion.div>

        {/* Eyebrow Arabic showcase */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-6 flex flex-col items-center gap-3 text-(--text-muted)"
        >
          <div className="ornament-rule w-full max-w-md text-xs uppercase tracking-[0.3em] text-(--gold)">
            <ArabicText as="inline" unvocalized="كتب" className="text-3xl text-(--text-primary)">
              كَتَبَ
            </ArabicText>
          </div>
          <p
            className="text-sm italic text-(--text-muted)"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('landing:heroEyebrow', {
              defaultValue: 'écrire, livre, écrivain, bureau, bibliothèque…',
            })}
          </p>
        </motion.div>
      </section>

      {/* STEPS */}
      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <span className="text-xs uppercase tracking-[0.24em] text-(--gold)">
            {t('landing:stepsTitle')}
          </span>
          <h2 className="text-3xl font-medium text-(--text-primary) sm:text-4xl">
            {t('landing:heroTitle').split(' ').slice(0, 2).join(' ')},{' '}
            <em style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>
              {t('common:retry') /* fallback */ === 'Retry' ? 'simply.' : 'simplement.'}
            </em>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <StepCard
            index="01"
            icon={<Compass size={20} aria-hidden />}
            title={t('landing:step1Title')}
            body={t('landing:step1Body')}
            tint="verb"
          />
          <StepCard
            index="02"
            icon={<GraduationCap size={20} aria-hidden />}
            title={t('landing:step2Title')}
            body={t('landing:step2Body')}
            tint="noun"
          />
          <StepCard
            index="03"
            icon={<Sparkles size={20} aria-hidden />}
            title={t('landing:step3Title')}
            body={t('landing:step3Body')}
            tint="participle"
          />
        </div>
      </section>

      {/* DEMO TREE */}
      <section
        aria-labelledby="demo-tree-heading"
        className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-16"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-xs uppercase tracking-[0.24em] text-(--gold)">
            {t('landing:demoSubtitle', { defaultValue: 'Une seule racine, des dizaines de mots.' })}
          </span>
          <h2
            id="demo-tree-heading"
            className="text-3xl font-medium text-(--text-primary) sm:text-4xl"
          >
            {t('landing:demoTitle')}
          </h2>
        </div>

        <div
          className="relative overflow-hidden rounded-[28px] border border-(--border) bg-(--bg-card) p-4 sm:p-8"
          style={{
            boxShadow: 'var(--shadow-lg)',
            backgroundImage:
              'radial-gradient(circle at 50% 50%, var(--bg-elev) 0%, var(--bg-card) 70%)',
          }}
        >
          {/* Corner ornaments — manuscript flourishes */}
          <CornerOrnament className="left-3 top-3" />
          <CornerOrnament className="right-3 top-3" rotate={90} />
          <CornerOrnament className="bottom-3 right-3" rotate={180} />
          <CornerOrnament className="bottom-3 left-3" rotate={-90} />

          <RootTree
            root={DEMO_ROOT_KTB.root}
            words={DEMO_ROOT_KTB.words}
            onWordClick={handleDemoWordClick}
          />

          {/* Legend */}
          <DemoLegend />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-(--border) py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-(--text-muted) sm:flex-row">
          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
            {t('landing:footerTagline')}
          </span>
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

function StepCard({
  index,
  icon,
  title,
  body,
  tint,
}: {
  index: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  tint: 'verb' | 'noun' | 'participle';
}) {
  const tintVar =
    tint === 'verb'
      ? 'var(--cat-verb-fill)'
      : tint === 'noun'
        ? 'var(--cat-noun-fill)'
        : 'var(--cat-participle-fill)';
  const inkVar =
    tint === 'verb'
      ? 'var(--cat-verb-ink)'
      : tint === 'noun'
        ? 'var(--cat-noun-ink)'
        : 'var(--cat-participle-ink)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 * Number(index) }}
      whileHover={{ y: -3 }}
      className="group relative flex flex-col gap-4 rounded-[20px] border border-(--border) bg-(--bg-card) p-7 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
    >
      <div className="flex items-center justify-between">
        <span
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{
            background: `color-mix(in oklab, ${tintVar} 14%, var(--bg-card))`,
            color: inkVar,
            boxShadow: 'inset 0 0 0 1px color-mix(in oklab, ' + tintVar + ' 22%, transparent)',
          }}
        >
          {icon}
        </span>
        <span
          className="font-mono text-xs tracking-widest text-(--text-muted) opacity-70"
          aria-hidden
        >
          {index}
        </span>
      </div>
      <h3
        className="text-2xl font-medium text-(--text-primary)"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h3>
      <p className="text-[15px] leading-relaxed text-(--text-secondary)">{body}</p>
      <span
        aria-hidden
        className="absolute inset-x-7 bottom-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${tintVar}, transparent)`,
          opacity: 0.5,
        }}
      />
    </motion.div>
  );
}

function DemoLegend() {
  const { t } = useTranslation(['landing']);
  const items: { tint: string; label: string }[] = [
    { tint: 'var(--cat-verb-fill)', label: t('landing:demoLegendVerb', { defaultValue: 'Verbe' }) },
    { tint: 'var(--cat-noun-fill)', label: t('landing:demoLegendNoun', { defaultValue: 'Nom' }) },
    {
      tint: 'var(--cat-derive-fill)',
      label: t('landing:demoLegendAgent', { defaultValue: 'Agent' }),
    },
    {
      tint: 'var(--cat-pluriel-brise-fill)',
      label: t('landing:demoLegendPlace', { defaultValue: 'Lieu' }),
    },
    {
      tint: 'var(--cat-masdar-fill)',
      label: t('landing:demoLegendVerbalNoun', { defaultValue: 'Masdar' }),
    },
    {
      tint: 'var(--cat-participle-fill)',
      label: t('landing:demoLegendParticiple', { defaultValue: 'Participe' }),
    },
    {
      tint: 'var(--cat-adverb-fill)',
      label: t('landing:demoLegendInstrument', { defaultValue: 'Instrument' }),
    },
  ];
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-(--border)/60 pt-5">
      <span className="me-2 text-xs uppercase tracking-[0.2em] text-(--text-muted)">
        {t('landing:demoLegendTitle', { defaultValue: 'Légende' })}
      </span>
      {items.map((it) => (
        <span
          key={it.label}
          className="inline-flex items-center gap-1.5 text-xs text-(--text-secondary)"
        >
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-full"
            style={{
              background: it.tint,
              boxShadow: `0 0 0 2px color-mix(in oklab, ${it.tint} 25%, transparent)`,
            }}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}

/**
 * Decorative corner flourish — pure SVG manuscript ornament.
 * Absolutely positioned, aria-hidden.
 */
function CornerOrnament({ className, rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <svg
      aria-hidden
      width="32"
      height="32"
      viewBox="0 0 32 32"
      className={`pointer-events-none absolute ${className ?? ''}`}
      style={{ transform: `rotate(${rotate}deg)`, color: 'var(--gold-accent)', opacity: 0.55 }}
    >
      <path
        d="M2 2 L2 12 M2 2 L12 2"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="2" cy="2" r="1.2" fill="currentColor" />
    </svg>
  );
}
