import { AbstractDto } from "../../../common/dto/abstract.dto";
import { BooleanField, NumberField } from "../../../decorators/field.decorators";

export class SetingsDto extends AbstractDto {
        @NumberField({ nullable: false })
        timeForturn!: number;
    
        @NumberField({ nullable: false })

        moneyForLap!: number;
    
        @BooleanField({ nullable: false })
        bostercube!: boolean;
    
        @BooleanField({ nullable: false})
        auction !: boolean;
    
}