import { create } from 'zustand';
import type { UISpecProject } from '@/types/spec';

interface HistoryEntry {
  id: string;
  timestamp: number;
  action: string;
  state: UISpecProject;
}

interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
  maxHistory: number;

  // Actions
  pushState: (action: string, state: UISpecProject) => void;
  undo: () => UISpecProject | null;
  redo: () => UISpecProject | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}

let historyIdCounter = 0;

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  maxHistory: 50,

  pushState: (action, state) =>
    set((prev) => {
      const entry: HistoryEntry = {
        id: `history-${++historyIdCounter}`,
        timestamp: Date.now(),
        action,
        state: JSON.parse(JSON.stringify(state)), // Deep clone
      };

      const newPast = [...prev.past, entry].slice(-prev.maxHistory);

      return {
        past: newPast,
        future: [], // Clear future on new action
      };
    }),

  undo: () => {
    const state = get();
    if (state.past.length === 0) return null;

    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, -1);

    set({ past: newPast });
    return previous.state;
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return null;

    const next = state.future[0];
    const newFuture = state.future.slice(1);

    set((prev) => ({
      past: [...prev.past, next],
      future: newFuture,
    }));

    return next.state;
  },

  canUndo: () => get().past.length > 0,

  canRedo: () => get().future.length > 0,

  clear: () =>
    set({
      past: [],
      future: [],
    }),
}));
