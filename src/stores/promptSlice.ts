import { PromptResponse, PromptSlice, SetPromptState } from '@/types';

export const createPromptSlice = (set: SetPromptState): PromptSlice => ({
  list: [],
  update: (updatedList: PromptResponse[]) => set({ list: [...updatedList] }),
});
