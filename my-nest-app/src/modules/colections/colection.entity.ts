import { AbstractEntity } from '../../common/abstract.entity';
import { UseDto } from '../../decorators/use-dto.decorator';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { ColectionDto } from './dtos/colection.dto';
import { SetingsEntity } from '../../modules/setings/setings.entity';
import { PropertyCardEntity } from '../../modules/property-cards/entities/property-card.entity';
import { ComunityChestEntity } from '../../modules/comunity-chest/entities/comunity-chest.entity';
import { ChanceCardEntity } from '../../modules/chance-cards/entities/chance-card.entity';



@Entity({ name: 'colections' })
@UseDto(ColectionDto)
export class ColectionEntity extends AbstractEntity<ColectionDto> {
  @Column({ nullable: false, type: 'varchar' })
  name!: string;

   @OneToOne(() => SetingsEntity)
   @JoinColumn({name:"setings_id"})
   setings!: SetingsEntity;

   @OneToMany(() => PropertyCardEntity, (propertyCard) => propertyCard.colection)
    propertyCards!: PropertyCardEntity[];

    @OneToMany(() => ComunityChestEntity, (comunitychest) => comunitychest.colection)
    comunityChests!: ComunityChestEntity[]

    @OneToMany(() => ChanceCardEntity, (chanceCard) => chanceCard.colection)
    chanceCards!: ChanceCardEntity[];

}
