import { AbstractDto } from '../../../common/dto/abstract.dto';
import { StringField } from '../../../decorators/field.decorators';
import type { CategoryEntity } from '../entities/category.entity';

export class CategoryDto extends AbstractDto {
  @StringField()
  name?: string;

  constructor(category: CategoryEntity) {
    super(category)
    this.name = category.name;
  }
}
