import { Criteria, Operator } from '@/modules/shared/domain/core/Criteria';

export const searchByExternalIdCriteria = (externalId: string) => {
  return Criteria.fromValues([{ field: 'externalId', value: externalId, operator: Operator.EQUAL }]);
};
