import { ApiProperty } from '@nestjs/swagger';
import { StringField, UUIDField } from '../../../decorators/field.decorators';
import { UserNameDto } from '../../../modules/user/dtos/UserNameDto';
import { CourseNameDto } from '../../../modules/course/dto/CourseNameDto';
import type { TaskEntity } from '../entities/task.entity';

export class TaskDto {

  @UUIDField({ description: 'ID завдання' })
  id: Uuid;

  @ApiProperty({
    description: 'Назва завдання',
    example: 'Завдання-1',
  })
  @StringField()
  name: string;

  @ApiProperty({
    description: 'Власник завдання',
  })
  owner?: UserNameDto;

  @ApiProperty({
    description: 'Курс',
  })
  course: CourseNameDto;

  @ApiProperty({
    description: 'Час на виконання',
  })
  timeToComplete: number;


  constructor(task: TaskEntity) {
    this.id = task.id;
    this.name = task.name;
    this.owner = task.owner ? new UserNameDto(task.owner) : undefined;
    this.course = new CourseNameDto(task.course);
    this.timeToComplete = task.timeToComplete;
  }
}
