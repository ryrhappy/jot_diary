'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Header from '@/components/diary/Header';
import Timeline from '@/components/diary/Timeline';
import InputArea from '@/components/diary/InputArea';
import Sidebar from '@/components/diary/Sidebar';
import CategoryView from '@/components/diary/CategoryView';
import SearchView from '@/components/diary/SearchView';
import ArchiveView from '@/components/diary/ArchiveView';
import { useDiaryStore } from '@/store/useDiaryStore';
import { useAuthStore } from '@/store/useAuthStore';
import AuthModal from '@/components/auth/AuthModal';
import { Loader2, Languages } from 'lucide-react';
import { useRouter, usePathname } from '@/i18n/routing';

export default function Home() {
  const t = useTranslations('Index');
  const wt = useTranslations('Welcome');
  const st = useTranslations('Settings');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { view, fetchEntries } = useDiaryStore();
  const { user, loading, initialized, initialize } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Initialize authentication state
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  // Fetch diary entries after user logs in
  useEffect(() => {
    if (user && initialized) {
      fetchEntries();
    }
  }, [user, initialized, fetchEntries]);

  // Show loading state if not initialized
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Show login prompt if not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        {/* Language Switcher for Welcome Screen */}
        <div className="absolute top-8 right-8 flex gap-2 items-center bg-white/50 backdrop-blur-sm p-2 rounded-xl border border-slate-200/60">
          <Languages className="w-4 h-4 text-slate-400" />
          <button
            onClick={() => router.replace(pathname, { locale: 'en' })}
            className={`text-xs px-2 py-1 rounded-md transition-colors ${locale === 'en' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            EN
          </button>
          <button
            onClick={() => router.replace(pathname, { locale: 'zh' })}
            className={`text-xs px-2 py-1 rounded-md transition-colors ${locale === 'zh' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            中文
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">{wt('title')}</h2>
          <p className="text-slate-600 mb-6">{wt('description')}</p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors"
          >
            {wt('button')}
          </button>
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          defaultMode="signin"
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center">
      <Header />
      
      <main className="w-full max-w-3xl mt-24 px-6 relative flex flex-col gap-12">
        {view === 'timeline' && (
          <>
            <div className="pt-4">
              <InputArea />
            </div>
            <Timeline />
          </>
        )}
        {view === 'categories' && <CategoryView />}
        {view === 'search' && <SearchView />}
        {view === 'archive' && <ArchiveView />}
      </main>

      <Sidebar />
    </div>
  );
}

