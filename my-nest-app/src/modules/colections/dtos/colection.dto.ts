import { SetingsEntity } from '../../../modules/setings/setings.entity.ts';
import { AbstractDto } from '../../../common/dto/abstract.dto.ts';
import {
  ClassField,
  StringField,
} from '../../../decorators/field.decorators.ts';
import type { ColectionEntity } from '../colection.entity.ts';
import  { SetingsDto } from '../../../modules/setings/dtos/setings.dto.ts';
import type { PropertyCardDto } from '../../../modules/property-cards/dto/property-card.dto.ts';




export class ColectionDto extends AbstractDto {
  @StringField()
  name!: string;
  
  @ClassField(() => SetingsDto)
  setings!: SetingsDto;

  // @ClassField(() => PropertyCardEntity)
  
  propertyCards!: PropertyCardDto[];

  constructor(colection: ColectionEntity) {
    super(colection);
    this.name = colection.name;
    this.setings = colection.setings;
    this.propertyCards = colection.propertyCards;
  }
}
