import { SetingsEntity } from '../../../modules/setings/setings.entity.ts';
import { AbstractDto } from '../../../common/dto/abstract.dto.ts';
import {
  ClassField,
  StringField,
} from '../../../decorators/field.decorators.ts';
import type { ColectionEntity } from '../colection.entity.ts';




export class ColectionDto extends AbstractDto {
  @StringField()
  name!: string;
  
  @ClassField(() => SetingsEntity)
  setings!: SetingsEntity;

  // @ClassField(() => PropertyCardEntity)
  // propertyCards!: PropertyCardEntity[];

  constructor(colection: ColectionEntity) {
    super(colection);
    this.name = colection.name;
    this.setings = colection.setings;
    // this.propertyCards = colection.propertyCards;
  }
}
