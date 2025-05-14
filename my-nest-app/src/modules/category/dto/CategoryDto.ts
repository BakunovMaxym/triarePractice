import { StringField, UUIDField } from '../../../decorators/field.decorators';
import type { CategoryEntity } from '../entities/category.entity';

export class CategoryDto {

  @UUIDField()
  id!: Uuid

  @StringField()
  name!: string;

  constructor(category: CategoryEntity) {
    this.id = category.id;
    this.name = category.name;
  }
}
