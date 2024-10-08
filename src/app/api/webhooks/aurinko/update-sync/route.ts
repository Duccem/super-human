import {
  EmailAddress,
  EmailAttachment,
  EmailMessage,
  SyncUpdatedResponse,
} from '@/modules/shared/infrastructure/aurinko/types';
import qStashClient from '@/modules/shared/infrastructure/events/QStashClient';
import { db } from '@/modules/shared/infrastructure/prisma/PrismaConnection';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export const POST = verifySignatureAppRouter(async (req: NextRequest) => {
  try {
    const { syncUpdatedToken, nextPageToken, accessToken, accountId } = await req.json();

    let storedDeltaToken = syncUpdatedToken;

    let updatedResponse = await getUpdatedEmails(
      { deltaToken: storedDeltaToken, pageToken: nextPageToken },
      accessToken,
    );

    if (updatedResponse.nextDeltaToken) {
      storedDeltaToken = updatedResponse.nextDeltaToken;
    }

    const emails = updatedResponse.records;

    await db.account.update({ where: { id: accountId }, data: { nextDeltaToken: storedDeltaToken } });
    await syncEmailsToDatabase(emails, accountId);

    if (updatedResponse.nextPageToken) {
      await qStashClient.publishJSON({
        url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/aurinko/update-sync`,
        body: {
          syncUpdatedToken: storedDeltaToken,
          nextPageToken: updatedResponse.nextPageToken,
          accessToken,
          accountId,
        },
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Error occurred' }, { status: 500 });
  }
});

const getUpdatedEmails = async (
  { deltaToken, pageToken }: { deltaToken?: string; pageToken?: string },
  accessToken: string,
): Promise<SyncUpdatedResponse> => {
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
};

const syncEmailsToDatabase = async (emails: EmailMessage[], accountId: string) => {
  try {
    for (const [index, email] of emails.entries()) {
      await saveEmail(email, accountId, index);
    }
  } catch (error) {
    console.log('Error syncing emails to database', error);
  }
};

const saveEmail = async (email: EmailMessage, accountId: string, index: number) => {
  let emailLabelType: 'inbox' | 'sent' | 'draft' = 'inbox';
  if (email.sysLabels.includes('inbox') || email.sysLabels.includes('important')) {
    emailLabelType = 'inbox';
  } else if (email.sysLabels.includes('sent')) {
    emailLabelType = 'sent';
  } else if (email.sysLabels.includes('draft')) {
    emailLabelType = 'draft';
  }
  const addressesToUpsert = new Map();
  for (const address of [email.from, ...email.to, ...email.cc, ...email.bcc, ...email.replyTo]) {
    addressesToUpsert.set(address.address, address);
  }
  const upsertedAddresses = [];
  try {
    for (const address of addressesToUpsert.values()) {
      const upsertedAddress = await upsertAddress(address, accountId);
      upsertedAddresses.push(upsertedAddress);
    }

    const addressMap = new Map(upsertedAddresses.filter(Boolean).map((address) => [address!.address, address]));
    const fromAddress = addressMap.get(email.from.address);

    if (!fromAddress) {
      console.log('From address not found');
      return;
    }

    const toAddresses = email.to.map((address) => addressMap.get(address.address)).filter(Boolean);
    const ccAddresses = email.cc.map((address) => addressMap.get(address.address)).filter(Boolean);
    const bccAddresses = email.bcc.map((address) => addressMap.get(address.address)).filter(Boolean);
    const replyToAddresses = email.replyTo.map((address) => addressMap.get(address.address)).filter(Boolean);

    const thread = await db.thread.upsert({
      where: { id: email.threadId },
      update: {
        subject: email.subject,
        accountId,
        lastMessageDate: new Date(email.sentAt),
        done: false,
        participantIds: [
          ...new Set([
            fromAddress!.id,
            ...toAddresses.map((address) => address!.id),
            ...ccAddresses.map((address) => address!.id),
            ...bccAddresses.map((address) => address!.id),
          ]),
        ],
      },
      create: {
        id: email.threadId,
        accountId,
        subject: email.subject,
        done: false,
        draftStatus: emailLabelType === 'draft',
        inboxStatus: emailLabelType === 'inbox',
        sentStatus: emailLabelType === 'sent',
        lastMessageDate: new Date(email.sentAt),
        participantIds: [
          ...new Set([
            fromAddress.id,
            ...toAddresses.map((a) => a!.id),
            ...ccAddresses.map((a) => a!.id),
            ...bccAddresses.map((a) => a!.id),
          ]),
        ],
      },
    });
    await db.email.upsert({
      where: { id: email.id },
      update: {
        threadId: thread.id,
        createdTime: new Date(email.createdTime),
        lastModifiedTime: new Date(),
        sentAt: new Date(email.sentAt),
        receivedAt: new Date(email.receivedAt),
        internetMessageId: email.internetMessageId,
        subject: email.subject,
        sysLabels: email.sysLabels,
        keywords: email.keywords,
        sysClassifications: email.sysClassifications,
        sensitivity: email.sensitivity,
        meetingMessageMethod: email.meetingMessageMethod,
        fromId: fromAddress.id,
        to: { set: toAddresses.map((a) => ({ id: a!.id })) },
        cc: { set: ccAddresses.map((a) => ({ id: a!.id })) },
        bcc: { set: bccAddresses.map((a) => ({ id: a!.id })) },
        replyTo: { set: replyToAddresses.map((a) => ({ id: a!.id })) },
        hasAttachments: email.hasAttachments,
        internetHeaders: email.internetHeaders as any,
        body: email.body,
        bodySnippet: email.bodySnippet,
        inReplyTo: email.inReplyTo,
        references: email.references,
        threadIndex: email.threadIndex,
        nativeProperties: email.nativeProperties as any,
        folderId: email.folderId,
        omitted: email.omitted,
        emailLabel: emailLabelType,
      },
      create: {
        id: email.id,
        emailLabel: emailLabelType,
        threadId: thread.id,
        createdTime: new Date(email.createdTime),
        lastModifiedTime: new Date(),
        sentAt: new Date(email.sentAt),
        receivedAt: new Date(email.receivedAt),
        internetMessageId: email.internetMessageId,
        subject: email.subject,
        sysLabels: email.sysLabels,
        internetHeaders: email.internetHeaders as any,
        keywords: email.keywords,
        sysClassifications: email.sysClassifications,
        sensitivity: email.sensitivity,
        meetingMessageMethod: email.meetingMessageMethod,
        fromId: fromAddress.id,
        to: { connect: toAddresses.map((a) => ({ id: a!.id })) },
        cc: { connect: ccAddresses.map((a) => ({ id: a!.id })) },
        bcc: { connect: bccAddresses.map((a) => ({ id: a!.id })) },
        replyTo: { connect: replyToAddresses.map((a) => ({ id: a!.id })) },
        hasAttachments: email.hasAttachments,
        body: email.body,
        bodySnippet: email.bodySnippet,
        inReplyTo: email.inReplyTo,
        references: email.references,
        threadIndex: email.threadIndex,
        nativeProperties: email.nativeProperties as any,
        folderId: email.folderId,
        omitted: email.omitted,
      },
    });

    const threadEmails = await db.email.findMany({
      where: { threadId: thread.id },
      orderBy: { receivedAt: 'asc' },
    });

    let threadFolderType = 'sent';
    for (const threadEmail of threadEmails) {
      if (threadEmail.emailLabel === 'inbox') {
        threadFolderType = 'inbox';
        break; // If any email is in inbox, the whole thread is in inbox
      } else if (threadEmail.emailLabel === 'draft') {
        threadFolderType = 'draft'; // Set to draft, but continue checking for inbox
      }
    }
    await db.thread.update({
      where: { id: thread.id },
      data: {
        draftStatus: threadFolderType === 'draft',
        inboxStatus: threadFolderType === 'inbox',
        sentStatus: threadFolderType === 'sent',
      },
    });

    // 4. Upsert Attachments
    for (const attachment of email.attachments) {
      await upsertAttachment(email.id, attachment);
    }
  } catch (error) {
    console.log(error);
  }
};

const upsertAddress = async (address: EmailAddress, accountId: string) => {
  try {
    const existingAddress = await db.emailAddress.findUnique({
      where: { accountId_address: { accountId, address: address.address ?? '' } },
    });
    if (existingAddress) {
      return await db.emailAddress.update({
        where: { accountId_address: { accountId, address: address.address ?? '' } },
        data: {
          name: address.name,
          raw: address.raw,
        },
      });
    }

    return await db.emailAddress.create({
      data: {
        accountId,
        address: address.address,
        name: address.name,
        raw: address.raw,
      },
    });
  } catch (error) {
    console.log('Error updating or creating address', error);
    return null;
  }
};

async function upsertAttachment(emailId: string, attachment: EmailAttachment) {
  try {
    await db.emailAttachment.upsert({
      where: { id: attachment.id ?? '' },
      update: {
        name: attachment.name,
        mimeType: attachment.mimeType,
        size: attachment.size,
        inline: attachment.inline,
        contentId: attachment.contentId,
        content: attachment.content,
        contentLocation: attachment.contentLocation,
      },
      create: {
        id: attachment.id,
        emailId,
        name: attachment.name,
        mimeType: attachment.mimeType,
        size: attachment.size,
        inline: attachment.inline,
        contentId: attachment.contentId,
        content: attachment.content,
        contentLocation: attachment.contentLocation,
      },
    });
  } catch (error) {
    console.log(`Failed to upsert attachment for email ${emailId}: ${error}`);
  }
}
