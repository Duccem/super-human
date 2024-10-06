import { db } from '@/modules/shared/infrastructure/prisma/db';
import { WebhookEvent } from '@clerk/nextjs/server';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';

export async function POST(req: NextRequest) {
  const headersPayload = headers();
  const bodyPayload = await req.text();
  const evt = await verifyWebhook(headersPayload, bodyPayload);

  if (evt.type !== 'user.created') {
    return new NextResponse('Error occurred', { status: 500 });
  }

  const data = evt.data;

  const user = {
    emailAddress: data.email_addresses[0].email_address || '',
    firstName: data.first_name || '',
    lastName: data.last_name || '',
    imageUrl: data.image_url,
    externalId: data.id,
  };
  await db.user.create({ data: user });
  return NextResponse.json({ message: 'ok' }, { status: 200 });
}

const verifyWebhook = async (headerPayload: ReadonlyHeaders, payload: any) => {
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    throw new Error('Error -- no svix headers');
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    throw new Error('Error occurred');
  }
  return evt;
};
