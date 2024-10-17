'use server';

import { OllamaEmailGenerator } from '../../infrastructure/ollama-email-generator';

export async function generateEmail(context: string, prompt: string) {
  const useCase = new OllamaEmailGenerator();
  return useCase.generateEmail(context, prompt);
}
