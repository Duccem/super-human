import { Criteria, Operator } from '@/modules/shared/domain/core/Criteria';

export const searchByIdCriteria = (id: string) => {
  return Criteria.fromValues([{ field: 'id', value: id, operator: Operator.EQUAL }]);
};
