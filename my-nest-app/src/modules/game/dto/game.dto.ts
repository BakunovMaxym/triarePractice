import { AbstractDto } from "../../../common/dto/abstract.dto";
import type { GameEntity } from "../entities/game.entity";
import type { UserDto } from "../../../modules/user/dtos/user.dto";
import type { PropertyDto } from "../../../modules/property/dto/property.dto";
import type { ColectionDto } from "../../../modules/colections/dtos/colection.dto";


export class GameDto extends AbstractDto{
   
    users!: UserDto[];
    propertys!: PropertyDto[];
    colection!: ColectionDto;

    constructor(game: GameEntity) {
        super(game);
        this.users = game.users;
        this.propertys = game.propertys;
        this.colection = game.colection;
    }
}