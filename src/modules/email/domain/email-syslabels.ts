import { StringValueObject, ValueObject } from '@/modules/shared/domain/core/ValueObject';

export class EmailSysLabels extends ValueObject<string[]> {
  protected validation(value: string[]): void {
    if (value.length === 0) {
      throw new Error('Email sys labels cannot be empty');
    }
  }

  getEmailLabelType(): StringValueObject {
    if (this.value.includes('inbox') || this.value.includes('important')) {
      return new StringValueObject('inbox');
    } else if (this.value.includes('sent')) {
      return new StringValueObject('sent');
    } else if (this.value.includes('draft')) {
      return new StringValueObject('draft');
    }
    return new StringValueObject('inbox');
  }
}
