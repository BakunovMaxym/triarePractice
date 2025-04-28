import { AbstractDto } from '../../../common/dto/abstract.dto.ts';
import {
  NumberField,
  StringFieldOptional,
} from '../../../decorators/field.decorators.ts';
import type { UserEntity } from '../user.entity.ts';
import type { PropertyDto } from '../../../modules/property/dto/property.dto.ts';
import type { GameDto } from '../../../modules/game/dto/game.dto.ts';

// TODO, remove this class and use constructor's second argument's type
export type UserDtoOptions = Partial<{ isActive: boolean }>;

export class UserDto extends AbstractDto {
  @StringFieldOptional({ nullable: false })
  username?: string;

  @NumberField({ nullable: true })
  money?: number;

  properties!: PropertyDto[];

  game !: GameDto;

  

  constructor(user: UserEntity) {
    super(user);
    this.username = user.username;
    this.money = user.money;
    
  }
}
