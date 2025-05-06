import { StringField, UUIDField } from '../../../decorators/field.decorators';
import type { TaskEntity } from '../entities/task.entity';

export class TaskNameDto {

  @UUIDField()
  id: Uuid;

  @StringField()
  name: string;

  constructor(task: any) {
    this.id = task.id;
    this.name = task.name;
  }
}
