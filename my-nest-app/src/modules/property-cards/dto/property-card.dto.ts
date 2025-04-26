import { AbstractDto } from "../../../common/dto/abstract.dto";
import { NumberField, NumberFieldOptional, StringField } from "../../../decorators/field.decorators";
import type { PropertyCardEntity } from "../entities/property-card.entity";

export class PropertyCardDto extends AbstractDto {


    @StringField()
    name!: string;

    @StringField()
    type!: string;

    @NumberField()
    price!: number;

    @StringField()
    street!: string;

    @NumberFieldOptional()
    upgradePrice!: number;

    @NumberField()
    rent!: number;

    @NumberFieldOptional()
    rentAllStreet!: number;

    @NumberFieldOptional()
    rentWithOneHouse!: number;

    @NumberFieldOptional()
    rentWithTwoHouse!: number;


    @NumberFieldOptional()
    rentWithThreeHouse!: number;

    @NumberFieldOptional()
    rentWithFourHouse!: number;

    @NumberFieldOptional()
    rentWithHotel!: number;

    constructor(propertyCard: PropertyCardEntity) {
        super(propertyCard);
        this.name = propertyCard.name;
        this.type = propertyCard.type;
        this.price = propertyCard.price;
        this.street = propertyCard.street;
        this.upgradePrice = propertyCard.upgradePrice;
        this.rent = propertyCard.rent;
        this.rentAllStreet = propertyCard.rentAllStreet;
        this.rentWithOneHouse = propertyCard.rentWithOneHouse;
        this.rentWithTwoHouse = propertyCard.rentWithTwoHouse;
        this.rentWithThreeHouse = propertyCard.rentWithThreeHouse;
        this.rentWithFourHouse = propertyCard.rentWithFourHouse;
        this.rentWithHotel = propertyCard.rentWithHotel;
    }
}