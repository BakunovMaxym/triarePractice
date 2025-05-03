import { PropertyStatyses } from "../ProprtyStatyses";
import { AbstractDto } from "../../../common/dto/abstract.dto";
import { EnumField, NumberField } from "../../../decorators/field.decorators";
import type { UserDto } from "../../../modules/user/dtos/user.dto";
import type { GameDto } from "../../../modules/game/dto/game.dto";
import type { PropertyCardDto } from "../../../modules/property-cards/dto/property-card.dto";
import type { PropertyEntity } from "../entities/property.entity";

export class PropertyDto extends AbstractDto {

    
    property!: PropertyCardDto;

    @EnumField(() => PropertyStatyses)
    propertyType!: PropertyStatyses;

    owner?: UserDto | null;

    @NumberField()
    upgradeCount!: number;

    game!: GameDto;

    constructor(entity: PropertyEntity) {
        super(entity);
        this.property = entity.property;
        this.propertyType = entity.propertyType;
        this.owner = entity.owner ? entity.owner.toDto() : null;
        this.upgradeCount = entity.upgradeCount;
        this.game = entity.game;
    }

}
