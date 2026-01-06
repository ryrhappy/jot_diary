'use client';

import { useState } from 'react';
import { X, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslations } from 'next-intl';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) {
  const t = useTranslations('Auth');
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { signIn, signUp, resetPassword } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          // If it's an email not confirmed error, provide more detailed tip
          if (error.message?.includes('Email not confirmed') || error.message?.includes('邮箱未验证')) {
            setError(t('emailNotConfirmed'));
          } else {
            setError(error.message || t('signinError'));
          }
        } else {
          onClose();
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message || t('signupError'));
        } else {
          // Signup successful, clear form and switch to signin mode
          setMessage(t('signupSuccess'));
          setEmail(''); // Clear email, user needs to re-enter
          setPassword(''); // Clear password, user needs to re-enter
          // Delay switching to signin mode to let user see success message
          setTimeout(() => {
            setMode('signin');
            setMessage(null);
            // Form cleared, user needs to re-enter email and password to sign in
          }, 2000);
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message || t('resetError'));
        } else {
          setMessage(t('resetSuccess'));
        }
      }
    } catch (err) {
      setError(t('operationError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 glass rounded-2xl border border-slate-200/60 shadow-xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {mode === 'signin' && t('signinTitle')}
            {mode === 'signup' && t('signupTitle')}
            {mode === 'reset' && t('resetTitle')}
          </h2>
          <p className="text-sm text-slate-500">
            {mode === 'signin' && t('signinDescription')}
            {mode === 'signup' && t('signupDescription')}
            {mode === 'reset' && t('resetDescription')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('emailPlaceholder')}
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('passwordPlaceholder')}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'signin' && (loading ? t('signinButtonLoading') : t('signinButton'))}
            {mode === 'signup' && (loading ? t('signupButtonLoading') : t('signupButton'))}
            {mode === 'reset' && (loading ? t('resetButtonLoading') : t('resetButton'))}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm">
          {mode === 'signin' && (
            <>
              <button
                onClick={() => setMode('signup')}
                className="text-blue-600 hover:text-blue-700"
              >
                {t('noAccount')}
              </button>
              <br />
              <button
                onClick={() => setMode('reset')}
                className="text-slate-500 hover:text-slate-600"
              >
                {t('forgotPassword')}
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button
              onClick={() => setMode('signin')}
              className="text-blue-600 hover:text-blue-700"
            >
              {t('hasAccount')}
            </button>
          )}
          {mode === 'reset' && (
            <button
              onClick={() => setMode('signin')}
              className="text-blue-600 hover:text-blue-700"
            >
              {t('backToSignin')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

