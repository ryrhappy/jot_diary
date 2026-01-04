import { create } from 'zustand';

export type Category = 'TODO' | 'DREAM' | 'BEAUTIFUL' | 'REFLECTION' | 'GRATITUDE' | 'NORMAL';

export interface DiaryEntry {
  id: string;
  content: string;
  time: string;
  date: string;
  category: Category;
  completed?: boolean;
}

interface DiaryState {
  entries: DiaryEntry[];
  view: 'timeline' | 'categories' | 'search';
  selectedCategory: Category | null;
  searchQuery: string;
  isAiMode: boolean;
  isDrawerOpen: boolean;
  isSttActive: boolean;
  sttText: string;
  
  setEntries: (entries: DiaryEntry[]) => void;
  addEntry: (entry: DiaryEntry) => void;
  updateEntry: (id: string, updates: Partial<DiaryEntry>) => void;
  deleteEntry: (id: string) => void;
  setView: (view: 'timeline' | 'categories' | 'search') => void;
  setSelectedCategory: (category: Category | null) => void;
  setSearchQuery: (query: string) => void;
  setIsAiMode: (isAiMode: boolean) => void;
  setIsDrawerOpen: (isOpen: boolean) => void;
  setIsSttActive: (isActive: boolean) => void;
  setSttText: (text: string) => void;
}

export const useDiaryStore = create<DiaryState>((set) => ({
  entries: [
    { id: '1', content: '今天在思南路散步，看到阳光洒在梧桐树上，真是美好事情。', time: '14:20', date: '2026-01-04', category: 'BEAUTIFUL' },
    { id: '2', content: '待办：下午三点记得给张总回个电话确认 RAG 方案。', time: '10:30', date: '2026-01-04', category: 'TODO', completed: false },
    { id: '3', content: '读了半本《禅与摩托车维修艺术》，感恩能有这样宁静的早晨。', time: '08:15', date: '2026-01-04', category: 'GRATITUDE' },
  ],
  view: 'timeline',
  selectedCategory: null,
  searchQuery: '',
  isAiMode: false,
  isDrawerOpen: false,
  isSttActive: false,
  sttText: '',

  setEntries: (entries) => set({ entries }),
  addEntry: (entry) => set((state) => ({ entries: [entry, ...state.entries] })),
  updateEntry: (id, updates) => set((state) => ({
    entries: state.entries.map((entry) => 
      entry.id === id ? { ...entry, ...updates } : entry
    )
  })),
  deleteEntry: (id) => set((state) => ({
    entries: state.entries.filter((entry) => entry.id !== id)
  })),
  setView: (view) => set({ view }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsAiMode: (isAiMode) => set({ isAiMode }),
  setIsDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
  setIsSttActive: (isActive) => set({ isSttActive: isActive }),
  setSttText: (text) => set({ sttText: text }),
}));

