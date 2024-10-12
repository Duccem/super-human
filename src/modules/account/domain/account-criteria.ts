import { Criteria, Operator } from '@/modules/shared/domain/core/Criteria';

export class AccountCriteria {
  static byAccountIdCriteria(accountId: string): Criteria {
    return Criteria.fromValues([{ field: 'id', value: accountId.toString(), operator: Operator.EQUAL }]);
  }
}
