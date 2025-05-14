import { AbstractDto } from "../../../common/dto/abstract.dto";
import type { GameDto } from "../../../modules/game/dto/game.dto";
import type { PropertyDto } from "../../../modules/property/dto/property.dto";
import type { UserDto } from "../../../modules/user/dtos/user.dto";
import type { TurnEntity } from "../entities/turn.entity";

export class TurnDto extends AbstractDto {
    game!: GameDto;

    user!: UserDto;

    propertys!: PropertyDto[];

    users!: UserDto[];

    constructor(entity: TurnEntity) {
        super(entity);
        this.game = entity.game.toDto();
        this.user = entity.user.toDto();
        this.propertys = entity.propertys.map((property) => property.toDto());
        this.users = entity.users.map((user) => user.toDto());
    }
}