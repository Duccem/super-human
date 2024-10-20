import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/lib/shadcn/components/avatar';
import { Button } from '@/lib/shadcn/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/lib/shadcn/components/dropdown-menu';
import { Separator } from '@/lib/shadcn/components/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/lib/shadcn/components/tooltip';
import { useThread } from '@/modules/thread/infrastructure/hooks/use-thread';
import useThreads from '@/modules/thread/infrastructure/hooks/use-threads';
import { addDays, addHours, format, nextSaturday } from 'date-fns';
import { Archive, ArchiveX, Calendar, Clock, MoreVertical, Trash2, X } from 'lucide-react';
import EmailDisplay from '../mail/email-display';
import ReplyBox from '../mail/reply-box';
import SearchDisplay from '../mail/search-display';
import { useSearchStore } from '../mail/search-value';

const ThreadDisplay = () => {
  const [threadId, setThreadId] = useThread();
  const { threads, isFetching } = useThreads();
  const { isSearching, searchValue } = useSearchStore();
  const today = new Date();
  const thread = threads?.find((t) => t.id === threadId);
  return (
    <div className="flex flex-col h-full overflow-scroll no-scroll">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!thread}>
                <Archive className="w-4 h-4" />
                <span className="sr-only">Archive</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!thread}>
                <ArchiveX className="w-4 h-4" />
                <span className="sr-only">Move to junk</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to junk</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!thread}>
                <Trash2 className="w-4 h-4" />
                <span className="sr-only">Move to trash</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to trash</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="ml-2" color="#000" />
          <Tooltip>
            <Popover>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!thread}>
                    <Clock className="w-4 h-4" />
                    <span className="sr-only">Snooze</span>
                  </Button>
                </TooltipTrigger>
              </PopoverTrigger>
              <PopoverContent className="flex w-[535px] p-0">
                <div className="flex flex-col gap-2 px-2 py-4 border-r">
                  <div className="px-4 text-sm font-medium">Snooze until</div>
                  <div className="grid min-w-[250px] gap-1">
                    <Button variant="ghost" className="justify-start font-normal">
                      Later today{' '}
                      <span className="ml-auto text-muted-foreground">{format(addHours(today, 4), 'E, h:m b')}</span>
                    </Button>
                    <Button variant="ghost" className="justify-start font-normal">
                      Tomorrow
                      <span className="ml-auto text-muted-foreground">{format(addDays(today, 1), 'E, h:m b')}</span>
                    </Button>
                    <Button variant="ghost" className="justify-start font-normal">
                      This weekend
                      <span className="ml-auto text-muted-foreground">{format(nextSaturday(today), 'E, h:m b')}</span>
                    </Button>
                    <Button variant="ghost" className="justify-start font-normal">
                      Next week
                      <span className="ml-auto text-muted-foreground">{format(addDays(today, 7), 'E, h:m b')}</span>
                    </Button>
                  </div>
                </div>
                <div className="p-2">
                  <Calendar />
                </div>
              </PopoverContent>
            </Popover>
            <TooltipContent>Snooze</TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {threadId && (
            <Button variant={'ghost'} size={'icon'} disabled={!threadId} onClick={() => setThreadId('')}>
              <X className="size-4" />
            </Button>
          )}
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
      {isSearching ? (
        <>
          <SearchDisplay />
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default ThreadDisplay;
