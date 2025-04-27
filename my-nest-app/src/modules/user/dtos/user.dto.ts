import { AbstractDto } from '../../../common/dto/abstract.dto.ts';
import { RoleType } from '../../../constants/role-type.ts';
import {
  StringFieldOptional,
  EnumFieldOptional,
  EmailFieldOptional,
} from '../../../decorators/field.decorators.ts';
import type { UserEntity } from '../user.entity.ts';
import { CourseDto } from '../../../modules/course/dto/CourseDto';

export class UserDto extends AbstractDto {
  @StringFieldOptional({ nullable: true })
  firstName?: string | null;

  @StringFieldOptional({ nullable: true })
  lastName?: string | null;

  @EnumFieldOptional(() => RoleType)
  role?: RoleType;

  @EmailFieldOptional({ nullable: true })
  email?: string | null;

  ownCourses?: CourseDto[];

  teachCourses?: CourseDto[];

  studentCourses?: CourseDto[];

  constructor(user: UserEntity) {
    super(user);

    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.role = user.role;
    this.email = user.email;

    this.ownCourses = user.ownCourses?.map((course) => course.toDto());
    this.teachCourses = user.teachCourses?.map((course) => course.toDto());
    this.studentCourses = user.studentCourses?.map((course) => course.toDto());
  }
}
