import { useTranslation } from 'react-i18next';
import { LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { Button } from '@/shared/ui/Button';

export default function ProfilePage() {
  const { t } = useTranslation(['auth', 'common', 'nav']);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  async function handleLogout() {
    await logout();
    toast.success(t('nav:logout'));
    navigate('/');
  }

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="flex items-center gap-4">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-(--cat-verb-fill)/15 text-(--cat-verb-ink)">
          <User size={28} aria-hidden />
        </span>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-(--text-primary)">{user.username}</h1>
          <p className="text-(--text-muted)">{user.email}</p>
        </div>
      </header>

      <dl className="grid grid-cols-1 gap-4 rounded-xl border border-(--border) bg-(--bg-card) p-6 sm:grid-cols-2">
        <Row label={t('auth:roleLabel')} value={user.role} />
        <Row label={t('auth:interfaceLanguage')} value={user.preferredInterfaceLanguage ?? 'fr'} />
        <Row label={t('auth:preferredTheme')} value={user.preferredTheme ?? 'system'} />
        <Row label={t('auth:timezone')} value={user.timezone ?? '-'} />
      </dl>

      <div className="flex">
        <Button
          variant="secondary"
          icon={<LogOut size={16} aria-hidden />}
          onClick={() => void handleLogout()}
        >
          {t('nav:logout')}
        </Button>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs uppercase text-(--text-muted)">{label}</dt>
      <dd className="text-sm font-medium text-(--text-primary)">{value}</dd>
    </div>
  );
}
