import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const { t } = useTranslation(['errors']);
  return (
    <main
      id="main"
      className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6 text-center"
    >
      <h1 className="text-3xl font-semibold">404</h1>
      <p>{t('errors:page-not-found')}</p>
      <Link to="/" className="underline">
        {t('errors:go-home')}
      </Link>
    </main>
  );
}
