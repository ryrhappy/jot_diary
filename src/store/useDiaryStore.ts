import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { formatLocalDate } from '@/lib/date-utils';

export type Category = 'TODO' | 'DREAM' | 'BEAUTIFUL' | 'REFLECTION' | 'GRATITUDE' | 'NORMAL';

export interface DiaryEntry {
  id: string;
  content: string;
  time: string;
  date: string;
  category: Category;
  completed?: boolean;
  user_id?: string; // User ID, automatically linked by DB
}

interface DiaryState {
  entries: DiaryEntry[];
  loading: boolean;
  view: 'timeline' | 'categories' | 'search' | 'archive';
  selectedCategory: Category | null;
  archiveDate: string; // YYYY-MM-DD
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
  setView: (view: 'timeline' | 'categories' | 'search' | 'archive') => void;
  setSelectedCategory: (category: Category | null) => void;
  setArchiveDate: (date: string) => void;
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
  archiveDate: formatLocalDate(new Date()),
  searchQuery: '',
  isAiMode: false,
  isDrawerOpen: false,
  isSttActive: false,
  sttText: '',

  fetchEntries: async () => {
    set({ loading: true });
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ entries: [], loading: false });
        return;
      }

      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .eq('user_id', user.id) // Only fetch data for current user
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
    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    // 乐观更新
    const previousEntries = get().entries;
    const entryWithUserId = { ...entry, user_id: user.id };
    set((state) => ({ entries: [entryWithUserId, ...state.entries] }));

    try {
      const { error } = await supabase.from('diaries').insert([entryWithUserId]);
      if (error) throw error;
    } catch (err) {
      console.error('Error adding entry:', err);
      // 回滚
      set({ entries: previousEntries });
    }
  },

  updateEntry: async (id, updates) => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    // Optimistic update
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
        .eq('id', id)
        .eq('user_id', user.id); // Ensure only updating own data
      if (error) throw error;
    } catch (err) {
      console.error('Error updating entry:', err);
      // Rollback
      set({ entries: previousEntries });
    }
  },

  deleteEntry: async (id) => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    // Optimistic update
    const previousEntries = get().entries;
    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== id)
    }));

    try {
      const { error } = await supabase
        .from('diaries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure only deleting own data
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting entry:', err);
      // Rollback
      set({ entries: previousEntries });
    }
  },

  setView: (view) => set({ view }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setArchiveDate: (date) => set({ archiveDate: date }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsAiMode: (isAiMode) => set({ isAiMode }),
  setIsDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
  setIsSttActive: (isActive) => set({ isSttActive: isActive }),
  setSttText: (text) => set({ sttText: text }),
}));

