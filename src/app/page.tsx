'use client';

import { PromptResponse } from '@/types';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { v4 } from 'uuid';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRef, RefObject } from 'react';
import axios from 'axios';
import Markdown from 'react-markdown';
import { useAppStore } from '@/stores';
const queryClient = new QueryClient();

const PromptResponseItem = ({ uuid, text }: PromptResponse) => {
  // If text is already present, just render it. Otherwise, fetch it.
  const store = useAppStore();
  const item = store.list.find((item) => item.uuid === uuid);
  const prompt = item?.text ? undefined : store.prompt; // Or store a prompt per item if needed

  const { data, isLoading } = useQuery({
    queryKey: ['ask', uuid],
    enabled: !text && !!prompt, // Only fetch if no text and prompt is available
    queryFn: async () => {
      const { data } = await axios.post('/api/', prompt);
      // Update the store with the fetched text
      const updatedList = store.list.map((i) =>
        i.uuid === uuid ? { ...i, text: data.text } : i
      );
      store.update(updatedList);
      return data.text;
    },
  });

  return (
    <li className='p-1 border outline rounded-sm' id={uuid} key={uuid}>
      <Markdown>{text || data || (isLoading ? 'Loading...' : '')}</Markdown>
    </li>
  );
};
const ResponseList = ({ list }: { list: PromptResponse[] }) => {
  return <ul>{list.map(PromptResponseItem)}</ul>;
};

const PromptForm = () => {
  const store = useAppStore();
  const { register, handleSubmit, reset } = useForm();
  const onSubmit: SubmitHandler<any> = (formData) => {
    if (!formData.prompt) return;
    const uuid = v4();
    store.setPrompt(formData.prompt);
    store.update([...store.list, { uuid }]);
    reset();
  };
  return (
    <form className='my-1' onSubmit={handleSubmit(onSubmit)}>
      <Input className='my-1' type='text' {...register('prompt')} />
      <Button className='my-1' type='submit'>
        Submit
      </Button>
    </form>
  );
};

const PromptCard = () => {
  const store = useAppStore();
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
