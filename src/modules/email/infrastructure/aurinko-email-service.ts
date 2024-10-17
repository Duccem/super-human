import axios from 'axios';
import { EmailAddress, EmailService, SyncResponse, SyncUpdatedResponse } from '../domain/email-service';

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

    try {
      const response = await axios.get<SyncUpdatedResponse>('https://api.aurinko.io/v1/email/sync/updated', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params,
      });
      return response.data;
    } catch (error) {
      console.log(JSON.stringify(error));
      throw error;
    }
  }

  async sendEmail(
    {
      from,
      subject,
      body,
      inReplyTo,
      references,
      threadId,
      to,
      cc,
      bcc,
      replyTo,
    }: {
      from: EmailAddress;
      subject: string;
      body: string;
      inReplyTo?: string;
      references?: string;
      threadId?: string;
      to: EmailAddress[];
      cc?: EmailAddress[];
      bcc?: EmailAddress[];
      replyTo?: EmailAddress;
    },
    accessToken: string,
  ): Promise<void> {
    const response = await axios.post(
      'https://api.aurinko.io/v1/email/messages',
      {
        from,
        subject,
        body,
        inReplyTo,
        references,
        threadId,
        to,
        cc,
        bcc,
        replyTo: [replyTo],
      },
      {
        params: {
          returnIds: true,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data;
  }

  async createSubscription(accessToken: string): Promise<void> {
    const webhookUrl =
      process.env.NODE_ENV === 'development' ? 'https://tv2v9c60-3000.use2.devtunnels.ms' : process.env.NEXT_PUBLIC_URL;
    const res = await axios.post(
      'https://api.aurinko.io/v1/subscriptions',
      {
        resource: '/email/messages',
        notificationUrl: webhookUrl + '/api/webhooks/aurinko/update',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return res.data;
  }
}
