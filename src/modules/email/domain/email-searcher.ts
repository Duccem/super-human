import { Account } from '@/modules/account/domain/account';
import { Email } from './email';
import { Primitives } from '@/modules/shared/domain/types/Primitives';

export interface EmailSearcher {
  initialize(account: Primitives<Account>): Promise<void>;
  search(term: string): Promise<Email[]>;
  vectorSearch(term: { prompt: string; numResults?: number }): Promise<Email[]>;
  saveIndex(): Promise<string | Buffer>;
  insert(email: Email): Promise<void>;
}
