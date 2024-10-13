'use client';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/lib/shadcn/components/resizable';
import { Separator } from '@/lib/shadcn/components/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/lib/shadcn/components/tabs';
import { TooltipProvider } from '@/lib/shadcn/components/tooltip';
import { cn } from '@/lib/shadcn/utils/utils';
import { useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import AccountSwitcher from '../account/account-switcher';
import ThreadDisplay from '../thread/thread-display';
import ThreadList from '../thread/thread-list';
import SideBar from './side-bar';

type MailProps = {
  defaultLayout: number[] | undefined;
  navCollapsedSize: number;
  defaultCollapsed?: boolean;
};

const Mail = ({ defaultLayout = [20, 32, 48], navCollapsedSize, defaultCollapsed = false }: MailProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [done, setDone] = useLocalStorage('ducenhuman-done', false)
  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        className="items-stretch h-full min-h-screen"
        direction="horizontal"
        onLayout={(sizes: number[]) => {}}
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={40}
          onCollapse={() => setIsCollapsed(true)}
          onResize={() => setIsCollapsed(false)}
          className={cn(isCollapsed && 'min-w-[50px] transition-all duration-300 ease-in-out')}
        >
          <div className="flex flex-col h-full flex-1">
            <div className={cn('flex h-[52px] items-center justify-between', isCollapsed ? 'h-[52px]' : 'px-3')}>
              <AccountSwitcher isCollapsed={isCollapsed} />
            </div>
            <Separator />
            <SideBar isCollapsed={isCollapsed} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="inbox" value={done ? 'done' : 'inbox'} onValueChange={tab => {
            if (tab === 'done') {
              setDone(true)
            } else {
              setDone(false)
            }
          }}>
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger value="inbox" className="text-zinc-600 dar:text-zinc-200">
                  Inbox
                </TabsTrigger>
                <TabsTrigger value="done" className="text-zinc-600 dar:text-zinc-200">
                  Done
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <TabsContent value="inbox">
              <ThreadList />
            </TabsContent>
            <TabsContent value="done">
              <ThreadList />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          <ThreadDisplay />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
};

export default Mail;
