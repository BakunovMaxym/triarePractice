import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskFileDto } from './dto/create-task-file.dto';
import type { DeleteResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskFileEntity } from './entities/task-file.entity';
import { TaskEntity } from '../../modules/tasks/entities/task.entity';
import { GoogleDriveService } from '../../modules/google-drive/google-drive.service';

@Injectable()
export class TaskFileService {
  constructor(
    private readonly googleDriveService: GoogleDriveService,
    @InjectRepository(TaskFileEntity)
    private readonly taskFieldRepository: Repository<TaskFileEntity>,
  ) { }


  async create(
    dtos: CreateTaskFileDto[],
    task: TaskEntity,
  ): Promise<void> {
    if (!dtos?.length) return;

    const entities = dtos.map(dto => {
      const entity = this.taskFieldRepository.create({
        fileId: dto.fileId,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        task,
      });
      return entity;
    });

    await this.taskFieldRepository.save(entities);
  }


  // findAll() {
  //   return `This action returns all taskFile`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} taskFile`;
  // }

  // update(id: number, updateTaskFileDto: UpdateTaskFileDto) {
  //   return `This action updates a #${id} taskFile`;
  // }

  async remove(fileId: string): Promise<DeleteResult> {
    const file = await this.taskFieldRepository.findOne({
      where: { fileId },
      relations: {
        task: true
      },
    });

    if (!file) throw new NotFoundException;

    await this.googleDriveService.deleteFile(file.fileId);

    const deleted = this.taskFieldRepository.delete(file.fileId);

    return deleted;
  }
}
