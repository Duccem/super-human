import { FormatError } from '@/modules/shared/domain/core/errors/FormatError';
import { searchByExternalIdCriteria } from '../domain/search-by-externalId.criteria';
import { User } from '../domain/user';
import { UserRepository } from '../domain/user-repository';

export class CreateUser {
  constructor(private repository: UserRepository) {}

  async run(
    id: string,
    externalId: string,
    emailAddress: string,
    firstName: string,
    lastName: string,
    imageUrl: string,
  ): Promise<void> {
    const existingUser = await this.repository.search(searchByExternalIdCriteria(externalId));

    if (existingUser.length > 0) {
      throw new FormatError('User already exists');
    }

    const user = User.Create(id, externalId, emailAddress, firstName, lastName, imageUrl);
    await this.repository.save(user);
  }
}
