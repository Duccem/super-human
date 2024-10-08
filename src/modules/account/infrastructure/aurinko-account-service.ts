import axios from 'axios';
import { AccountService } from '../domain/account-service';

export class AurinkoAccountService implements AccountService {
  async getAccountDetails(accessToken: string): Promise<{ email: string; name: string }> {
    const response = await axios.get('https://api.aurinko.io/v1/account', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  }

  async exchangeForAccessToken(
    code: string,
  ): Promise<{ accountId: string; accessToken: string; userId: string; userSession: string }> {
    const response = await axios.post(
      `https://api.aurinko.io/v1/auth/token/${code}`,
      {},
      {
        auth: {
          username: process.env.AURINKO_CLIENT_ID!,
          password: process.env.AURINKO_CLIENT_SECRET!,
        },
      },
    );
    return response.data;
  }
}
