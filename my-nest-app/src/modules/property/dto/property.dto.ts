import { PropertyStatyses } from "../ProprtyStatyses";
import { AbstractDto } from "../../../common/dto/abstract.dto";
import { EnumField, NumberField } from "../../../decorators/field.decorators";
import type { UserDto } from "../../../modules/user/dtos/user.dto";
import type { GameDto } from "../../../modules/game/dto/game.dto";
import type { PropertyCardDto } from "../../../modules/property-cards/dto/property-card.dto";

export class PropertyDto extends AbstractDto {

    
    property!: PropertyCardDto;

    @EnumField(() => PropertyStatyses)
    propertyType!: PropertyStatyses;

    owner!: UserDto;

    @NumberField()
    upgradeCount!: number;

    game!: GameDto;


}
