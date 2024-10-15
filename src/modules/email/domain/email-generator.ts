import { StreamableValue } from 'ai/rsc';

export interface EmailGenerator {
  generateEmail(
    context: string,
    prompt: string,
  ): Promise<{
    output: StreamableValue<string, any>;
  }>;
  autocompleteEmail(email: string): Promise<{
    output: StreamableValue<string, any>;
  }>;
}
