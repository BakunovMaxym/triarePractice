import { AbstractDto } from "../../../common/dto/abstract.dto";
import type { UserEntity } from "../../../modules/user/user.entity";
import type { GameEntity } from "../entities/game.entity";
import type { PropertyEntity } from "../../../modules/property/entities/property.entity";
import type { ColectionEntity } from "../../../modules/colections/colection.entity";


export class GameDto extends AbstractDto{
   
    users!: UserEntity[];
    propertys!: PropertyEntity[];
    colection!: ColectionEntity;

    constructor(game: GameEntity) {
        super(game);
        this.users = game.users;
        this.propertys = game.propertys;
        this.colection = game.colection;
    }
}