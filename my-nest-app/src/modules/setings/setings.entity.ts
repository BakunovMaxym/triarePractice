import { UseDto } from "../../decorators/use-dto.decorator";
import { Column, Entity } from "typeorm";
import { SetingsDto } from "./dtos/setings.dto";
import { AbstractEntity } from "../../common/abstract.entity";

@Entity({ name: 'settings' })
@UseDto(SetingsDto)
export class SetingsEntity extends AbstractEntity<SetingsDto> {
    @Column({ nullable: false, type: 'integer' })
    timeForturn!: number;

    @Column({ nullable: false, type: 'integer' })
    moneyForLap!: number;

    @Column({ nullable: false, type: 'boolean' })
    bostercube!: boolean;

    @Column({ nullable: false, type: 'boolean' })
    auction !: boolean;
}