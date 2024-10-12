'use client';

import { api } from "@/modules/shared/infrastructure/trpc/react";
import { File, Inbox, Send } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { Nav } from "./nav";

type Props = {
  isCollapsed: boolean;
}
const SideBar = ({ isCollapsed }: Props) => {
  const [tab, setTab] = useLocalStorage("ducenhuman-tab", "inbox")
  const [accountId, setAccountId] = useLocalStorage("accountId", "")
  const refetchInterval = 5000;

  const { data } = api.thread.getThreadCount.useQuery({
    accountId,
  } , { refetchInterval, enabled: !!accountId });

  return (
    <Nav 
      isCollapsed={isCollapsed}
      links={[
        {
            title: "Inbox",
            label: data?.inbox?.toString() || "0",
            icon: Inbox,
            variant: tab === "inbox" ? "default" : "ghost",
        },
        {
            title: "Drafts",
            label: data?.drafts?.toString() || "0",
            icon: File,
            variant: tab === "drafts" ? "default" : "ghost",
        },
        {
            title: "Sent",
            label: data?.sent?.toString() || "0",
            icon: Send,
            variant: tab === "sent" ? "default" : "ghost",
        },
    ]}
    />
  );
}

export default SideBar;
