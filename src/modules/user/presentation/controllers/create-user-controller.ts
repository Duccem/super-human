import { Uuid } from '@/modules/shared/domain/core/value-objects/Uuid';
import { db } from '@/modules/shared/infrastructure/prisma/PrismaConnection';
import { WebhookEvent } from '@clerk/nextjs/server';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { CreateUser } from '../../application/create-user';
import { PrismaUserRepository } from '../../infrastructure/prisma-user-repositor';

export async function CreateUserController(req: NextRequest) {
  try {
    const headersPayload = headers();
    const bodyPayload = await req.text();
    const evt = await verifyWebhook(headersPayload, bodyPayload);

    if (evt.type !== 'user.created') {
      return new NextResponse('Error occurred', { status: 500 });
    }

    const data = evt.data;
    const createUser = new CreateUser(new PrismaUserRepository(db));
    await createUser.run(
      Uuid.random().value,
      data.id,
      data.email_addresses[0].email_address || '',
      data.first_name || '',
      data.last_name || '',
      data.image_url,
    );
    return NextResponse.json({ message: 'ok' }, { status: 200 });
  } catch (error) {
    console.log('Error creating user:', error);
    return new NextResponse('Error occurred', { status: 500 });
  }
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
