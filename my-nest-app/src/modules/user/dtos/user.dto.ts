import { AbstractDto } from '../../../common/dto/abstract.dto.ts';
import {
  BooleanField,
  EnumField,
  NumberField,
  StringFieldOptional,
} from '../../../decorators/field.decorators.ts';
import type { UserEntity } from '../user.entity.ts';
import type { PropertyDto } from '../../../modules/property/dto/property.dto.ts';
import type { GameDto } from '../../../modules/game/dto/game.dto.ts';
import { RoleType } from '../../../constants/role-type.ts';

// TODO, remove this class and use constructor's second argument's type
export type UserDtoOptions = Partial<{ isActive: boolean }>;

export class UserDto extends AbstractDto {
  @StringFieldOptional({ nullable: false })
  username?: string;

  @NumberField({ nullable: true, default: 0 })
  money!: number;

  properties!: PropertyDto[];

  game !: GameDto;

  @EnumField(() => RoleType )
  role !: RoleType

  @BooleanField()
  inJail!: Boolean;
  
  @NumberField()
  doublesCount!: number

  @BooleanField()
  getOutOfJailCard!: Boolean;
  
  @NumberField()
  JailTime!: number;

  constructor(user: UserEntity) {
    super(user);
    this.username = user.username;
    this.money = user.money;
    this.role = user.role;
    this.properties = user.properties?.map((property) => property.toDto());
    this.game = user?.game.toDto();
    this.inJail = user.inJail;
    this.doublesCount = user.doublesCount;
    this.getOutOfJailCard = user.getOutOfJailCard;
    this.JailTime = user.JailTime;
  }
}
