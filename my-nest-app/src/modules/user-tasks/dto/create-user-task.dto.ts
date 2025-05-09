import { AbstractDto } from '../../../common/dto/abstract.dto';
import { EnumField, UUIDField } from '../../../decorators/field.decorators';
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
    default: TaskStatus.ASSIGNED
  })
  status!: TaskStatus;

  deadline?: Date | null;
}