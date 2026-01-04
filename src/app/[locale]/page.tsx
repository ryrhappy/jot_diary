'use client';

import Header from '@/components/diary/Header';
import Timeline from '@/components/diary/Timeline';
import InputArea from '@/components/diary/InputArea';
import Sidebar from '@/components/diary/Sidebar';
import CategoryView from '@/components/diary/CategoryView';
import SearchView from '@/components/diary/SearchView';
import { useDiaryStore } from '@/store/useDiaryStore';

export default function Home() {
  const { view } = useDiaryStore();

  return (
    <div className="relative min-h-screen flex flex-col items-center pb-24">
      <Header />
      
      <main className="w-full max-w-3xl mt-48 px-6 relative">
        {view === 'timeline' && <Timeline />}
        {view === 'categories' && <CategoryView />}
        {view === 'search' && <SearchView />}
      </main>

      {view === 'timeline' && <InputArea />}
      <Sidebar />
    </div>
  );
}

