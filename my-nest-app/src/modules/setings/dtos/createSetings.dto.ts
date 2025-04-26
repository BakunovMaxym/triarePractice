import { BooleanField, NumberField } from "../../../decorators/field.decorators";

export class CreateSetingsDto {
        @NumberField({ nullable: false })
        timeForturn!: number;
    
        @NumberField({ nullable: false })

        moneyForLap!: number;
    
        @BooleanField({ nullable: false })
        bostercube!: boolean;
    
        @BooleanField({ nullable: false})
        auction !: boolean;
    
}