import { Enum } from '@/modules/shared/domain/core/value-objects/Enum';

export enum EmailSensitivityValue {
  NORMAL = 'normal',
  PERSONAL = 'personal',
  PRIVATE = 'private',
  CONFIDENTIAL = 'confidential',
}

export class EmailSensitivity extends Enum<EmailSensitivityValue> {
  constructor(value: EmailSensitivityValue) {
    super(value, Object.values(EmailSensitivityValue));
  }

  static Normal(): EmailSensitivity {
    return new EmailSensitivity(EmailSensitivityValue.NORMAL);
  }

  static Personal(): EmailSensitivity {
    return new EmailSensitivity(EmailSensitivityValue.PERSONAL);
  }

  static Private(): EmailSensitivity {
    return new EmailSensitivity(EmailSensitivityValue.PRIVATE);
  }

  static Confidential(): EmailSensitivity {
    return new EmailSensitivity(EmailSensitivityValue.CONFIDENTIAL);
  }
}
