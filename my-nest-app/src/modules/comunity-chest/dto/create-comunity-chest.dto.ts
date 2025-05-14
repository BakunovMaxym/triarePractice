import { StringField, EnumField, NumberField, BooleanField, UUIDField } from "../../../decorators/field.decorators";
import  { ComunityChestTypes } from "../enum/comynity-chest-types.enum";

export class CreateComunityChestDto {
    @StringField()
    description!: string;

    @EnumField(() => ComunityChestTypes)
    type!: ComunityChestTypes;

    @NumberField()
    moneyForProperty!: number;

    @StringField({ isArray: true, nullable: true})
    propertys!: string[]

    @NumberField()
    moneyForHotel!: number;

    @BooleanField()
    is_Hotels!: boolean

    @NumberField()
    moneyForHouse!: number;

    @BooleanField()
    is_Houses!: boolean

    @UUIDField()
    colection_id!: Uuid;
}
