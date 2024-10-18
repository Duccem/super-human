import { Account } from '@/modules/account/domain/account';
import { Primitives } from '@/modules/shared/domain/types/Primitives';

export interface ChatResultService {
  getResponse(message: string, account: Primitives<Account>, onFinish: (...args: any[]) => void): Promise<any>;
}
