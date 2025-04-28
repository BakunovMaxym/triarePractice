import { PropertyCardEntity } from "../../property-cards/entities/property-card.entity";
import {  type Relation } from "typeorm";
import { PropertyStatyses } from "../ProprtyStatyses";
import { UserEntity } from "../../user/user.entity";
import { AbstractDto } from "../../../common/dto/abstract.dto";
import { EnumField, NumberField } from "../../../decorators/field.decorators";
import type { GameEntity } from "../../../modules/game/entities/game.entity";

export class PropertyDto extends AbstractDto {

    
    property!: Relation<PropertyCardEntity>;

    @EnumField(() => PropertyStatyses)
    propertyType!: PropertyStatyses;

    owner!: UserEntity;

    @NumberField()
    upgradeCount!: number;

    game!: GameEntity;


}
