import { Column, Entity, ManyToOne, type Relation } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { ComunityChestTypes } from "../enum/comynity-chest-types.enum";
import { ColectionEntity } from "../../../modules/colections/colection.entity";
import { ComunityChestDto } from "../dto/comunity-chest.dto";
import { UseDto } from "../../../decorators/use-dto.decorator";

@Entity({ name: 'comunity_chests' })
@UseDto(ComunityChestDto)
export class ComunityChestEntity extends AbstractEntity<ComunityChestDto>{
    @Column({nullable: false, type: 'varchar'})
    description!: string;

    @Column({nullable: false, type: 'enum', enum: ComunityChestTypes})
    type!: ComunityChestTypes;

    @Column({nullable: true, type:'integer'})
    moneyForProperty!: number;

    @Column("simple-array",{ default: null, nullable: true})
    propertys!: string[]


    @Column({nullable: true, type:'integer'})
    moneyForHotel!: number;

    @Column({nullable:true, type:'boolean'})
    is_Hotels!: boolean


    @Column({nullable: true, type:'integer'})
    moneyForHouse!: number;

    @Column({nullable:true, type:'boolean'})
    is_Houses!: boolean

    @ManyToOne(() => ColectionEntity, (colection) => colection.comunityChests)
    colection!: Relation<ColectionEntity>;

}
