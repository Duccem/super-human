import { Account } from '@/modules/account/domain/account';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { create, insert, search, type AnyOrama } from '@orama/orama';
import { persist, restore } from '@orama/plugin-data-persistence';
import { embed } from 'ai';
import { ollama } from 'ollama-ai-provider';
import TurndownService from 'turndown';
import { Email } from '../domain/email';
import { EmailDocument, EmailSearcher } from '../domain/email-searcher';

export class OramaEmailSearcher implements EmailSearcher {
  private orama?: AnyOrama;
  async initialize(account: Primitives<Account>): Promise<void> {
    try {
      if (account.binaryIndex) {
        this.orama = await restore('json', account.binaryIndex as any);
      } else {
        this.orama = create({
          schema: {
            title: 'string',
            body: 'string',
            rawBody: 'string',
            from: 'string',
            to: 'string[]',
            sentAt: 'string',
            threadId: 'string',
            embeddings: 'vector[768]',
          },
        });
      }
    } catch (error) {
      console.log('error initializing orama', error);
    }
  }

  async search(term: string): Promise<EmailDocument[]> {
    const results = await search(this.orama!, {
      term,
      limit: 10,
    });
    await this.saveIndex();
    return results.hits.map((result) => result.document as unknown as EmailDocument);
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
    const payload = `From: ${email.from?.name.value} <${email.from?.address.value}>\nTo: ${email.to?.map((t) => `${t.name.value} <${t.address.value}>`).join(', ')}\nSubject: ${email.subject.value}\nBody: ${body}\nSentAt: ${new Date(email.sentAt.value).toLocaleString()}`;
    const bodyEmbedding = await this.getEmbeddings(payload);
    await insert(this.orama!, {
      title: email.subject.value || '',
      body: body || '',
      rawBody: email.body.value || '',
      from: email.from?.address.value || '',
      to: email.to?.map((t) => t.address.value || ''),
      sentAt: email.sentAt.value.toISOString() || '',
      embeddings: bodyEmbedding,
      threadId: email.threadId.value || '',
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
    return results;
  }

  async getEmbeddings(text: string) {
    try {
      const response = await embed({
        model: ollama.textEmbeddingModel('nomic-embed-text'),
        value: text,
      });
      return response.embedding as number[];
    } catch (error) {
      console.log('error calling mistral embeddings api', error);
      throw error;
    }
  }
}
