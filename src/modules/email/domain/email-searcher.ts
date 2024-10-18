import { Account } from '@/modules/account/domain/account';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { Email } from './email';

export interface EmailSearcher {
  initialize(account: Primitives<Account>): Promise<void>;
  search(term: string): Promise<EmailDocument[]>;
  vectorSearch(term: { prompt: string; numResults?: number }): Promise<any>;
  saveIndex(): Promise<string | Buffer>;
  insert(email: Email): Promise<void>;
}

export interface EmailDocument {
  title: string;
  body: string;
  rawBody: string;
  from: string;
  to: string[];
  sentAt: string;
  threadId: string;
  embeddings: number[];
}
