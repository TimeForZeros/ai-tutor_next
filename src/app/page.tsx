'use client';

import { PromptResponse } from '@/types';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { v4 } from 'uuid';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRef } from 'react';
import axios from 'axios';
import Markdown from 'react-markdown';
import { useAppStore } from '@/stores';
const queryClient = new QueryClient();

const PromptResponseItem = ({ isLoading, text, uuid }: PromptResponse) => (
  <li className='p-1 border outline rounded-sm' id={uuid} key={uuid}>
    <Markdown>{isLoading ? 'Loading...' : text}</Markdown>
  </li>
);
const ResponseList = ({ list }: { list: PromptResponse[] }) => (
  <ul>{list.map(PromptResponseItem)}</ul>
);

const PromptCard = () => {
  const store = useAppStore();
  const prompt = useRef('');
  const { data, refetch, isLoading, isSuccess } = useQuery({
    queryKey: ['ask', prompt], // Add prompt as part of the key for better cache separation
    enabled: false,
    queryFn: async () => {
      const {data} = await axios.post('/api/', { prompt: prompt.current });
      console.log(data);
      return data;

      }, // Send as object for clarity
    // Replace the last pending item with the response
  });
  console.log(data);

  if (isLoading) {
    store.update([...store.list.slice(0, -1), { uuid: v4(), isLoading }]);
  } else if (isSuccess) {
    console.log(data.text);
    store.update([...store.list.slice(0, -1), { text: data.text, uuid: v4() }]);
  }

  const PromptForm: React.FC = () => {
    const { register, handleSubmit } = useForm();
    const onSubmit: SubmitHandler<any> = (data) => {
      if (!data.prompt) return;
      prompt.current = data.prompt;
      store.list.push({ isLoading, uuid: v4() });
      store.update(store.list);
      refetch();
    };
    return (
      <form className='my-1' onSubmit={handleSubmit(onSubmit)}>
        <Input className='my-1' type='text' {...register('prompt')}></Input>
        <Button className='my-1' type='submit'>
          Submit
        </Button>
      </form>
    );
  };
  // const list = useAppStore((store) => store.list);

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
