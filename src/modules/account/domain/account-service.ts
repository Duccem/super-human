export interface AccountService {
  exchangeForAccessToken(code: string): Promise<{
    accountId: string;
    accessToken: string;
    userId: string;
    userSession: string;
  }>;

  getAccountDetails(accessToken: string): Promise<{
    email: string;
    name: string;
  }>;
}
