'use client';

import { useTranslations } from 'next-intl';
import { Calendar, Menu, Feather, LogOut, User } from 'lucide-react';
import { useDiaryStore } from '@/store/useDiaryStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useState } from 'react';
import AuthModal from '@/components/auth/AuthModal';

export default function Header() {
  const t = useTranslations('Index');
  const at = useTranslations('Auth');
  const { 
    view, setView,
    setIsDrawerOpen 
  } = useDiaryStore();
  const { user, signOut } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="fixed top-0 w-full z-40 flex flex-col items-center p-6 gap-4 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
      <div className="w-full max-w-2xl flex justify-between items-center px-2">
        <button 
          onClick={() => setView('timeline')}
          className="text-lg font-bold tracking-[0.2em] text-slate-800 flex items-center gap-2"
        >
          <span className="p-1.5 bg-slate-800 rounded-lg">
            <Feather className="w-3.5 h-3.5 text-white" />
          </span>
          {t('title')}
        </button>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => setView(view === 'archive' ? 'timeline' : 'archive')}
            className={`p-2 rounded-full transition-colors ${view === 'archive' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-100'}`}
            title={t('viewPast')}
          >
            <Calendar className="w-5 h-5" />
          </button>
          <button onClick={() => setIsDrawerOpen(true)} className="text-slate-400 hover:text-slate-600">
            <Menu className="w-5 h-5" />
          </button>
          
          {/* User Menu */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {at('signin')}
              </button>
            )}
            
            {showUserMenu && user && (
              <div className="absolute right-0 top-full mt-2 w-48 glass rounded-lg border border-slate-200/60 shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-200/60">
                  <p className="text-sm font-medium text-slate-800 truncate">{user.email}</p>
                </div>
                <button
                  onClick={async () => {
                    await signOut();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-100 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {at('signout')}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          defaultMode="signin"
        />
      </div>
    </header>
  );
}

