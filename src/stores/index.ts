import { create } from 'zustand';
import { createPromptSlice } from './promptSlice';

interface AppState extends ReturnType<typeof createPromptSlice> {}

export const useAppStore = create<AppState>((set) => ({
  ...createPromptSlice(set),
}));
