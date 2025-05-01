import { Optional } from '@nestjs/common';
import { AbstractDto } from '../../../common/dto/abstract.dto';
import { DateField, EnumField, StringField, UUIDField } from '../../../decorators/field.decorators';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../../../constants/status-type';


export class CreateUserTaskDto extends AbstractDto {

  @UUIDField({
    description: 'Айді користувача',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId!: Uuid;

  @UUIDField({
    description: 'Айді завдання',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  taskId!: Uuid;

  @EnumField(() => TaskStatus, {
    description: 'Статус',
    example: 'Призначено',
  })
  status!: TaskStatus;

  @ApiProperty({
    description: 'Completion timestamp of the user task',
    example: '2023-10-01T12:00:00Z',
  })
  @Optional()
  @DateField()
  deadline?: string;
}