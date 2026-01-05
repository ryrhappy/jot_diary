import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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
  loading: boolean;
  view: 'timeline' | 'categories' | 'search';
  selectedCategory: Category | null;
  searchQuery: string;
  isAiMode: boolean;
  isDrawerOpen: boolean;
  isSttActive: boolean;
  sttText: string;
  
  fetchEntries: () => Promise<void>;
  setEntries: (entries: DiaryEntry[]) => void;
  addEntry: (entry: DiaryEntry) => Promise<void>;
  updateEntry: (id: string, updates: Partial<DiaryEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  setView: (view: 'timeline' | 'categories' | 'search') => void;
  setSelectedCategory: (category: Category | null) => void;
  setSearchQuery: (query: string) => void;
  setIsAiMode: (isAiMode: boolean) => void;
  setIsDrawerOpen: (isOpen: boolean) => void;
  setIsSttActive: (isActive: boolean) => void;
  setSttText: (text: string) => void;
}

export const useDiaryStore = create<DiaryState>((set, get) => ({
  entries: [],
  loading: false,
  view: 'timeline',
  selectedCategory: null,
  searchQuery: '',
  isAiMode: false,
  isDrawerOpen: false,
  isSttActive: false,
  sttText: '',

  fetchEntries: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (error) throw error;
      set({ entries: data || [] });
    } catch (err) {
      console.error('Error fetching entries:', err);
    } finally {
      set({ loading: false });
    }
  },

  setEntries: (entries) => set({ entries }),

  addEntry: async (entry) => {
    // 乐观更新
    const previousEntries = get().entries;
    set((state) => ({ entries: [entry, ...state.entries] }));

    try {
      const { error } = await supabase.from('diaries').insert([entry]);
      if (error) throw error;
    } catch (err) {
      console.error('Error adding entry:', err);
      // 回滚
      set({ entries: previousEntries });
    }
  },

  updateEntry: async (id, updates) => {
    // 乐观更新
    const previousEntries = get().entries;
    set((state) => ({
      entries: state.entries.map((entry) => 
        entry.id === id ? { ...entry, ...updates } : entry
      )
    }));

    try {
      const { error } = await supabase
        .from('diaries')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating entry:', err);
      // 回滚
      set({ entries: previousEntries });
    }
  },

  deleteEntry: async (id) => {
    // 乐观更新
    const previousEntries = get().entries;
    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== id)
    }));

    try {
      const { error } = await supabase
        .from('diaries')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting entry:', err);
      // 回滚
      set({ entries: previousEntries });
    }
  },

  setView: (view) => set({ view }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsAiMode: (isAiMode) => set({ isAiMode }),
  setIsDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
  setIsSttActive: (isActive) => set({ isSttActive: isActive }),
  setSttText: (text) => set({ sttText: text }),
}));

