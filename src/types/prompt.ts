export interface PromptResponse {
  isLoading?: boolean;
  text?: string;
  uuid: string;
}

export interface PromptSlice {
  list: PromptResponse[];
  update: (updatedList: PromptResponse[]) => void;
}

export type SetPromptState = (partial: Partial<PromptSlice>) => void;
