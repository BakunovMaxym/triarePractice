import { UseDto } from "../../../decorators/use-dto.decorator";
import { Column, Entity, ManyToOne, type Relation } from "typeorm";
import { chanceCardDto } from "../dto/chance-card.dto";
import { AbstractEntity } from "../../../common/abstract.entity";
import { ChanceCardTypes } from "../enum/chance-card-types.enum";
import { ColectionEntity } from "../../../modules/colections/colection.entity";

@Entity({ name: 'chance-cards' })
@UseDto(chanceCardDto)
export class ChanceCardEntity extends AbstractEntity<chanceCardDto>{
    @Column({ nullable: false, type: 'varchar'})
    description!: string;

    @Column({nullable:false, type: 'enum', enum: ChanceCardTypes})
    type!: ChanceCardTypes

    @Column({nullable: true, type: 'integer'})
    money!: number

    @Column({nullable: true, type: 'varchar'})
    destination!: string

    @ManyToOne(() => ColectionEntity, (colection) => colection.chanceCards, {nullable:false})
    colection!: Relation<ColectionEntity>;
}
