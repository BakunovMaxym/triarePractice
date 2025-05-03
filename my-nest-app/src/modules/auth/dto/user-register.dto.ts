import { RoleType } from '../../../constants/role-type.ts';
import {
  EnumField,
  NumberFieldOptional,
  StringField,
} from '../../../decorators/field.decorators.ts';

export class UserRegisterDto {
  @StringField()
  readonly username!: string;

  @NumberFieldOptional({ nullable: true })
  readonly money?: number;

  @EnumField(() => RoleType, {default: RoleType.USER})
  readonly role!: RoleType;

}
