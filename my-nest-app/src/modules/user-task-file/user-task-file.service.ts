import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserTaskFileDto } from './dto/create-user-task-file.dto';
import type { DeleteResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserTaskFileEntity } from './entities/user-task-file.entity';
import { TaskEntity } from '../tasks/entities/task.entity';
import { GoogleDriveService } from '../google-drive/google-drive.service';

@Injectable()
export class UserTaskFileService {
  constructor(
    private readonly googleDriveService: GoogleDriveService,
    @InjectRepository(UserTaskFileEntity)
    private readonly userTaskFileRepository: Repository<UserTaskFileEntity>,
  ) { }


  async create(
    dtos: CreateUserTaskFileDto[],
    task: TaskEntity,
  ): Promise<void> {
    if (!dtos?.length) return;

    const entities = dtos.map(dto => {
      const entity = this.userTaskFileRepository.create({
        fileId: dto.fileId,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        task,
      });
      return entity;
    });

    await this.userTaskFileRepository.save(entities);
  }

  async remove(fileId: string): Promise<DeleteResult> {
    const file = await this.userTaskFileRepository.findOne({
      where: { fileId },
      relations: {
        userTask: true
      },
    });

    if (!file) throw new NotFoundException;

    await this.googleDriveService.deleteFile(file.fileId);

    const deleted = this.userTaskFileRepository.delete(file.fileId);

    return deleted;
  }
}
