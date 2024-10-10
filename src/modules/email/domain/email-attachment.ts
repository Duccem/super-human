import { Uuid } from '@/modules/shared/domain/core/value-objects/Uuid';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '@/modules/shared/domain/core/ValueObject';
import { Primitives } from '@/modules/shared/domain/types/Primitives';

export class EmailAttachment {
  constructor(
    public id: Uuid,
    public emailId: Uuid,
    public name: StringValueObject,
    public mimeType: StringValueObject,
    public size: NumberValueObject,
    public inline: BooleanValueObject,
    public contentId: StringValueObject,
    public content: StringValueObject,
    public contentLocation: StringValueObject,
  ) {}

  public toPrimitives(): Primitives<EmailAttachment> {
    return {
      id: this.id.toString(),
      emailId: this.emailId.toString(),
      name: this.name.value,
      mimeType: this.mimeType.value,
      size: this.size.value,
      inline: this.inline.value,
      contentId: this.contentId.value,
      content: this.content.value,
      contentLocation: this.contentLocation.value,
    };
  }

  static fromPrimitives(primitives: Primitives<EmailAttachment>): EmailAttachment {
    return new EmailAttachment(
      new Uuid(primitives.id),
      new Uuid(primitives.emailId),
      new StringValueObject(primitives.name),
      new StringValueObject(primitives.mimeType),
      new NumberValueObject(primitives.size),
      new BooleanValueObject(primitives.inline),
      new StringValueObject(primitives.contentId),
      new StringValueObject(primitives.content),
      new StringValueObject(primitives.contentLocation),
    );
  }

  static Create(
    id: string,
    emailId: string,
    name: string,
    mimeType: string,
    size: number,
    inline: boolean,
    contentId: string,
    content: string,
    contentLocation: string,
  ): EmailAttachment {
    return new EmailAttachment(
      new Uuid(id),
      new Uuid(emailId),
      new StringValueObject(name),
      new StringValueObject(mimeType),
      new NumberValueObject(size),
      new BooleanValueObject(inline),
      new StringValueObject(contentId),
      new StringValueObject(content),
      new StringValueObject(contentLocation),
    );
  }
}
