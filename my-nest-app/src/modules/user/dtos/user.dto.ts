import { AbstractDto } from '../../../common/dto/abstract.dto.ts';
import { RoleType } from '../../../constants/role-type.ts';
import {
  // BooleanFieldOptional,
  EmailFieldOptional,
  EnumFieldOptional,
  StringFieldOptional,
} from '../../../decorators/field.decorators.ts';
import type { UserEntity } from '../user.entity.ts';

export type UserDtoOptions = Partial<{ isActive: boolean }>;

export class UserDto extends AbstractDto {
  @StringFieldOptional({ nullable: true })
  firstName?: string | null;

  @StringFieldOptional({ nullable: true })
  lastName?: string | null;

  // @StringFieldOptional({ nullable: true })
  // username!: string;

  @EnumFieldOptional(() => RoleType)
  role?: RoleType;

  @EmailFieldOptional({ nullable: true })
  email?: string | null;

  // @BooleanFieldOptional()
  // isActive?: boolean;

  constructor(user: UserEntity /*, options?: UserDtoOptions*/) {
    super(user);
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.role = user.role;
    this.email = user.email;
    // this.isActive = options?.isActive;
  }
}
