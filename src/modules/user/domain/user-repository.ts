import { Criteria } from '@/modules/shared/domain/core/Criteria';
import { Uuid } from '@/modules/shared/domain/core/value-objects/Uuid';
import { Nullable } from '@/modules/shared/domain/types/Nullable';
import { User } from './user';

export interface UserRepository {
  save(user: User): Promise<void>;
  me(id: Uuid): Promise<Nullable<User>>;
  search(criteria: Criteria): Promise<User[]>;
}
