import { Column, Entity, /*, OneToMany, OneToOne, VirtualColumn */ 
OneToMany} from 'typeorm';

import { AbstractEntity } from '../../common/abstract.entity.ts';
import { RoleType } from '../../constants/role-type.ts';
import { UseDto } from '../../decorators/use-dto.decorator.ts';
// import { PostEntity } from '../post/post.entity.ts';
// import type { UserDtoOptions } from './dtos/user.dto.ts';
import { UserDto } from './dtos/user.dto.ts';
import { CourseEntity } from 'modules/course/entities/course.entity.ts';
// import { UserSettingsEntity } from './user-settings.entity.ts';

@Entity({ name: 'users' })
@UseDto(UserDto)
export class UserEntity extends AbstractEntity<UserDto> {
  @Column({ nullable: true, type: 'varchar' })
  firstName!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  lastName!: string | null;

  @Column({ type: 'enum', enum: RoleType, default: RoleType.STUDENT })
  role!: RoleType;

  @Column({ unique: true, nullable: true, type: 'varchar' })
  email!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  password!: string | null;

  @OneToMany(() => CourseEntity, (courseEntity) => courseEntity.owner)
  ownCourses?: CourseEntity[];

  @OneToMany(() => CourseEntity, (courseEntity) => courseEntity.teachers)
  teachCourses?: CourseEntity[];

  @OneToMany(() => CourseEntity, (courseEntity) => courseEntity.students)
  studentCourses?: CourseEntity[];
}
