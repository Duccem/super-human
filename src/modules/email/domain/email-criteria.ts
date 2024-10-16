import { Criteria, Direction, Operator } from '@/modules/shared/domain/core/Criteria';

export class EmailCriteria {
  static inIds(ids: string[]) {
    return Criteria.fromValues(
      [
        {
          field: 'id',
          operator: Operator.IN,
          value: ids,
        },
      ],
      {
        field: 'createdAt',
        order: Direction.ASC,
      },
      {
        limit: ids.length,
        offset: 0,
      },
    );
  }
}
