'use client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/lib/shadcn/components/select";
import { cn } from "@/lib/shadcn/utils/utils";
import { getAurinkoAuthUrl } from "@/modules/shared/infrastructure/aurinko/aurinko";
import { api } from "@/modules/shared/infrastructure/trpc/react";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";

type Props = {
  isCollapsed: boolean;
}

const AccountSwitcher = ({ isCollapsed }: Props) => {
  const { data: accounts } = api.account.getMyAccounts.useQuery();
  const [accountId, setAccountId] = useLocalStorage('accountId', '');
  useEffect(() => {
    if (accounts && accounts.length > 0) {
      if (accountId) return
      setAccountId(accounts[0]!.id)
    } else if (accounts && accounts.length === 0) {
      toast('Link an account to continue', {
        action: {
          label: 'Add account',
          onClick: async () => {
            try {
              const url = await getAurinkoAuthUrl('Google')
              window.location.href = url
            } catch (error) {
              toast.error((error as Error).message)
            }
          }
        },
      })
    }
  }, [accounts])

  if (!accounts) return null;
  
  return (
    <Select defaultValue={accountId} onValueChange={(value) => setAccountId(value)} >
      <SelectTrigger className={cn(
        "flex w-full mx-2 flex-1 items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
            isCollapsed &&
            "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden"
      )} aria-label="Select Account">
        <SelectValue placeholder="Select an account">
            <span className={cn({ "hidden": !isCollapsed })}>
              {
                accounts!.find((account) => account.id === accountId)?.emailAddress[0].toLocaleUpperCase()
              }
            </span>
            <span className={cn("ml-2", isCollapsed && "hidden")}>
              {
                accounts!.find((account) => account.id === accountId)
                  ?.emailAddress
              }
            </span>
          </SelectValue>
      </SelectTrigger>
      <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              <div className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
                {account.emailAddress}
              </div>
            </SelectItem>
          ))}
          <div onClick={async (e) => {
            try {
              const url = await getAurinkoAuthUrl('Google')
              window.location.href = url
            } catch (error) {
              toast.error((error as Error).message)
            }
          }} className="relative flex hover:bg-gray-50 w-full cursor-pointer items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
            <Plus className="size-4 mr-1" />
            Add account
          </div>
        </SelectContent>
    </Select>
  );
}

export default AccountSwitcher;
