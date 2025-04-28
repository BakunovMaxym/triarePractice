import { AbstractDto } from '../../../common/dto/abstract.dto';
import { StringField } from '../../../decorators/field.decorators';
import type {SubCategoryEntity} from '../entities/sub-category.entity';
export class SubCategoryDto extends AbstractDto {
  @StringField()
  name?: string;

  constructor(subcategory: SubCategoryEntity) {
    super(subcategory)
    this.name = subcategory.name;
  }
}
