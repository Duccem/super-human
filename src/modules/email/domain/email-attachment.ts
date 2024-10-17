import {
  BooleanValueObject,
  NumberValueObject,
  OptionalString,
  StringValueObject,
} from '@/modules/shared/domain/core/ValueObject';
import { Primitives } from '@/modules/shared/domain/types/Primitives';

export class EmailAttachment {
  constructor(
    public id: StringValueObject,
    public emailId: StringValueObject,
    public name: StringValueObject,
    public mimeType: StringValueObject,
    public size: NumberValueObject,
    public inline: BooleanValueObject,
    public contentId: OptionalString,
    public content: OptionalString,
    public contentLocation: OptionalString,
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
      new StringValueObject(primitives.id),
      new StringValueObject(primitives.emailId),
      new StringValueObject(primitives.name),
      new StringValueObject(primitives.mimeType),
      new NumberValueObject(primitives.size),
      new BooleanValueObject(primitives.inline),
      new OptionalString(primitives.contentId),
      new OptionalString(primitives.content),
      new OptionalString(primitives.contentLocation),
    );
  }

  static Create(
    id: string,
    emailId: string,
    name: string,
    mimeType: string,
    size: number,
    inline: boolean,
    contentId?: string,
    content?: string,
    contentLocation?: string,
  ): EmailAttachment {
    return new EmailAttachment(
      new StringValueObject(id),
      new StringValueObject(emailId),
      new StringValueObject(name),
      new StringValueObject(mimeType),
      new NumberValueObject(size),
      new BooleanValueObject(inline),
      new OptionalString(contentId),
      new OptionalString(content),
      new OptionalString(contentLocation),
    );
  }
}
