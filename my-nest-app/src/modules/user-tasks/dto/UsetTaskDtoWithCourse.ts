import type { UserTask } from '../entities/user-task.entity';
import { UserTaskDto } from './UsetTaskDto';
import { TaskNameDtoWithCourse } from '../../../modules/tasks/dto/TaskNameDtoWithCourse';

export class UserTaskDtoWithCourse extends UserTaskDto{
  declare task: TaskNameDtoWithCourse;

  constructor(userTask: UserTask) {
    super(userTask)
    this.task = new TaskNameDtoWithCourse(userTask.task);
  }
}
