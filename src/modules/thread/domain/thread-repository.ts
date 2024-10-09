import { Criteria } from '@/modules/shared/domain/core/Criteria';
import { Thread } from './thread';

export interface ThreadRepository {
  save(thread: Thread): Promise<void>;
  searchByCriteria(criteria: Criteria): Promise<Thread[]>;
  getByCriteria(criteria: Criteria): Promise<Thread | null>;
}
