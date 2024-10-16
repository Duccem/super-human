'use client';

import { Button } from '@/lib/shadcn/components/button';
import { Input } from '@/lib/shadcn/components/input';
import { Separator } from '@/lib/shadcn/components/separator';
import { cn } from '@/lib/shadcn/utils/utils';
import { autocompleteEmail } from '@/modules/email/presentation/actions/autocomplete-emails';
import { api } from '@/modules/shared/infrastructure/trpc/react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import Text from '@tiptap/extension-text';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { readStreamableValue } from 'ai/rsc';
import { useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import AiComposeButton from './ai-compose-button';
import MenuBar from './menu-bar';
import TagInput from './tag-input';

type EmailEditorProps = {
  toValues: { label: string; value: string }[];
  ccValues: { label: string; value: string }[];

  subject: string;
  setSubject: (subject: string) => void;
  to: string[];
  handleSend: (value: string) => void;
  isSending: boolean;

  onToChange: (values: { label: string; value: string }[]) => void;
  onCcChange: (values: { label: string; value: string }[]) => void;

  defaultToolbarExpand?: boolean;
  isComposing?: boolean;
};

const EmailEditor = ({
  toValues,
  ccValues,
  subject,
  setSubject,
  to,
  handleSend,
  isSending,
  onToChange,
  onCcChange,
  defaultToolbarExpand,
  isComposing,
}: EmailEditorProps) => {
  const [value, setValue] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [accountId] = useLocalStorage('accountId', '');
  const [generation, setGeneration] = useState('');
  const [ref] = useAutoAnimate();
  const { data: suggestions } = api.email.listSuggestions.useQuery(
    { accountId: accountId, query: '' },
    { enabled: !!accountId },
  );
  const CustomText = Text.extend({
    addKeyboardShortcuts() {
      return {
        'Shift-Alt-g': () => {
          console.log('Generating email');
          aiGenerate(this.editor.getText());
          return true;
        },
      };
    },
  });
  const editor = useEditor({
    autofocus: false,
    extensions: [StarterKit, CustomText],
    onUpdate: ({ editor }) => {
      setValue(editor.getHTML());
    },
  });

  const aiGenerate = async (prompt: string) => {
    const { output } = await autocompleteEmail(prompt);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        console.log(delta);
        setGeneration(delta);
      }
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'Enter' &&
        editor &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '')
      ) {
        editor.commands.focus();
      }
      if (event.key === 'Escape' && editor) {
        editor.commands.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor]);

  useEffect(() => {
    if (!generation || !editor) return;
    editor.commands.insertContent(generation);
  }, [generation, editor]);

  if (!editor) return null;
  return (
    <div
      className={cn({
        'flex flex-col h-full justify-between': isComposing,
      })}
    >
      <div className='h-full'>
        <div className="flex p-4 py-2 border-y">
          <MenuBar editor={editor} />
        </div>
        <div ref={ref} className="p-4 pb-0 space-y-2">
          {expanded && (
            <>
              <TagInput
                suggestions={suggestions?.map((s) => s.address!) || []}
                value={toValues}
                placeholder="Add tags"
                label="To"
                onChange={onToChange}
              />
              <TagInput
                suggestions={suggestions?.map((s) => s.address) || []}
                value={ccValues}
                placeholder="Add tags"
                label="Cc"
                onChange={onCcChange}
              />
              <Input
                id="subject"
                className="w-full"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </>
          )}
          <div className="flex items-center gap-2">
            <div className="cursor-pointer" onClick={() => setExpanded((e) => !e)}>
              <span className="text-green-600 font-medium">Draft </span>
              <span>to {to.join(', ')}</span>
            </div>
            <AiComposeButton isComposing={defaultToolbarExpand} onGenerate={setGeneration} />
          </div>
        </div>
        <div
          className={cn('prose w-full px-4 mb-2 py-3 overflow-y-scroll scroll-hidden', {
            'h-full max-h-[500px]': isComposing,
            'max-h-[150px]': !isComposing,
          })}
        >
          <EditorContent editor={editor} value={value} placeholder="Write your email here..." style={{
            minWidth: '100%',
            minHeight: '100%',
          }}/>
        </div>
        <Separator />
      </div>
      <div className="py-3 px-4 flex items-center justify-between ">
        <span className="text-sm">
          Tip: Press{' '}
          <kbd className="px-2 py-1.6 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
            Cmd + j
          </kbd>{' '}
          for AI autocomplete
        </span>
        <Button
          onClick={async () => {
            editor?.commands.clearContent();
            await handleSend(value);
          }}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default EmailEditor;
