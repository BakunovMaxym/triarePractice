import type { PropertyEntity } from '../../../modules/property/entities/property.entity.ts';
import { AbstractDto } from '../../../common/dto/abstract.dto.ts';
import {
  NumberField,
  NumberFieldOptional,
  StringFieldOptional,
} from '../../../decorators/field.decorators.ts';
import type { UserEntity } from '../user.entity.ts';
import type { GameEntity } from '../../../modules/game/entities/game.entity.ts';

// TODO, remove this class and use constructor's second argument's type
export type UserDtoOptions = Partial<{ isActive: boolean }>;

export class UserDto extends AbstractDto {
  @StringFieldOptional({ nullable: false })
  username?: string;

  @NumberField({ nullable: true })
  money?: number;

  properties!: PropertyEntity[];

  game !: GameEntity;

  

  constructor(user: UserEntity) {
    super(user);
    this.username = user.username;
    this.money = user.money;
    
  }
}
