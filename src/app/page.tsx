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

const PromptResponseItem = ({ text, uuid }: PromptResponse) => {
  return (
    <li className='p-1 border outline rounded-sm' id={uuid} key={uuid}>
      <Markdown>{text || 'Loading...'}</Markdown>
    </li>
  );
};
const ResponseList = ({ list }: { list: PromptResponse[] }) => {
  return <ul>{list.map(PromptResponseItem)}</ul>;
};

const PromptForm = () => {
  const store = useAppStore();
    const { data, isSuccess, isLoading } = useQuery({
    queryKey: ['ask', store.prompt],
    enabled: !!store.prompt,
    queryFn: async () => {
      const { data } = await axios.post('/api/', store.prompt);
      return data.text;
    },
  });
  const { register, handleSubmit } = useForm();
  const onSubmit: SubmitHandler<any> = async (formData) => {
    if (!formData.prompt) return;
    store.setPrompt(formData.prompt);
    store.update([...store.list, { uuid: v4(), text: data }]);
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
