'use client';
import Image from 'next/image';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { useState, useRef } from 'react';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { v4 } from 'uuid';
const queryClient = new QueryClient();

const openai = createOpenAI();

export default function Home() {
  console.log('hits');
  const ref = useRef('');
  interface ResponseItem {
    text: string;
    uuid: string;
  }
  const [responseList, setResponseList] = useState<ResponseItem[]>([]);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['ask'],
    enabled: false,
    queryFn: async () => {
      if (!prompt) return;
      const { text } = await generateText({
        model: openai('gpt-4o-mini'),
        prompt: ref.current,
      });
      setResponseList([...responseList, { text, uuid: v4() }]);
      return prompt;
    },
  });

  const submitPrompt = () => refetch();
  const handleKeyDown = (key: string) => {
    if (key !== 'Enter') return;
    submitPrompt();
  };

  const ResponseItem = ({ text, uuid }: ResponseItem) => (
    <li id={uuid} key={uuid}>
      {text}
    </li>
  );
  const ResponseList = () => {
    console.count('rerender');
    return <ul>{responseList.map(ResponseItem)}</ul>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
        <main className='flex flex-col gap-[32px] row-start-2 items-center sm:items-start'>
          <Card className='w-[50vw]'>
            <div>Ask a question</div>
            <CardContent>
              <Input
                type='text'
                onKeyDown={(e) => handleKeyDown(e.key)}
                onChange={(e) => (ref.current = e.target.value)}
              ></Input>
              <Button onClick={submitPrompt}>Submit</Button>
              <ResponseList />
            </CardContent>
          </Card>
        </main>
      </div>
    </QueryClientProvider>
  );
}
