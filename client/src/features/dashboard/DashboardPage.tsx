import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/useAuth';
import { Button } from '@/shared/ui/Button';

export default function DashboardPage() {
  const { t } = useTranslation(['nav', 'common']);
  const { user, logout } = useAuth();
  return (
    <main id="main" className="p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('nav:dashboard')}</h1>
        <Button variant="ghost" onClick={() => void logout()}>
          {t('nav:logout')}
        </Button>
      </header>
      <p className="mt-4 text-(--text-muted)">
        {user ? `${user.username} (${user.email})` : t('common:loading')}
      </p>
    </main>
  );
}
