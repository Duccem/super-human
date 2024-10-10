import { Criteria } from '@/modules/shared/domain/core/Criteria';
import { Email } from './email';

export interface EmailRepository {
  save(email: Email): Promise<void>;
  getByCriteria(criteria: Criteria): Promise<Email[]>;
  searchByCriteria(criteria: Criteria): Promise<Email[]>;
}
