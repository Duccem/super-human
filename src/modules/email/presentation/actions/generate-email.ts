'use server';

import { AnthropicEmailGenerator } from '../../infrastructure/ollama-email-generator';

export async function generateEmail(context: string, prompt: string) {
  const useCase = new AnthropicEmailGenerator();
  return useCase.generateEmail(context, prompt);
}
