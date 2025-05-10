import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTask } from './entities/user-task.entity';
import { CreateUserTaskDto } from './dto/create-user-task.dto';
import { SingleUserTaskDto } from './dto/SingleUserTaskDto';
import { TaskStatus } from '../../constants/status-type';
import type { CompleteTaskDto } from '../../modules/user-task-file/dto/CompleteTaskDto';
import { GoogleDriveService } from '../../modules/google-drive/google-drive.service';
import { PassThrough } from 'stream';
import { UserTaskFileEntity } from '../../modules/user-task-file/entities/user-task-file.entity';

@Injectable()
export class UserTasksService {
  constructor(
    private readonly googleDriveService: GoogleDriveService,
    @InjectRepository(UserTask)
    private readonly userTasksRepository: Repository<UserTask>,
    @InjectRepository(UserTaskFileEntity)
    private readonly userTaskFileRepository: Repository<UserTaskFileEntity>,
  ) { }

  async create(createDto: CreateUserTaskDto): Promise<UserTask> {
    // if (!timeToComplete) {
    createDto.deadline = undefined;
    // }else{
    //   createDto.deadline = new Date(Date.now() + timeToComplete)
    // }

    const userTask = this.userTasksRepository.create(createDto);
    const savedUserTask = await this.userTasksRepository.save(userTask);
    return savedUserTask;
  }

  findAllToTask(taskId: Uuid): Promise<UserTask[]> {
    return this.userTasksRepository.find({ where: { task: { id: taskId } } });
  }

  findAllToStudent(studentId: Uuid): Promise<UserTask[]> {
    return this.userTasksRepository.find({ where: { student: { id: studentId } } });
  }

  async findOne(id: Uuid): Promise<SingleUserTaskDto> {
    const found = await this.userTasksRepository.findOneOrFail({ where: { id } });
    return new SingleUserTaskDto(found);
  }

  async grade(id: Uuid, grade: number): Promise<SingleUserTaskDto> {
    const found = await this.userTasksRepository.findOneOrFail({ where: { id } });
    found.grade = grade;
    found.status = TaskStatus.GRADED;

    return new SingleUserTaskDto(found);
  }

  async reject(id: Uuid): Promise<SingleUserTaskDto> {
    const found = await this.userTasksRepository.findOneOrFail({ where: { id } });
    found.status = TaskStatus.REJECTED;

    return new SingleUserTaskDto(found);
  }

  // async update(id: Uuid, updateDto: UpdateUserTaskDto): Promise<UserTask> {
  //   const userTask = await this.findOne(id);
  //   Object.assign(userTask, updateDto);
  //   return this.userTasksRepository.save(userTask);
  // }

  async acceptTask(userTaskId: Uuid, studentId: Uuid): Promise<SingleUserTaskDto> {
    const found = await this.userTasksRepository.findOneOrFail({ where: { id: userTaskId } });
    if (studentId !== found.student.id) throw new NotFoundException

    found.status = TaskStatus.ACCEPTED;
    found.deadline = new Date(Date.now() + found.task.timeToComplete);
    return new SingleUserTaskDto(found);
  }

  async completeTask(files: Array<Express.Multer.File>, completeTaskDto: CompleteTaskDto): Promise<SingleUserTaskDto> {
    const found = await this.userTasksRepository.findOneOrFail({ where: { id: completeTaskDto.userTaskId } });
    if (completeTaskDto.studentId !== found.student.id) throw new NotFoundException

    if (found.fileContent.length !== 0) {
      let filesToKeepIds: string[] = [];
      if (completeTaskDto.fileContents) {
        filesToKeepIds = completeTaskDto.fileContents
          .filter(file => typeof file === 'object' && file !== null && 'fileId' in file)
          .map(file => file.fileId);
      }

      for (const file of found.fileContent) {
        if (!filesToKeepIds.includes(file.fileId)) {
          // console.log(`remove ${file.fileId}`)
          // await this.taskFileService.remove(file.fileId)

          await this.googleDriveService.deleteFile(file.fileId);
          // await this.taskFileRepository.delete(file.fileId);

          found.fileContent = found.fileContent.filter(f => f.fileId !== file.fileId);
        }
      }
    }

    if (files?.length) {
      const uploadedMeta = await Promise.all(
        files.map(file => {
          const stream = new PassThrough();
          stream.end(file.buffer);
          return this.googleDriveService.uploadFile(stream, file.originalname, file.mimetype);
        })
      );

      const fileEntities = uploadedMeta.map(meta =>
        this.userTasksRepository.create({ ...meta, found })
      );

      let allfiles: UserTaskFileEntity[] = [];

      if (completeTaskDto.fileContents) {
        allfiles = [...found.fileContent, ...fileEntities]
      } else {
        allfiles = [...fileEntities]
      }

      const savedFiles = await this.userTaskFileRepository.save(allfiles);

      found.fileContent = savedFiles;
    }

    found.completeTimestamp = new Date()

    if(found.deadline !== undefined && found.completeTimestamp <= found.deadline){
      found.status = TaskStatus.SUBMITED
    }else{
      found.status = TaskStatus.SUBMITED_LATE
    }

    const updatedUserTask = await this.userTasksRepository.save(found);
    
        return new SingleUserTaskDto(updatedUserTask)
  }

  // async remove(id: Uuid): Promise<void> {
  //   const userTask = await this.findOne(id);
  //   await this.userTasksRepository.remove(userTask);
  // }
}
