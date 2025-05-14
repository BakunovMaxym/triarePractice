import { StringField, EnumField, NumberFieldOptional, StringFieldOptional, UUIDField } from "../../../decorators/field.decorators";
import { ChanceCardTypes } from "../enum/chance-card-types.enum";

export class CreateChanceCardDto {

    @StringField({nullable: false})
    description!: string;

    @EnumField(() => ChanceCardTypes, {nullable:false})
    type!: ChanceCardTypes

    @NumberFieldOptional({ nullable: true })
    money!: number

    @StringFieldOptional({ nullable: true })
    destination!: string

    @UUIDField({ nullable: false })
    colectionId!: Uuid

   
}
