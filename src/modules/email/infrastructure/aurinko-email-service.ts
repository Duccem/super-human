import axios from 'axios';
import { EmailService, SyncResponse, SyncUpdatedResponse } from '../domain/email-service';

export class AurinkoEmailService implements EmailService {
  async startSync(accessToken: string): Promise<SyncResponse> {
    const res = await axios.post<SyncResponse>(
      'https://api.aurinko.io/v1/email/sync',
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          daysWithin: 2,
          bodyType: 'html',
        },
      },
    );
    return res.data;
  }

  async getUpdatedEmails(
    { deltaToken, pageToken }: { deltaToken?: string; pageToken?: string },
    accessToken: string,
  ): Promise<SyncUpdatedResponse> {
    let params: Record<string, string> = {};
    if (deltaToken) params.deltaToken = deltaToken;
    if (pageToken) params.pageToken = pageToken;

    const response = await axios.post<SyncUpdatedResponse>(
      'https://api.aurinko.io/v1/email/sync/updated',
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params,
      },
    );
    return response.data;
  }
}
