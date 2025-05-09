import { UserNameDto } from "../../../modules/user/dtos/UserNameDto";
import { AbstractDto } from "../../../common/dto/abstract.dto";
import type { Comment } from "../entities/comment.entity";
import { TaskNameDto } from "../../../modules/tasks/dto/TaskNameDto";

export class CommentDto extends AbstractDto {
  content!: string;
  task!: TaskNameDto;
  owner!: UserNameDto;

  constructor(entity: Comment) {
    super(entity);
    this.content = entity.content;
    this.task = new TaskNameDto(entity.task);
    this.owner = new UserNameDto(entity.owner);
  }
}