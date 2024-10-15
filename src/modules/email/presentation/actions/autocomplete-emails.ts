'use server';

import { AnthropicEmailGenerator } from '../../infrastructure/openai-email-generator';

export async function autocompleteEmail(input: string) {
  const useCase = new AnthropicEmailGenerator();
  return useCase.autocompleteEmail(input);
}
