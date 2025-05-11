import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
import { RoleType } from '../../constants/role-type';
import type { UserEntity } from 'modules/user/user.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UserTasksService {
  constructor(
    private readonly googleDriveService: GoogleDriveService,
    private readonly mailService: MailerService,
    @InjectRepository(UserTask)
    private readonly userTasksRepository: Repository<UserTask>,
    @InjectRepository(UserTaskFileEntity)
    private readonly userTaskFileRepository: Repository<UserTaskFileEntity>,
  ) { }

  async create(createDto: CreateUserTaskDto): Promise<UserTask> {
    const userTask = this.userTasksRepository.create(createDto);
    console.log(process.env.EMAIL_USERNAME);
    console.log(process.env.EMAIL_PASSWORD);
try{
  await this.mailService.sendMail({from: "LMS", to: "max.2006@ukr.net" /*`${userTask.student.email}`*/, subject: "info", text: `u've got new task: ${userTask.task.name}`})
} catch (err) {
  console.log(err);
}
    const savedUserTask = await this.userTasksRepository.save(userTask);
    return savedUserTask;
  }

  findAllToTask(taskId: Uuid): Promise<UserTask[]> {
    return this.userTasksRepository.find({ where: { task: { id: taskId } } });
  }

  findAllToStudent(studentId: Uuid, user: UserEntity): Promise<UserTask[]> {
    if(user.role !== RoleType.TEACHER && user.id !== studentId) throw new ForbiddenException
    return this.userTasksRepository.find({ where: { student: { id: studentId } } });
  }

  async findOne(id: Uuid, userRole: RoleType): Promise<SingleUserTaskDto> {
    const found = await this.userTasksRepository.findOneOrFail({ where: { id },
    relations: ['task', 'task.fileContent', 'task.comments', 'student', 'fileContent'],});

    return new SingleUserTaskDto(found, userRole === RoleType.TEACHER);
  }

  async grade(id: Uuid, grade: number): Promise<SingleUserTaskDto> {
    const found = await this.userTasksRepository.findOneOrFail({ where: { id },
    relations: ['task', 'task.fileContent', 'task.comments', 'student', 'fileContent'], });
    found.grade = grade;
    found.status = TaskStatus.GRADED;
    const saved = await this.userTasksRepository.save(found);

    return new SingleUserTaskDto(saved);
  }

  async reject(id: Uuid): Promise<SingleUserTaskDto> {
    const found = await this.userTasksRepository.findOneOrFail({ where: { id },
    relations: ['task', 'task.fileContent', 'task.comments', 'student', 'fileContent'], });
    found.status = TaskStatus.REJECTED;
    found.grade = null;
    const saved = await this.userTasksRepository.save(found);

    return new SingleUserTaskDto(saved);
  }

  async acceptTask(userTaskId: Uuid, studentId: Uuid): Promise<SingleUserTaskDto> {
    const found = await this.userTasksRepository.findOne({ where: {id: userTaskId},
    relations: ['task', 'task.fileContent', 'task.comments', 'student', 'fileContent'], });
    if (!found || studentId !== found.student.id) throw new NotFoundException("У вас нема такого завдання")

      if(found.status === TaskStatus.ACCEPTED) throw new ConflictException("Завдання вже прийнято")

    found.status = TaskStatus.ACCEPTED;
    found.deadline = new Date(Date.now() + Number(found.task.timeToComplete));
    const saved = await this.userTasksRepository.save(found);
    return new SingleUserTaskDto(saved);
  }

  async completeTask(files: Array<Express.Multer.File>, completeTaskDto: CompleteTaskDto): Promise<SingleUserTaskDto> {
    const found = await this.userTasksRepository.findOneOrFail({ where: { id: completeTaskDto.userTaskId },
      relations: ['task', 'task.fileContent', 'task.comments', 'student', 'fileContent'], });
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
          await this.googleDriveService.deleteFile(file.fileId);
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
        this.userTaskFileRepository.create({ ...meta, userTask: found })
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

}
