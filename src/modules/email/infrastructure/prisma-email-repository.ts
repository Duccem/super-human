import { Criteria } from '@/modules/shared/domain/core/Criteria';
import { Primitives } from '@/modules/shared/domain/types/Primitives';
import { PrismaCriteriaConverter } from '@/modules/shared/infrastructure/prisma/PrismaCriteriaConverter';
import { PrismaClient } from '@prisma/client';
import { Email } from '../domain/email';
import { EmailAddress } from '../domain/email-address';
import { EmailAttachment } from '../domain/email-attachment';
import { EmailRepository } from '../domain/email-repository';

export class PrismaEmailRepository implements EmailRepository {
  private converter = new PrismaCriteriaConverter();
  constructor(private readonly prisma: PrismaClient) {}

  get model() {
    return this.prisma.email;
  }

  get attachments() {
    return this.prisma.emailAttachment;
  }

  get addresses() {
    return this.prisma.emailAddress;
  }

  async save(
    email: Email,
    {
      to: toAddresses,
      cc: ccAddresses,
      bcc: bccAddresses,
      replyTo: replyToAddresses,
    }: { to: EmailAddress[]; cc: EmailAddress[]; bcc: EmailAddress[]; replyTo: EmailAddress[] },
  ): Promise<void> {
    const { from, ...emailPrimitives } = email.toPrimitives();
    await this.model.upsert({
      where: { id: emailPrimitives.id },
      update: {
        ...emailPrimitives,
        meetingMessageMethod: emailPrimitives.meetingMessageMethod as any,
        internetHeaders: emailPrimitives.internetHeaders as any,
        nativeProperties: emailPrimitives.nativeProperties as any,
        emailLabel: emailPrimitives.emailLabel as any,
        to: { set: toAddresses.map((a) => ({ id: a!.id.value })) },
        cc: { set: ccAddresses.map((a) => ({ id: a!.id.value })) },
        bcc: { set: bccAddresses.map((a) => ({ id: a!.id.value })) },
        replyTo: { set: replyToAddresses.map((a) => ({ id: a!.id.value })) },
      },
      create: {
        ...emailPrimitives,
        meetingMessageMethod: emailPrimitives.meetingMessageMethod as any,
        internetHeaders: emailPrimitives.internetHeaders as any,
        nativeProperties: emailPrimitives.nativeProperties as any,
        emailLabel: emailPrimitives.emailLabel as any,
        to: { connect: toAddresses.map((a) => ({ id: a!.id.value })) },
        cc: { connect: ccAddresses.map((a) => ({ id: a!.id.value })) },
        bcc: { connect: bccAddresses.map((a) => ({ id: a!.id.value })) },
        replyTo: { connect: replyToAddresses.map((a) => ({ id: a!.id.value })) },
      },
    });
  }

  async saveEmailAddresses(addresses: EmailAddress[]) {
    const insertedAddresses = [];
    for (const add of addresses) {
      const address = add.toPrimitives();
      const insertedAddress = await this.addresses.upsert({
        where: { accountId_address: { accountId: address.accountId.toString(), address: address.address } },
        update: {
          name: address.name,
          raw: address.raw,
        },
        create: {
          id: address.id,
          name: address.name,
          address: address.address,
          raw: address.raw,
          accountId: address.accountId.toString(),
        },
      });
      insertedAddresses.push(insertedAddress);
    }
    return insertedAddresses.map((address) => EmailAddress.fromPrimitives(address as Primitives<EmailAddress>));
  }

  async saveEmailAttachments(attachments: EmailAttachment[]): Promise<void> {
    const insertedAttachments = [];
    for (const attachment of attachments) {
      const attachmentPrimitives = attachment.toPrimitives();
      const insertedAttachment = await this.attachments.upsert({
        where: { id: attachmentPrimitives.id },
        update: {
          name: attachmentPrimitives.name,
          mimeType: attachmentPrimitives.mimeType,
          size: attachmentPrimitives.size,
          inline: attachmentPrimitives.inline,
          contentId: attachmentPrimitives.contentId,
          content: attachmentPrimitives.content,
          contentLocation: attachmentPrimitives.contentLocation,
          emailId: attachmentPrimitives.emailId,
        },
        create: {
          id: attachmentPrimitives.id,
          name: attachmentPrimitives.name,
          mimeType: attachmentPrimitives.mimeType,
          size: attachmentPrimitives.size,
          inline: attachmentPrimitives.inline,
          contentId: attachmentPrimitives.contentId,
          content: attachmentPrimitives.content,
          contentLocation: attachmentPrimitives.contentLocation,
          emailId: attachmentPrimitives.emailId,
        },
      });
      insertedAttachments.push(insertedAttachment);
    }
  }
  getByCriteria(criteria: Criteria): Promise<Email[]> {
    throw new Error('Method not implemented.');
  }
  async searchByCriteria(criteria: Criteria): Promise<Email[]> {
    const { where } = this.converter.criteria(criteria);
    const emails = await this.model.findMany({
      where,
      include: {
        to: true,
        from: true,
      },
    });
    return emails.map((email) => Email.fromPrimitives(email as Primitives<Email>));
  }

  async listAddresses(accountId: string): Promise<EmailAddress[]> {
    const addresses = await this.addresses.findMany({
      where: { accountId },
    });
    return addresses.map((address) => EmailAddress.fromPrimitives(address as Primitives<EmailAddress>));
  }
}
