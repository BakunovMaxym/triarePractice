import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository }   from '@nestjs/typeorm';
import { Repository }         from 'typeorm';
import { Comment }      from './entities/comment.entity';
import { CreateCommentDto }   from './dto/create-comment.dto';
import { UserEntity }         from '../user/user.entity';
import { TaskEntity }         from '../tasks/entities/task.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,

    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,

    @InjectRepository(TaskEntity)
    private readonly tasksRepo: Repository<TaskEntity>,
  ) {}

  async create(dto: CreateCommentDto): Promise<Comment> {
    const owner = await this.usersRepo.findOneBy({ id: dto.ownerId });
    if (!owner) throw new NotFoundException(`User ${dto.ownerId} not found`);

    const task = await this.tasksRepo.findOneBy({ id: dto.taskId });
    if (!task) throw new NotFoundException(`Task ${dto.taskId} not found`);

    
    const comment = this.commentsRepo.create({
      ...dto,
      owner: { id: owner.id },
      task: { id: task.id },
    });
    return this.commentsRepo.save(comment);
  }

  async findByTask(taskId: Uuid): Promise<Comment[]> {
    return this.commentsRepo.find({
      where: { task: { id: taskId as any } },
      relations: ['owner', 'task'],
      order: { createdAt: 'ASC' },
    });
  }

  async delete(id: Uuid): Promise<void> {
    const res = await this.commentsRepo.delete({ id });
    if (res.affected === 0) {
      throw new NotFoundException(`Comment ${id} not found`);
    }
  }
}
