import { DateFieldOptional, EnumField, NumberFieldOptional, UUIDField } from '../../../decorators/field.decorators';
import { UserNameDto } from '../../../modules/user/dtos/UserNameDto';
import type { UserTask } from '../entities/user-task.entity';
import { TaskStatus } from '../../../constants/status-type';
import { TaskNameDto } from '../../../modules/tasks/dto/TaskNameDto';

export class UserTaskDto {

  @UUIDField({ description: 'ID завдання користувача' })
  id: Uuid;

  @EnumField(() => TaskStatus)
  status!: TaskStatus;

  @DateFieldOptional({ nullable: true })
  deadline!: Date | null;

  @DateFieldOptional({ nullable: true })
  completeTimestamp!: Date | undefined;

  student!: UserNameDto;

  task!: TaskNameDto;

  @NumberFieldOptional({ nullable: true, minimum: 0, maximum: 100 })
  grade?: number | null;

  createdAt!: Date;

  constructor(userTask: UserTask) {
    this.id = userTask.id;
    this.status = userTask.status;
    this.deadline = userTask.deadline || null;
    this.completeTimestamp = userTask.completeTimestamp;
    this.student = new UserNameDto(userTask.student);
    this.task = new TaskNameDto(userTask.task);
    this.grade = userTask.grade ?? null;
    this.createdAt = userTask.createdAt
  }
}
