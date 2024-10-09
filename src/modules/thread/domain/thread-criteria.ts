import { Criteria, Operator } from '@/modules/shared/domain/core/Criteria';

export class ThreadCriteria {
  static searchById(threadId: string) {
    return Criteria.fromValues([{ field: 'id', value: threadId, operator: Operator.EQUAL }]);
  }
}
