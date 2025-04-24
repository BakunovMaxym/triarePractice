import {
  EmailField,
  PasswordField,
  // PhoneFieldOptional,
  StringField,
  StringFieldOptional,
} from '../../../decorators/field.decorators.ts';

export class UserRegisterDto {
  @StringField()
  readonly firstName!: string;

  @StringField()
  readonly lastName!: string;

  @EmailField()
  readonly email!: string;

  @PasswordField({ minLength: 6 })
  readonly password!: string;

  @StringFieldOptional()
  phone?: string;
}
