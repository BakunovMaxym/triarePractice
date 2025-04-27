import { RoleType } from '../../../constants/role-type.ts';
import {
  EmailField,
  EnumFieldOptional,
  PasswordField,
  StringField,
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

  @EnumFieldOptional(() => RoleType)
  role?: RoleType;
}
