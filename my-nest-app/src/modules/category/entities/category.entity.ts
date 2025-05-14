import { UseDto } from '../../../decorators/use-dto.decorator';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';
import { CategoryDto } from '../dto/CategoryDto';
import { CourseEntity } from '../../../modules/course/entities/course.entity';
import { AbstractEntity } from '../../../common/abstract.entity';

@Entity({ name: 'categories' })
@UseDto(CategoryDto)
export class CategoryEntity extends AbstractEntity {
  @Column({ nullable: false, type: 'varchar', length: 255, unique: true })
  name!: string;

  @ManyToOne(() => CourseEntity, (courseEntity) => courseEntity.category)
  courses?: CourseEntity[];

  @BeforeInsert()
  @BeforeUpdate()
  normalizeName() {
    const fLetter = this.name.slice(0, 1).toUpperCase();
    const remainLetters = this.name.slice(1).toLowerCase();

    this.name = fLetter + remainLetters;
  }
}
