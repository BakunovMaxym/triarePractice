import { AbstractDto } from '../../../common/dto/abstract.dto.ts';
import {
  NumberFieldOptional,
  StringFieldOptional,
} from '../../../decorators/field.decorators.ts';
import type { UserEntity } from '../user.entity.ts';

// TODO, remove this class and use constructor's second argument's type
export type UserDtoOptions = Partial<{ isActive: boolean }>;

export class UserDto extends AbstractDto {
  @StringFieldOptional({ nullable: false })
  username?: string;

  @NumberFieldOptional({ nullable: true })
  money?: number;

  

  constructor(user: UserEntity) {
    super(user);
    this.username = user.username;
    this.money = user.money;
    
  }
}
