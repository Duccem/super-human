import { Account } from '@/modules/account/domain/account';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { embed } from 'ai';
import { MongoClient } from 'mongodb';
import { ollama } from 'ollama-ai-provider';
import TurndownService from 'turndown';
import { Email } from '../domain/email';
import { EmailDocument, EmailSearcher } from '../domain/email-searcher';

export class MongoDBEmailSearcher implements EmailSearcher {
  saveIndex(): Promise<string | Buffer> {
    throw new Error('Method not implemented.');
  }
  private client?: MongoClient;
  async initialize(_?: Primitives<Account>): Promise<void> {
    try {
      const connection = new MongoClient(process.env.MONGODB_URI!);
      this.client = await connection.connect();
      const embedIndex = {
        name: 'vector_index',
        type: 'vectorSearch',
        definition: {
          fields: [
            {
              type: 'vector',
              path: 'embeddings',
              similarity: 'dotProduct',
              numDimensions: 768,
            },
          ],
        },
      };
      const textIndex = {
        title: 'text',
        body: 'text',
        from: 'text',
        to: 'text',
        rawBody: 'text',
        sentAt: 'text',
      };
      const db = this.client?.db();
      await db.createCollection('emails_embeddings');
      const collection = db?.collection('emails_embeddings');
      const indexes = await collection.listSearchIndexes().toArray();
      const textIndexExists = await collection.indexExists('text_index');
      if (!indexes.some((i) => i.name === 'vector_index')) {
        await collection.createSearchIndex(embedIndex);
      }
      if (!textIndexExists) {
        await collection.createIndex(textIndex as any, { name: 'text_index' });
      }
    } catch (error) {
      console.log('error initializing mongodb', error);
    }
  }
  async search(term: string): Promise<EmailDocument[]> {
    const db = this.client?.db();
    const collection = db?.collection('emails_embeddings');
    const documents = await collection?.find<EmailDocument>({ $text: { $search: term } }).toArray();
    return documents ?? [];
  }
  async vectorSearch(term: { prompt: string; numResults?: number }): Promise<any> {
    try {
      const db = this.client?.db();
      const collection = db?.collection('emails_embeddings');
      const queryEmbedding = await this.getEmbeddings(term.prompt);
      // Define the sample vector search pipeline
      const pipeline = [
        {
          $vectorSearch: {
            index: 'vector_index',
            queryVector: queryEmbedding,
            path: 'embeddings',
            exact: true,
            limit: term.numResults ?? 10,
          },
        },
      ];

      const results = await collection?.aggregate(pipeline).toArray();
      return results;
    } catch (error) {
      console.log('error vector searching mongodb', error);
    }
  }
  async insert(email: Email): Promise<void> {
    const db = this.client?.db();
    const collection = db?.collection('emails_embeddings');
    const existingDoc = await collection?.findOne({ emailId: email.id.value });
    if (!existingDoc) {
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
      const embeddings = await this.getEmbeddings(payload);
      await collection?.insertOne({
        title: email.subject.value || '',
        body: body || '',
        rawBody: email.body.value || '',
        from: email.from?.address.value || '',
        to: email.to?.map((t) => t.address.value || ''),
        sentAt: email.sentAt.value.toISOString() || '',
        embeddings,
        threadId: email.threadId.value || '',
        emailId: email.id.value,
      });
    }
  }

  private async getEmbeddings(payload: string): Promise<number[]> {
    try {
      const response = await embed({
        model: ollama.textEmbeddingModel('nomic-embed-text'),
        value: payload,
      });
      return response.embedding as number[];
    } catch (error) {
      console.log('error calling mistral embeddings api', error);
      throw error;
    }
  }
}
