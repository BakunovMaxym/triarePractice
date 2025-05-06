import { AbstractDto } from "../../../common/dto/abstract.dto";
import type { Comment } from "../entities/comment.entity";

export class CommentDto extends AbstractDto {
  content!: string;
  taskId!: Uuid;
  ownerId!: Uuid;

  constructor(entity: Comment) {
    super(entity);
    this.content = entity.content;
    this.taskId = entity.task.id;
    this.ownerId = entity.owner.id;
  }
}