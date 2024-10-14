import { EmailRepository } from '../domain/email-repository';

export class ListEmailsSuggestions {
  constructor(private readonly repository: EmailRepository) {}

  async run(accountId: string) {
    const response = await this.repository.listAddresses(accountId);
    return response.map((address) => address.toPrimitives());
  }
}
