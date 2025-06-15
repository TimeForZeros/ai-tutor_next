'use client';

import { PromptResponse } from '@/types';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { v4 } from 'uuid';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRef, RefObject } from 'react';
import axios from 'axios';
import Markdown from 'react-markdown';
import { useAppStore } from '@/stores';
const queryClient = new QueryClient();


const PromptResponseItem = ({ text, uuid, isPrompt }: PromptResponse) => {
  const content = isPrompt ? (
    <p className="p-1 rounded-sm  max-w-[80%] bg-slate-400 text-white justify-end">
      {text}
    </p>
  ) : (
    <div className="p-1 rounded-sm bg-slate-600 text-white max-w-[80%]">
      <Markdown>{text || 'Loading...'}</Markdown>
    </div>
  );

  let classItems = 'm-1 p-1 rounded-sm flex';
  if (isPrompt) {
    classItems += ' justify-end';
  }

  return (
    <li className={classItems} id={uuid} key={uuid}>
      {content}
    </li>
  );
};
const ResponseList = ({ list }: { list: PromptResponse[] }) => {
  return <ul className="bg-slate-200 rounded-sm">{list.map(PromptResponseItem)}</ul>;
};

const PromptForm = () => {
  const store = useAppStore();
  useQuery({
    queryKey: ['ask', store.prompt],
    enabled: !!store.prompt,
    queryFn: async () => {
      const { data } = await axios.post('/api/', store.prompt);
      const list = [...store.list];
      const item = list.at(-1)!;
      item.text = data.text;
      store.update(list);
    },
  });
  const { register, handleSubmit } = useForm();
  const onSubmit: SubmitHandler<any> = async (formData) => {
    if (!formData.prompt) return;
    store.update([
      ...store.list,
      { uuid: v4(), text: formData.prompt, isPrompt: true },
      { uuid: v4() },
    ]);
    store.setPrompt(formData.prompt);
  };
  return (
    <form className="my-1" onSubmit={handleSubmit(onSubmit)}>
      <Input className="my-1" type="text" {...register('prompt')} />
      <Button className="my-1" type="submit">
        Submit
      </Button>
    </form>
  );
};

const PromptCard = () => {
  const store = useAppStore();
  return (
    <Card className="w-[80vw] md:w-[50vw]">
      <CardContent>
        <ResponseList list={store.list} />
        <h2>Ask a question</h2>
        <PromptForm />
      </CardContent>
    </Card>
  );
};

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <PromptCard />
        </main>
      </div>
    </QueryClientProvider>
  );
}
