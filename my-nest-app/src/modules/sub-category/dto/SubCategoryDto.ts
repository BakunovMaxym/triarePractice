import { StringField, UUIDField } from '../../../decorators/field.decorators';
import type { SubCategoryEntity } from '../entities/sub-category.entity';
export class SubCategoryDto {

  @UUIDField()
  id!: Uuid

  @StringField()
  name!: string;

  constructor(subcategory: SubCategoryEntity) {
    this.id = subcategory.id;
    this.name = subcategory.name;
  }
}
