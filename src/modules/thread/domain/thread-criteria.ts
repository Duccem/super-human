import { Criteria, Direction, Operator } from '@/modules/shared/domain/core/Criteria';

export class ThreadCriteria {
  static searchById(threadId: string) {
    return Criteria.fromValues([{ field: 'id', value: threadId.toString(), operator: Operator.EQUAL }]);
  }

  static searchByFolder(accountId: string, folder: string, done: boolean) {
    let folderFilter = {};
    if (folder === 'inbox') {
      folderFilter = { inboxStatus: true };
    } else if (folder === 'sent') {
      folderFilter = { sentStatus: true };
    } else if (folder === 'drafts') {
      folderFilter = { draftStatus: true };
    }
    return Criteria.fromValues(
      [
        { field: 'accountId', value: accountId.toString(), operator: Operator.EQUAL },
        { field: 'done', value: done, operator: Operator.EQUAL },
        ...Object.entries(folderFilter).map(([field, value]) => ({ field, value, operator: Operator.EQUAL })),
      ],
      { field: 'lastMessageDate', order: Direction.DESC },
      { limit: 50 },
    );
  }
}
