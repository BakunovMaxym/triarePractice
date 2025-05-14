import { AbstractDto } from '../../../common/dto/abstract.dto.ts';
import {
  ClassField,
  StringField,
} from '../../../decorators/field.decorators.ts';
import type { ColectionEntity } from '../colection.entity.ts';
import  { SetingsDto } from '../../../modules/setings/dtos/setings.dto.ts';
import type { PropertyCardDto } from '../../../modules/property-cards/dto/property-card.dto.ts';
import type { ComunityChestDto } from '../../../modules/comunity-chest/dto/comunity-chest.dto.ts';
import type { chanceCardDto } from '../../../modules/chance-cards/dto/chance-card.dto.ts';

export class ColectionDto extends AbstractDto {
  @StringField()
  name!: string;
  
  @ClassField(() => SetingsDto)
  setings!: SetingsDto;

  // @ClassField(() => PropertyCardEntity)
  
  propertyCards!: PropertyCardDto[];

  comunityChests!: ComunityChestDto[];

  chanceCards!: chanceCardDto[];


  constructor(colection: ColectionEntity) {
    super(colection);
    this.name = colection.name;
    this.setings = colection.setings;
    this.propertyCards = colection.propertyCards;
    this.comunityChests = colection.comunityChests;
    this.chanceCards = colection.chanceCards;
  }
}
