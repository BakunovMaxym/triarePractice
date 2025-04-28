import { UseDto } from "../../../decorators/use-dto.decorator";
import { UserEntity } from "../../../modules/user/user.entity";
import { Entity, ManyToOne, OneToMany, type Relation } from "typeorm";
import { GameDto } from "../dto/game.dto";
import { AbstractEntity } from "../../../common/abstract.entity";
import { PropertyEntity } from "../../../modules/property/entities/property.entity";
import { ColectionEntity } from "../../../modules/colections/colection.entity";

@Entity({ name: 'games' })
@UseDto(GameDto)
export class GameEntity  extends AbstractEntity<GameDto> {
    @OneToMany(() => UserEntity, (user) => user.game)
    users!: Relation<UserEntity[]>;

    @OneToMany(() => PropertyEntity, (property) => property.game)
    propertys!: Relation<PropertyEntity[]>;

    @ManyToOne(()=> ColectionEntity, (colection) => colection.id)
    colection!: Relation<ColectionEntity>;


}
