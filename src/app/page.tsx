'use client';
import Image from 'next/image';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { v4 } from 'uuid';
import { create } from 'zustand';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRef } from 'react';
const queryClient = new QueryClient();

const openai = createOpenAI({
  apiKey: ''
});

interface ResponseItem {
  isPending?: boolean;
  text?: string;
  uuid: string;
}

interface ResponseStoreState {
  list: ResponseItem[];
  update: (responseList: ResponseItem[]) => void;
}
const useResponseStore = create<ResponseStoreState>((set) => ({
  list: [],
  update: (updatedList: ResponseItem[]) => set({ list: [...updatedList] }),
}));

const ResponseItem = ({ isPending, text, uuid }: ResponseItem) => (
  <li id={uuid} key={uuid}>
    {isPending ? 'Loading...' : text}
  </li>
);
const ResponseList = ({ list }: { list: ResponseItem[] }) => <ul>{list.map(ResponseItem)}</ul>;
const PromptCard = () => {
  const prompt = useRef('');
  const store = useResponseStore();
  const { refetch } = useQuery({
    queryKey: ['ask'],
    enabled: false,
    queryFn: async () => {
      const { text } = await generateText({
        model: openai('gpt-4o-mini'),
        prompt: prompt.current,
      });
      store.update([...store.list.slice(0, -1), { text, uuid: v4() }]);
    },
  });
  const PromptForm: React.FC = () => {
    const { register, handleSubmit } = useForm();
    const onSubmit: SubmitHandler<any> = (data) => {
      if (!data.prompt) return;
      prompt.current = data.prompt;
      store.list.push({ isPending: true, uuid: v4() })
      store.update(store.list);
      refetch();
    };
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input className='my-1' type='text' {...register('prompt')}></Input>
        <Button className='my-1' type='submit'>
          Submit
        </Button>
      </form>
    );
  };

  return (
    <Card className='w-[50vw]'>
      <CardContent>
        <h2>Ask a question</h2>
        <PromptForm />
        <ResponseList list={store.list} />
      </CardContent>
    </Card>
  );
};

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
        <main className='flex flex-col gap-[32px] row-start-2 items-center sm:items-start'>
          <PromptCard />
        </main>
      </div>
    </QueryClientProvider>
  );
}
