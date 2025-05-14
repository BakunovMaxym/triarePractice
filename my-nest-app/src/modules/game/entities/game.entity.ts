import { UseDto } from "../../../decorators/use-dto.decorator";
import { UserEntity } from "../../../modules/user/user.entity";
import { Column, Entity, ManyToOne, OneToMany, type Relation } from "typeorm";
import { GameDto } from "../dto/game.dto";
import { AbstractEntity } from "../../../common/abstract.entity";
import { PropertyEntity } from "../../../modules/property/entities/property.entity";
import { ColectionEntity } from "../../../modules/colections/colection.entity";
import { GameStatuses } from "../enums/game-status.enum";

@Entity({ name: 'games' })
@UseDto(GameDto)
export class GameEntity  extends AbstractEntity<GameDto> {


    @OneToMany(() => UserEntity, (user) => user.game)
    users!: UserEntity[];

    @OneToMany(() => PropertyEntity, (property) => property.game)
    propertys!: Relation<PropertyEntity[]>;

    @ManyToOne(() => ColectionEntity, (colection) => colection.id)
    colection!: Relation<ColectionEntity>;

    @Column({ type: 'enum', enum: GameStatuses, default: GameStatuses.WITING_PLAYERS })
    status!: GameStatuses

    @Column("simple-array",{default: []})
    turnOrder!: Uuid[]

    @Column({ nullable: false, type: 'integer', default: 0 })
    currentTurn!: number;

}
