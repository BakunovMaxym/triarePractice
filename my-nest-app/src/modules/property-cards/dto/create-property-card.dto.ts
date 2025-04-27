import { ApiProperty } from "@nestjs/swagger";
import {  NumberField, NumberFieldOptional, StringField, UUIDField } from "../../../decorators/field.decorators";
import  { PropertyType } from "../PropertyType";

export class CreatePropertyCardDto {
        @UUIDField()
        colection_id!: Uuid;
    
        @StringField()
        name!: string;
    
        @ApiProperty({ enum: PropertyType })
        type!: PropertyType;
    
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
