'use server';

import { OpenAIEmailGenerator } from '../../infrastructure/openai-email-generator';

export async function generateEmail(context: string, prompt: string) {
  const useCase = new OpenAIEmailGenerator();
  return useCase.generateEmail(context, prompt);
}
