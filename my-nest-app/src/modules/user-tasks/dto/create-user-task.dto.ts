import { EnumField } from '../../../decorators/field.decorators';
import { TaskStatus } from '../../../constants/status-type';
import type { UserEntity } from '../../../modules/user/user.entity';
import type { TaskEntity } from '../../../modules/tasks/entities/task.entity';


export class CreateUserTaskDto {

  student!: UserEntity;

  task!: TaskEntity;

  @EnumField(() => TaskStatus, {
    description: 'Статус',
    example: 'Призначено',
    default: TaskStatus.ASSIGNED
  })
  status!: TaskStatus;

  deadline?: Date | undefined;
}