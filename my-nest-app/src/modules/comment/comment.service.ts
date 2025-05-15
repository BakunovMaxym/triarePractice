import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UserEntity } from '../user/user.entity';
import { TaskEntity } from '../tasks/entities/task.entity';
import { CommentDto } from './dto/CommentDto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CommentService {
  constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,

    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,

    @InjectRepository(TaskEntity)
    private readonly tasksRepo: Repository<TaskEntity>,
  ) { }

  async deleteCache(key: string) {
    const keys: string[] = await this.cacheManager.store.keys(key);

    if (keys.length > 0) {
      for (const key of keys) {
        await this.cacheManager.store.del(key);
      }
    }
  }

  async create(taskId: Uuid, dto: CreateCommentDto): Promise<CommentDto> {
    const owner = await this.usersRepo.findOneBy({ id: dto.ownerId });
    if (!owner) throw new NotFoundException(`User ${dto.ownerId} not found`);

    const task = await this.tasksRepo.findOneBy({ id: taskId });
    if (!task) throw new NotFoundException(`Task ${taskId} not found`);

    const comment = this.commentsRepo.create({
      content: dto.content,
      owner,
      task,
    });
    const savedUser = await this.commentsRepo.save(comment);

    console.log(`tasks:single:${savedUser.task.id}`);
    this.deleteCache(`tasks:single:${savedUser.task.id}`)
    this.deleteCache(`comments:${savedUser.task.id}`)

    return new CommentDto(savedUser)
  }

  async findByTask(taskId: Uuid): Promise<CommentDto[]> {
    const cacheKey = `comments:${taskId}`;
    
            const cached: CommentDto[] | undefined = await this.cacheManager.get(cacheKey);
            if (cached) return cached;

    const comments = await this.commentsRepo.find({
      where: { task: { id: taskId as any } },
      relations: ['owner', 'task'],
      order: { createdAt: 'ASC' },
    });

    const finalComments = comments.map(com => new CommentDto(com))
    
    await this.cacheManager.set(cacheKey, finalComments);
    return finalComments;
  }

  async delete(id: Uuid): Promise<void> {
    const res = await this.commentsRepo.delete({ id });
    if (res.affected === 0) {
      throw new NotFoundException(`Comment ${id} not found`);
    }
  }
}
