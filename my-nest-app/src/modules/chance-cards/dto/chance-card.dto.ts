import { EnumField, NumberFieldOptional, StringField, StringFieldOptional } from "../../../decorators/field.decorators";
import { AbstractDto } from "../../../common/dto/abstract.dto";
import { ChanceCardTypes } from "../enum/chance-card-types.enum";
import type { ColectionDto } from "../../../modules/colections/dtos/colection.dto";
import type { ChanceCardEntity } from "../entities/chance-card.entity";

export class chanceCardDto extends AbstractDto {
    @StringField({nullable: false})
    description!: string;

    @EnumField(() => ChanceCardTypes, {nullable:false})
    type!: ChanceCardTypes

    @NumberFieldOptional({ nullable: true })
    money!: number

    @StringFieldOptional({ nullable: true })
    destination!: string

    colection!: ColectionDto;

    constructor(entity: ChanceCardEntity){
        super(entity);
        this.description = entity.description;
        this.type = entity.type;
        this.money = entity.money;
        this.destination = entity.destination;
        this.colection = entity.colection;
    }
}