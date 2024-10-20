import { Criteria } from '@/modules/shared/domain/core/Criteria';
import { Thread } from './thread';

export interface ThreadRepository {
  save(thread: Thread): Promise<void>;
  toggleDone(value: boolean, threadId?: string, threadIds?: string[]): Promise<void>;
  searchByCriteria(criteria: Criteria): Promise<Thread[]>;
  searchByCriteriaWithEmails(criteria: Criteria): Promise<Thread[]>;
  getByCriteria(criteria: Criteria): Promise<Thread | null>;
  getByCriteriaWithEmails(id: string): Promise<Thread | null>;
  count(accountId: string, folder: string): Promise<number>;
}
