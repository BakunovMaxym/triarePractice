import {  NumberField, NumberFieldOptional, StringField, UUIDField } from "../../../decorators/field.decorators";

export class CreatePropertyCardDto {
        @UUIDField()
        colection_id!: Uuid;
    
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
}
