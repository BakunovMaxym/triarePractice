import { PropertyCardEntity } from "../../../modules/property-cards/entities/property-card.entity";
import { Column, Entity, ManyToOne, type Relation } from "typeorm";
import { PropertyStatyses } from "../ProprtyStatyses";
import { UserEntity } from "../../../modules/user/user.entity";
import { AbstractEntity } from "../../../common/abstract.entity";
import { PropertyDto } from "../dto/property.dto";
import { UseDto } from "../../../decorators/use-dto.decorator";
import { GameEntity } from "../../../modules/game/entities/game.entity";

@Entity({ name: 'propertys' })
@UseDto(PropertyDto)
export class PropertyEntity extends AbstractEntity<PropertyDto> {

    @ManyToOne(() => PropertyCardEntity, (property) => property.id)
    property!: Relation<PropertyCardEntity>;

    @Column({ nullable: false, type: 'enum', enum: PropertyStatyses, default: PropertyStatyses.NORMAL })
    propertyType!: PropertyStatyses;

    @ManyToOne(() => UserEntity, (user) => user.id, { nullable: true })
    owner!: Relation<UserEntity>;

    @ManyToOne(() => GameEntity, (game) => game.propertys)
    game!: Relation<GameEntity>;

    @Column({ nullable: false, type: 'integer' })
    upgradeCount!: number;

}
