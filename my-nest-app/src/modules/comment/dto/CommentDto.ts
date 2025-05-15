import { UserNameDto } from "../../../modules/user/dtos/UserNameDto";
import type { Comment } from "../entities/comment.entity";

export class CommentDto {
   id: string;
  content?: string;
  createdAt: Date;
  owner?: UserNameDto;

  constructor(comment: Comment) {
    this.id = comment.id;
    this.content = comment.content;
    this.createdAt = comment.createdAt;
    this.owner = comment.owner ? new UserNameDto(comment.owner) : undefined;
  }
}