import { UseDto } from '../../../decorators/use-dto.decorator';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CategoryDto } from '../dto/CategoryDto';
import { CourseEntity } from '../../../modules/course/entities/course.entity';
import { AbstractEntity } from '../../../common/abstract.entity';

@Entity({ name: 'categories' })
@UseDto(CategoryDto)
export class CategoryEntity extends AbstractEntity<CategoryDto> {
  @Column({ nullable: false, type: 'varchar', length: 255 })
  name!: string;

  @ManyToOne(() => CourseEntity, (courseEntity) => courseEntity.name)
  courses?: CourseEntity[];
}
