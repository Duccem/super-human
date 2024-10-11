import { syncAccountController } from '@/modules/account/presentation/controllers/sync-account-controller';

export const GET = syncAccountController;

// export async function GET(req: NextRequest) {
//   try {
//     const { userId } = auth();
//     const params = req.nextUrl.searchParams;

//     if (!userId) {
//       return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
//     }

//     const code = params.get('code');
//     const status = params.get('status');

//     if (status !== 'success') return NextResponse.json({ error: 'Failed to link account' }, { status: 500 });
//     if (!code) return NextResponse.json({ error: 'Code not provided' }, { status: 400 });

//     const tokenInfo = await exchangeForAccessToken(code);
//     const accountDetails = await getAccountDetails(tokenInfo.accessToken);

//     await db.account.upsert({
//       where: { id: tokenInfo.accountId.toString() },
//       create: {
//         id: tokenInfo.accountId.toString(),
//         userId: userId,
//         emailAddress: accountDetails.email,
//         name: accountDetails.name,
//         accessToken: tokenInfo.accessToken,
//       },
//       update: {
//         accessToken: tokenInfo.accessToken,
//       },
//     });
//     await qstashClient.publishJSON({
//       url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/aurinko/init-sync`,
//       body: {
//         accountId: tokenInfo.accountId.toString(),
//         userId,
//       },
//     });
//     return NextResponse.redirect(new URL('/mail', req.url));
//   } catch (error) {
//     return NextResponse.json({ error: 'Error occurred' }, { status: 500 });
//   }
// }
