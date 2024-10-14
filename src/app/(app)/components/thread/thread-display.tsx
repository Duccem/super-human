import { Avatar, AvatarFallback, AvatarImage } from '@/lib/shadcn/components/avatar';
import { Button } from '@/lib/shadcn/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/lib/shadcn/components/dropdown-menu';
import { Separator } from '@/lib/shadcn/components/separator';
import { useThread } from '@/modules/thread/infrastructure/hooks/use-thread';
import useThreads from '@/modules/thread/infrastructure/hooks/use-threads';
import { format } from 'date-fns';
import { Archive, ArchiveX, Clock, MoreVertical, Trash } from 'lucide-react';
import EmailDisplay from '../mail/email-display';
import ReplyBox from '../mail/reply-box';

const ThreadDisplay = () => {
  const [threadId, setThreadId] = useThread();
  const { threads, isFetching } = useThreads();
  const today = new Date();
  const thread = threads?.find((t) => t.id === threadId);
  return (
    <div className="flex flex-col h-full overflow-scroll no-scroll">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Button variant={'ghost'} size={'icon'} disabled={!threadId}>
            <Archive className="size-4" />
          </Button>
          <Button variant={'ghost'} size={'icon'} disabled={!threadId}>
            <ArchiveX className="size-4" />
          </Button>
          <Button variant={'ghost'} size={'icon'} disabled={!threadId}>
            <Trash className="size-4" />
          </Button>
          <Separator orientation="vertical" className="ml-2" color="#000" />
          <Button variant={'ghost'} size={'icon'} disabled={!threadId}>
            <Clock className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={'ghost'} size={'icon'} disabled={!threadId}>
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Mark as unread</DropdownMenuItem>
              <DropdownMenuItem>Star thread</DropdownMenuItem>
              <DropdownMenuItem>Add label</DropdownMenuItem>
              <DropdownMenuItem>Mute thread</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Separator />
      {thread ? (
        <div className="flex flex-col flex-1 overflow-scroll no-scroll relative">
          <div className="flex items-center p-4">
            <div className="flex items-center p-4 text-sm w-2/3">
              <Avatar>
                <AvatarImage alt="avatar" />
                <AvatarFallback>
                  {(thread as any)?.emails[0]?.from?.name
                    ?.split(' ')
                    .map((chunk: string) => chunk[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1 ml-2">
                <div className="font-semibold">{thread.subject}</div>
                <div className="text-xs line-clamp-1 text-foreground">
                  <span className="font-medium">Reply to: </span>
                  {(thread as any).emails[0].from.name}
                </div>
              </div>
            </div>
            {(thread as any).emails[0].sentAt && (
              <div className="ml-auto text-xs text-muted-foreground">
                {format(new Date((thread as any).emails[0].sentAt), 'PPpp')}
              </div>
            )}
          </div>
          <Separator />
          <div className="max-h-[calc(100vh-300px)] pb-[100px] overflow-scroll flex flex-col no-scroll">
            <div className="p-6 flex flex-col gap-4">
              {(thread as any).emails.map((email: any, index: number) => (
                <EmailDisplay email={email} key={email.id}></EmailDisplay>
              ))}
            </div>
          </div>
          <div className="flex-1"></div>
          <div className="absolute bottom-0 w-full bg-background">
            <ReplyBox />
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">No message selected</div>
      )}
    </div>
  );
};

export default ThreadDisplay;
