import { Injectable } from '@nestjs/common';
import { CreateTaskFileDto } from './dto/create-task-file.dto';
import { UpdateTaskFileDto } from './dto/update-task-file.dto';
import type { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskFileEntity } from './entities/task-file.entity';
import type { TaskEntity } from '../../modules/tasks/entities/task.entity';

@Injectable()
export class TaskFileService {
  constructor(
    @InjectRepository(TaskFileEntity)
    private readonly repo: Repository<TaskFileEntity>,
  ) { }


  async create(
    dtos: CreateTaskFileDto[],
    task: TaskEntity,
  ): Promise<void> {
    if (!dtos?.length) return;

    const entities = dtos.map(dto => {
      const entity = this.repo.create({
        fileId: dto.fileId,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        task,
      });
      return entity;
    });

    await this.repo.save(entities);
  }


  findAll() {
    return `This action returns all taskFile`;
  }

  findOne(id: number) {
    return `This action returns a #${id} taskFile`;
  }

  update(id: number, updateTaskFileDto: UpdateTaskFileDto) {
    return `This action updates a #${id} taskFile`;
  }

  remove(id: number) {
    return `This action removes a #${id} taskFile`;
  }
}
