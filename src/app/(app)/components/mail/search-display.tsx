'use client';
import { EmailDocument } from '@/modules/email/domain/email-searcher';
import { api } from '@/modules/shared/infrastructure/trpc/react';
import { useThread } from '@/modules/thread/infrastructure/hooks/use-thread';
import DOMPurify from 'dompurify';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useDebounceValue, useLocalStorage } from 'usehooks-ts';
import { useSearchStore } from './search-value';

const SearchDisplay = () => {
  const { searchValue,  setIsSearching } = useSearchStore();
  const [_, setThreadId] = useThread()
  const search = api.email.search.useMutation();
  

  const [debouncedSearch] = useDebounceValue(searchValue, 500, { leading: true });
  const [accountId] = useLocalStorage('accountId', '');


  useEffect(() => {
    if (!debouncedSearch || !accountId) return;
    search.mutate({ accountId, query: debouncedSearch });
  }, [debouncedSearch, accountId]);

  return (
    <div className="p-4 max-h-[calc(100vh-50px)] overflow-y-scroll">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-gray-600 text-sm dark:text-gray-400">Your search for "{searchValue}" came back with...</h2>
        {search.isPending && <Loader2 className="size-4 animate-spin text-gray-400" />}
      </div>
      {search.data?.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {search.data?.map((hit: EmailDocument, index: number) => (
            <li
              onClick={() => {
                if (!hit.threadId) {
                  toast.error('This message is not part of a thread');
                  return;
                }
                setIsSearching(false);
                setThreadId(hit.threadId);
              }}
              key={hit.threadId + index}
              className="border rounded-md p-4 hover:bg-gray-100 cursor-pointer transition-all dark:hover:bg-gray-900"
            >
              <h3 className="text-base font-medium">{hit.title}</h3>
              <p className="text-sm text-gray-500">From: {hit.from}</p>
              <p className="text-sm text-gray-500">To: {hit.to.join(', ')}</p>
              <p
                className="text-sm mt-2"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(hit.rawBody, { USE_PROFILES: { html: true } }),
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchDisplay;
