import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UserEntity } from '../user/user.entity';
import { TaskEntity } from '../tasks/entities/task.entity';
import { CommentDto } from './dto/CommentDto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,

    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,

    @InjectRepository(TaskEntity)
    private readonly tasksRepo: Repository<TaskEntity>,
  ) { }

  async create(taskId: Uuid, dto: CreateCommentDto): Promise<CommentDto> {
    const owner = await this.usersRepo.findOneBy({ id: dto.ownerId });
    if (!owner) throw new NotFoundException(`User ${dto.ownerId} not found`);

    const task = await this.tasksRepo.findOneBy({ id: taskId });
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);

    // Only use content from DTO, and assign relations directly
    const comment = this.commentsRepo.create({
      content: dto.content,
      owner,
      task,
    });
    const savedUser = await this.commentsRepo.save(comment);
    return new CommentDto(savedUser)
  }

  async findByTask(taskId: Uuid): Promise<CommentDto[]> {
    const comments = await this.commentsRepo.find({
      where: { task: { id: taskId as any } },
      relations: ['owner', 'task'],
      order: { createdAt: 'ASC' },
    });
    return comments.map(com => new CommentDto(com))
  }

  async delete(id: Uuid): Promise<void> {
    const res = await this.commentsRepo.delete({ id });
    if (res.affected === 0) {
      throw new NotFoundException(`Comment ${id} not found`);
    }
  }
}
