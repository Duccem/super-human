'use server';

import { OllamaEmailGenerator } from '../../infrastructure/ollama-email-generator';

export async function autocompleteEmail(input: string) {
  const useCase = new OllamaEmailGenerator();
  return useCase.autocompleteEmail(input);
}
