import { UseDto } from '../../../decorators/use-dto.decorator';
import { Column, Entity, ManyToOne } from 'typeorm';
import { SubCategoryDto } from '../dto/SubCategoryDto';
import { CourseEntity } from '../../../modules/course/entities/course.entity';
import { AbstractEntity } from '../../../common/abstract.entity';

@Entity({ name: 'categories' })
@UseDto(SubCategoryDto)
export class SubCategoryEntity extends AbstractEntity<SubCategoryDto> {
  @Column({ nullable: false, type: 'varchar', length: 255 })
  name!: string;

  @ManyToOne(() => CourseEntity, (courseEntity) => courseEntity.name)
  courses?: CourseEntity[];
}
