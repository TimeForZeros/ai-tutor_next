import { createPromptSlice } from '@/stores/promptSlice';
export * from './prompt';

export interface AppState extends ReturnType<typeof createPromptSlice> {}
