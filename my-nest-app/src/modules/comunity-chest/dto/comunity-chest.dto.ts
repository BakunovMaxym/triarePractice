import { BooleanField, EnumField, NumberField, StringField } from "../../../decorators/field.decorators";
import { AbstractDto } from "../../../common/dto/abstract.dto";
import { ComunityChestTypes } from "../enum/comynity-chest-types.enum";
import type { ColectionEntity } from "../../../modules/colections/colection.entity";
import type { ComunityChestEntity } from "../entities/comunity-chest.entity";

export class ComunityChestDto extends AbstractDto {
        
        @StringField()
        description!: string;

        @EnumField(() => ComunityChestTypes)
        type!: ComunityChestTypes;

        @NumberField()
        moneyForProperty!: number;
    
        propertys!: string[]
    
        @NumberField()
        moneyForHotel!: number;
    
        @BooleanField()
        is_Hotels!: boolean
    
        @NumberField()    
        moneyForHouse!: number;
    
        @BooleanField()
        is_Houses!: boolean

        colection!: ColectionEntity;

        constructor(comunityChest: ComunityChestEntity) {
            super(comunityChest);
            this.description = comunityChest.description;
            this.type = comunityChest.type;
            this.moneyForProperty = comunityChest.moneyForProperty;
            this.propertys = comunityChest.propertys;
            this.moneyForHotel = comunityChest.moneyForHotel;
            this.is_Hotels = comunityChest.is_Hotels;
            this.moneyForHouse = comunityChest.moneyForHouse;
            this.is_Houses = comunityChest.is_Houses;
            this.colection = comunityChest.colection
        }
    
    
}