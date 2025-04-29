import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTask } from './entities/user-task.entity';
import { CreateUserTaskDto } from './dto/create-user-task.dto';
import { UpdateUserTaskDto } from './dto/update-user-task.dto';

@Injectable()
export class UserTasksService {
  constructor(
    @InjectRepository(UserTask)
    private readonly userTasksRepository: Repository<UserTask>,
  ) {}

  async create(createDto: CreateUserTaskDto): Promise<UserTask> {
    const userTask = this.userTasksRepository.create(createDto);
    return this.userTasksRepository.save(userTask);
  }

  findAll(): Promise<UserTask[]> {
    return this.userTasksRepository.find();
  }

  async findOne(id: Uuid): Promise<UserTask> {
    const found = await this.userTasksRepository.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`UserTask with id ${id} not found`);
    return found;
  }

  async update(id: Uuid, updateDto: UpdateUserTaskDto): Promise<UserTask> {
    const userTask = await this.findOne(id);
    Object.assign(userTask, updateDto);
    return this.userTasksRepository.save(userTask);
  }

  async remove(id: Uuid): Promise<void> {
    const userTask = await this.findOne(id);
    await this.userTasksRepository.remove(userTask);
  }
}
