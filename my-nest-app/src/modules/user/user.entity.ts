import {
  Column, Entity, ManyToMany,
  OneToMany,
  OneToOne
} from 'typeorm';

import { AbstractEntity } from '../../common/abstract.entity.ts';
import { RoleType } from '../../constants/role-type.ts';
import { UseDto } from '../../decorators/use-dto.decorator.ts';
import { UserDto } from './dtos/user.dto.ts';
import { CourseEntity } from '../../modules/course/entities/course.entity.ts';
import { UserTask } from '../../modules/user-tasks/entities/user-task.entity.ts';

@Entity({ name: 'users' })
@UseDto(UserDto)
export class UserEntity extends AbstractEntity<UserDto> {
  @Column({ nullable: true, type: 'varchar' })
  firstName!: string;

  @Column({ type: 'varchar' })
  lastName!: string;

  @Column({ type: 'enum', enum: RoleType, default: RoleType.STUDENT })
  role!: RoleType;

  @Column({ unique: true, type: 'varchar' })
  email!: string;

  @Column({ type: 'varchar' })
  password!: string;

  @OneToMany(() => CourseEntity, (courseEntity) => courseEntity.owner)
  ownCourses?: CourseEntity[];

  @ManyToMany(() => CourseEntity, (courseEntity) => courseEntity.teachers)
  teachCourses?: CourseEntity[];

  @ManyToMany(() => CourseEntity, (courseEntity) => courseEntity.students)
  studentCourses?: CourseEntity[];

  @OneToOne(() => UserTask, (userTask) => userTask.user)
  userTasks?: UserTask[];
}
