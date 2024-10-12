import { Criteria, Operator } from '@/modules/shared/domain/core/Criteria';

export class AccountCriteria {
  static byAccountIdCriteria(accountId: string): Criteria {
    return Criteria.fromValues([{ field: 'id', value: accountId.toString(), operator: Operator.EQUAL }]);
  }

  static byUserIdCriteria(userId: string): Criteria {
    return Criteria.fromValues([{ field: 'userId', value: userId.toString(), operator: Operator.EQUAL }]);
  }

  static byOwnershipCriteria(accountId: string, userId: string): Criteria {
    return Criteria.fromValues([
      { field: 'id', value: accountId.toString(), operator: Operator.EQUAL },
      { field: 'userId', value: userId.toString(), operator: Operator.EQUAL },
    ]);
  }
}
