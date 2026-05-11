import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { useAuth } from './useAuth';
import { Button } from '@/shared/ui/Button';

type LocationState = { from?: string } | null;

export default function LoginPage() {
  const { t } = useTranslation(['auth', 'common']);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState)?.from ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login({ email, password });
      toast.success(t('auth:login-title'));
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? (err.response?.data?.message ?? err.message)
          : t('common:error');
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      id="main"
      className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 p-6"
    >
      <h1 className="text-2xl font-semibold">{t('auth:login-title')}</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm">{t('auth:email')}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-(--border) bg-(--bg-card) px-3 py-2"
            autoComplete="email"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">{t('auth:password')}</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-(--border) bg-(--bg-card) px-3 py-2"
            autoComplete="current-password"
          />
        </label>
        <Button type="submit" loading={submitting}>
          {t('auth:submit-login')}
        </Button>
      </form>
      <p className="text-sm text-(--text-muted)">
        {t('auth:no-account')}{' '}
        <Link to="/register" className="underline">
          {t('auth:register-title')}
        </Link>
      </p>
    </main>
  );
}
