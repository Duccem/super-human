import { Account } from '@/modules/account/domain/account';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { anthropic } from '@ai-sdk/anthropic';
import { create, insert, search, type AnyOrama } from '@orama/orama';
import { persist, restore } from '@orama/plugin-data-persistence';
import { embed } from 'ai';
import TurndownService from 'turndown';
import { Email } from '../domain/email';
import { EmailSearcher } from '../domain/email-searcher';

export class OramaEmailSearcher implements EmailSearcher {
  private orama?: AnyOrama;
  async initialize(account: Primitives<Account>): Promise<void> {
    if (!account.binaryIndex) {
      this.orama = await restore('json', account.binaryIndex as any);
    } else {
      this.orama = await create({
        schema: {
          title: 'string',
          body: 'string',
          rawBody: 'string',
          from: 'string',
          to: 'string[]',
          sentAt: 'string',
          embeddings: 'vector[1536]',
          threadId: 'string',
        },
      });
    }
  }

  async search(term: string): Promise<Email[]> {
    const results = await search(this.orama!, {
      term,
      limit: 10,
    });
    await this.saveIndex();
    return results.hits.map((result) => Email.fromPrimitives(result.document as unknown as Primitives<Email>));
  }

  async saveIndex() {
    return await persist(this.orama!, 'json');
  }

  async insert(email: Email) {
    const turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
      strongDelimiter: '**',
      bulletListMarker: '-',
      linkStyle: 'inlined',
    });
    const body = turndown.turndown(email.body.value ?? email.bodySnippet.value ?? '');
    const payload = `From: ${email.from?.name} <${email.from?.address}>\nTo: ${email.to?.map((t) => `${t.name} <${t.address}>`).join(', ')}\nSubject: ${email.subject}\nBody: ${body}\n SentAt: ${new Date(email.sentAt.value).toLocaleString()}`;
    const embeddings = await this.getEmbeddings(payload);
    await insert(this.orama!, {
      title: email.subject.value,
      body,
      rawBody: email.body.value,
      from: email.from?.address.value,
      to: email.to?.map((t) => t.address.value),
      sentAt: email.sentAt.value,
      embeddings,
      threadId: email.threadId.value,
    });
  }

  async vectorSearch({ prompt, numResults = 10 }: { prompt: string; numResults?: number }) {
    const embeddings = await this.getEmbeddings(prompt);
    const results = await search(this.orama!, {
      mode: 'hybrid',
      term: prompt,
      vector: {
        value: embeddings,
        property: 'embeddings',
      },
      similarity: 0.8,
      limit: numResults,
    });
    return results.hits.map((result) => Email.fromPrimitives(result.document as unknown as Primitives<Email>));
  }

  async getEmbeddings(text: string) {
    try {
      const response = await embed({
        model: anthropic.textEmbeddingModel('voyage-2'),
        value: text.replace(/\n/g, ' '),
      });
      return response.embedding as number[];
    } catch (error) {
      console.log('error calling openai embeddings api', error);
      throw error;
    }
  }
}
