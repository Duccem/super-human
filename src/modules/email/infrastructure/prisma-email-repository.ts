import { Criteria } from '@/modules/shared/domain/core/Criteria';
import { Email } from '../domain/email';
import { EmailRepository } from '../domain/email-repository';

export class PrismaEmailRepository implements EmailRepository {
  save(email: Email): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getByCriteria(criteria: Criteria): Promise<Email[]> {
    throw new Error('Method not implemented.');
  }
  searchByCriteria(criteria: Criteria): Promise<Email[]> {
    throw new Error('Method not implemented.');
  }
}
