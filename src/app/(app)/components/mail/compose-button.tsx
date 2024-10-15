'use client';
import { Pencil } from 'lucide-react';

import { useEffect, useState } from 'react';
import EmailEditor from './email-editor/email-editor';

import { Button } from '@/lib/shadcn/components/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/lib/shadcn/components/sheet';
import { api } from '@/modules/shared/infrastructure/trpc/react';
import { useLocalStorage } from 'usehooks-ts';

const ComposeButton = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const [open, setOpen] = useState(false);
  const [accountId] = useLocalStorage('accountId', '');
  const [toValues, setToValues] = useState<{ label: string; value: string }[]>([]);
  const [ccValues, setCcValues] = useState<{ label: string; value: string }[]>([]);
  const [subject, setSubject] = useState<string>('');
  const { data: account } = api.account.getMyAccount.useQuery({ accountId });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'c' &&
        (event.ctrlKey || event.metaKey) &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '')
      ) {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  //const sendEmail = api.mail.sendEmail.useMutation()

  const handleSend = async (value: string) => {
    console.log(account);
    console.log({ value });
    if (!account) return;
    // sendEmail.mutate({
    //     accountId,
    //     threadId: undefined,
    //     body: value,
    //     subject,
    //     from: { name: account?.name ?? 'Me', address: account?.emailAddress ?? 'me@example.com' },
    //     to: toValues.map(to => ({ name: to.value, address: to.value })),
    //     cc: ccValues.map(cc => ({ name: cc.value, address: cc.value })),
    //     replyTo: { name: account?.name ?? 'Me', address: account?.emailAddress ?? 'me@example.com' },
    //     inReplyTo: undefined,
    // }, {
    //     onSuccess: () => {
    //         toast.success("Email sent")
    //         setOpen(false)
    //     },
    //     onError: (error) => {
    //         console.log(error)
    //         toast.error(error.message)
    //     }
    // })
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className='flex justify-center items-center gap-2'>
          <Pencil className="size-4" />
          { !isCollapsed ? 'Compose' : null}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[40%] sm:max-w-full">
        <SheetHeader>
          <SheetTitle>Compose Email</SheetTitle>
          <EmailEditor
            toValues={toValues}
            ccValues={ccValues}
            onToChange={(values) => {
              setToValues(values);
            }}
            onCcChange={(values) => {
              setCcValues(values);
            }}
            subject={subject}
            setSubject={setSubject}
            to={toValues.map((to) => to.value)}
            handleSend={handleSend}
            isSending={false}
            defaultToolbarExpand
          />
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default ComposeButton;
