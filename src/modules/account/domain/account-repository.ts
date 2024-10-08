import { Criteria } from '@/modules/shared/domain/core/Criteria';
import { Account } from './account';

export interface AccountRepository {
  save(account: Account): Promise<void>;
  getByCriteria(criteria: Criteria): Promise<Account | null>;
  searchByCriteria(criteria: Criteria): Promise<Account[]>;
}
