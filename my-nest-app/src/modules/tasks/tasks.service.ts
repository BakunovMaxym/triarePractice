import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class TaskService {
  async removeByName(name: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({ where: { name } });
    if (!task) {
      throw new NotFoundException(`Task with name ${name} not found`);
    }
    await this.taskRepository.delete({ name });
    return task;
  }
  constructor(
    @InjectRepository(TaskEntity)
    private taskRepository: Repository<TaskEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<TaskEntity> {
    const owner = await this.userRepository.findOne({ where: { id: createTaskDto.ownerId } });
    if (!owner) {
      throw new NotFoundException(`User with id ${createTaskDto.ownerId} not found`);
    }
    const task = this.taskRepository.create({
      name: createTaskDto.name,
      content: createTaskDto.content,
      state: createTaskDto.state,
      owner: owner.id,
    });
    return this.taskRepository.save(task);
  }

  async findAll(): Promise<TaskEntity[]> {
    return this.taskRepository.find({ relations: ['owner', 'comments', 'userTasks'] });
  }

  async findOneByName(name: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({
      where: { name },
      relations: ['owner', 'comments', 'userTasks'],
    });
    if (!task) {
      throw new NotFoundException(`Task with name ${name} not found`);
    }
    return task;
  }

  async updateByName(name: string, updateTaskDto: UpdateTaskDto): Promise<TaskEntity> {
    const task = await this.findOneByName(name);

    if (updateTaskDto.content) task.content = updateTaskDto.content;
    if (updateTaskDto.state) task.state = updateTaskDto.state;

    return this.taskRepository.save(task);
  }
}
