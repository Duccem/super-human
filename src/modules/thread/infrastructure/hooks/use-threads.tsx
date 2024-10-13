import { api } from '@/modules/shared/infrastructure/trpc/react'
import { getQueryKey } from '@trpc/react-query'
import { useLocalStorage } from 'usehooks-ts'

const useThreads = () => {
    const { data: accounts } = api.account.getMyAccounts.useQuery()
    const [accountId] = useLocalStorage('accountId', '')
    const [folder] = useLocalStorage('ducenhuman-tab', 'inbox')
    const [done] = useLocalStorage('ducenhuman-done', false)
    const queryKey = getQueryKey(api.thread.listThreads, { accountId, folder, done }, 'query')
    const { data: threads, isFetching, refetch } = api.thread.listThreads.useQuery({
        accountId,
        done,
        folder
    }, { enabled: !!accountId && !!folder, placeholderData: (e) => e, refetchInterval: 1000 * 5 })

    return {
        threads,
        isFetching,
        account: accounts?.find((account) => account.id === accountId),
        refetch,
        accounts,
        queryKey,
        accountId
    }
}

export default useThreads