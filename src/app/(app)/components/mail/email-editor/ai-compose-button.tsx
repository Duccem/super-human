'use client';
import { Button } from '@/lib/shadcn/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/lib/shadcn/components/dialog';
import { Textarea } from '@/lib/shadcn/components/textarea';
import { generateEmail } from '@/modules/email/presentation/actions/generate-email';
import { useThread } from '@/modules/thread/infrastructure/hooks/use-thread';
import useThreads from '@/modules/thread/infrastructure/hooks/use-threads';
import { readStreamableValue } from 'ai/rsc';
import { Bot } from 'lucide-react';
import { useState } from 'react';
import TurndownService from 'turndown';

type Props = {
  onGenerate: (value: string) => void;
  isComposing?: boolean;
};

const AiComposeButton = (props: Props) => {
  const [prompt, setPrompt] = useState('');
  const [open, setOpen] = useState(false);
  const { account, threads } = useThreads();
  const [threadId] = useThread();
  const thread = threads?.find((t) => t.id === threadId);

  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**',
    bulletListMarker: '-',
    linkStyle: 'inlined',
  });

  // Remove link tags
  turndown.addRule('linkRemover', {
    filter: 'a',
    replacement: (content) => content,
  });

  // Remove style tags
  turndown.addRule('styleRemover', {
    filter: 'style',
    replacement: () => '',
  });

  // Remove script tags
  turndown.addRule('scriptRemover', {
    filter: 'script',
    replacement: () => '',
  });

  turndown.addRule('imageRemover', {
    filter: 'img',
    replacement: (content) => content,
  });
  const aiGenerate = async (prompt: string) => {
    let context: string | undefined = '';
    if (!props.isComposing) {
      context = (thread as any)?.emails
        .map(
          (m: any) =>
            `Subject: ${m.subject}\nFrom: ${m.from.address}\n\n${turndown.turndown(m.body ?? m.bodySnippet ?? '')}`,
        )
        .join('\n');
    }

    const { output } = await generateEmail(context + `\n\nMy name is: ${account?.name}`, prompt);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        props.onGenerate(delta);
      }
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button onClick={() => setOpen(true)} size="icon" variant={'outline'}>
          <Bot className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Compose</DialogTitle>
          <DialogDescription>AI will compose an email based on the context of your previous emails.</DialogDescription>
          <div className="h-2"></div>
          <Textarea
            placeholder="What would you like to compose?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="h-2"></div>
          <Button
            onClick={() => {
              aiGenerate(prompt);
              setOpen(false);
              setPrompt('');
            }}
          >
            Generate
          </Button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AiComposeButton;
