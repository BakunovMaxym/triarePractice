import { ApiProperty } from "@nestjs/swagger";
import type { CourseEntity } from "../entities/course.entity";
import { UserNameDto } from "../../../modules/user/dtos/UserNameDto";
import { DateField, StringField, UUIDField } from "../../../decorators/field.decorators";

export class CourseInfoDto {
  @UUIDField({ description: 'ID курсу' })
  id: Uuid;

  @StringField({ description: 'Назва курсу' })
  name: string;

  @ApiProperty({ type: () => UserNameDto, description: 'Власник курсу' })
  owner: UserNameDto;

  @ApiProperty({ type: [UserNameDto], description: 'Список викладачів курсу' })
  teachers: UserNameDto[];

  @ApiProperty({ type: [UserNameDto], description: 'Список студентів курсу' })
  students: UserNameDto[];

  @StringField({ description: 'Назва категорії курсу' })
  categoryName: string;

  @StringField({ description: 'Назва категорії курсу' })
  subCategoryName: string;

  @DateField({ description: 'Дата створення курсу', format: 'date-time' })
  createdAt: Date;

  constructor(course: CourseEntity) {
    this.id = course.id;
    this.name = course.name;
    this.owner = course.owner ? new UserNameDto(course.owner) : null;
    this.teachers = Array.isArray(course.teachers)
      ? course.teachers.map((t: any) => new UserNameDto(t))
      : [];
    this.students = Array.isArray(course.students)
      ? course.students.map((s: any) => new UserNameDto(s))
      : [];
    this.categoryName = course.category?.name;
    this.subCategoryName = course.subCategory?.name;
    this.createdAt = course.createdAt;


  }
}