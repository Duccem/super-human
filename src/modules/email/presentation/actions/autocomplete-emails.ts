'use server';

import { OpenAIEmailGenerator } from '../../infrastructure/openai-email-generator';

export async function autocompleteEmail(input: string) {
  const useCase = new OpenAIEmailGenerator();
  return useCase.autocompleteEmail(input);
}
