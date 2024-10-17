'use server';

import { AnthropicEmailGenerator } from '../../infrastructure/ollama-email-generator';

export async function autocompleteEmail(input: string) {
  const useCase = new AnthropicEmailGenerator();
  return useCase.autocompleteEmail(input);
}
