import type { GameDto } from "../../../modules/game/dto/game.dto";
import type { PropertyDto } from "../../../modules/property/dto/property.dto";
import type { UserDto } from "../../../modules/user/dtos/user.dto";

export class CreateTurnDto {
    game!: GameDto;

    user!: UserDto;

    propertys!: PropertyDto[];

    users!: UserDto[];
}
