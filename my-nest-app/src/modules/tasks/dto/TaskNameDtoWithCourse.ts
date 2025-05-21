import { StringField, UUIDField } from '../../../decorators/field.decorators';

export class TaskNameDtoWithCourse {

  @UUIDField()
  id: Uuid;

  @StringField()
  name: string;

  @StringField()
  courseName: string;

  constructor(task: any) {
    this.id = task.id;
    this.name = task.name;
    this.courseName = task.course.name;
  }
}
