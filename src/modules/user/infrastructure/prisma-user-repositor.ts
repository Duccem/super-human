import { Criteria } from '@/modules/shared/domain/core/Criteria';
import { Uuid } from '@/modules/shared/domain/core/value-objects/Uuid';
import { Nullable } from '@/modules/shared/domain/types/Nullable';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { PrismaCriteriaConverter } from '@/modules/shared/infrastructure/prisma/PrismaCriteriaConverter';
import { PrismaClient } from '@prisma/client';
import { User } from '../domain/user';
import { UserRepository } from '../domain/user-repository';

export class PrismaUserRepository implements UserRepository {
  private converter = new PrismaCriteriaConverter();
  constructor(private prisma: PrismaClient) {}
  get model() {
    return this.prisma.user;
  }
  async save(user: User): Promise<void> {
    await this.model.upsert({
      where: { id: user.id.value },
      update: user.toPrimitives(),
      create: user.toPrimitives(),
    });
  }
  async me(id: Uuid): Promise<Nullable<User>> {
    const user = await this.model.findUnique({ where: { id: id.value } });
    return user ? User.fromPrimitives(user as Primitives<User>) : null;
  }
  async search(criteria: Criteria): Promise<User[]> {
    const { orderBy, where, skip, take } = this.converter.criteria(criteria);
    const results = await this.model.findMany({
      where,
      orderBy,
      skip,
      take,
    });

    return results.map((user) => User.fromPrimitives(user as Primitives<User>));
  }
}
