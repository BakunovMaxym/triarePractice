import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { CroneTaskService } from '../../modules/crone-task/crone-task.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import { TaskEntity } from '../../modules/tasks/entities/task.entity';

type GroupedByStudent = Record<string, UserTask[]>;
type GroupedByTask = Record<string, UserTask[]>;

@Injectable()
export class UserTasksService {
  constructor(
    private readonly googleDriveService: GoogleDriveService,
    private readonly mailService: MailerService,
    private readonly croneTaskService: CroneTaskService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(UserTask)
    private readonly userTasksRepository: Repository<UserTask>,
    @InjectRepository(UserTaskFileEntity)
    private readonly userTaskFileRepository: Repository<UserTaskFileEntity>,
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
  ) { }


  async deleteCache(taskey: string) {
    const keys: string[] = await this.cacheManager.store.keys(taskey);

    if (keys.length > 0) {
      for (const key of keys) {
        await this.cacheManager.store.del(key);
      }
    }
  }


  async create(createDto: CreateUserTaskDto, taskId?: Uuid,): Promise<UserTask> {
    if (taskId) {
      const task = await this.taskRepository.findOne({ where: { id: taskId } })
      if (!task) throw new NotFoundException
      createDto.task = task
      if (task.timeToComplete) {
      createDto.deadline = new Date(Date.now() + Number(task.timeToComplete) * 1000);
    }
    }

    const userTask = this.userTasksRepository.create(createDto);
    const savedUserTask = await this.userTasksRepository.save(userTask);

    if(!taskId){
      try {
        await this.mailService.sendMail({
          to: `${userTask.student.email}`,
          subject: "Нове завдання",
          html: `
          <p>У вас нове завдання від <strong>${userTask.task.owner.lastName}</strong>:
          <a href="http://localhost:3000/user-task/${userTask.id}"> ${userTask.task.name}</a></p>`
        })
      } catch (err) {
        console.log(err);
      }
    }

    await this.deleteCache(`user-tasks:student:${savedUserTask.student.id}:${savedUserTask.task.course.id}`)
    await this.deleteCache(`user-tasks:single:${savedUserTask.student.id}:*:*`)
    await this.deleteCache(`user-tasks:single:*:${savedUserTask.task.id}:*`)
    await this.deleteCache(`user-tasks:byId:${savedUserTask.id}:*:*`)

    return savedUserTask;
  }

  async findAllToTask(taskId: Uuid): Promise<GroupedByStudent> {
    const cacheKey = `user-tasks:task:${taskId}`;
    const cached: UserTask[] | undefined = await this.cacheManager.get(cacheKey);
    const utasks = cached
      ? plainToInstance(UserTask, cached)
      : await this.userTasksRepository.find({ where: { task: { id: taskId } }, order: { createdAt: 'DESC' }, });

    if (!cached) {
      await this.cacheManager.set(cacheKey, utasks);
    }

    const grouped: GroupedByStudent = utasks.reduce((acc, ut) => {
      const sid = ut.student.id;
      if (!acc[sid]) acc[sid] = [];
      acc[sid].push(ut);
      return acc;
    }, {} as GroupedByStudent);

    return grouped;
  }

  async findAllToStudent(studentId: Uuid, user: UserEntity, courseId: Uuid): Promise<GroupedByTask> {
    if (user.role !== RoleType.TEACHER && user.id !== studentId) {
      throw new ForbiddenException();
    }

    const cacheKey = `user-tasks:student:${studentId}:${courseId}`;
    const cached: UserTask[] | undefined = await this.cacheManager.get(cacheKey);
    const utasks = cached
      ? plainToInstance(UserTask, cached)
      : await this.userTasksRepository.find({
        where: {
          student: { id: studentId },
          task: { course: { id: courseId } },
        },
        order: { createdAt: 'DESC' },
      });

    if (!cached) {
      await this.cacheManager.set(cacheKey, utasks);
    }

    const grouped: GroupedByTask = utasks.reduce((acc, ut) => {
      const tid = ut.task.id;
      if (!acc[tid]) acc[tid] = [];
      acc[tid].push(ut);
      return acc;
    }, {} as GroupedByTask);

    return grouped;
  }

  //@ts-ignore
  async findOne(taskId: Uuid, userId: Uuid, userRole: RoleType): Promise<SingleUserTaskDto> {
    const cacheKey = `user-tasks:single:${userId}:${taskId}:${userRole}`;
    const cached: SingleUserTaskDto | undefined = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const found = await this.userTasksRepository.findOne({
      where: {
        task: { id: taskId },
        student: { id: userId },
      },
      order: {
        createdAt: 'DESC',
      },
      relations: [
        'task',
        'task.fileContent',
        'task.comments',
        'task.comments.owner',
        'student',
        'fileContent',
      ],
    });

    if (found) {
      const singleUTaskDto = new SingleUserTaskDto(found, userRole === RoleType.TEACHER);
      await this.cacheManager.set(cacheKey, singleUTaskDto);
      return singleUTaskDto;
    }
  }

  async findById(
    userTaskId: Uuid,
    userId: Uuid,
    userRole: RoleType
  ): Promise<SingleUserTaskDto> {
    const cacheKey = `user-tasks:byId:${userTaskId}:${userId}:${userRole}`;
    const cached: SingleUserTaskDto | undefined = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const found = await this.userTasksRepository.findOne({
      where: { id: userTaskId },
      relations: [
        'task',
        'task.fileContent',
        'task.comments',
        'task.comments.owner',
        'student',
        'fileContent',
      ],
    });

    if (!found) {
      throw new NotFoundException();
    }

    if (userRole === RoleType.STUDENT && found.student.id !== userId) {
      throw new ForbiddenException();
    }

    const dto = new SingleUserTaskDto(found, userRole === RoleType.TEACHER);
    await this.cacheManager.set(cacheKey, dto);
    return dto;
  }



  async grade(id: Uuid, grade: number): Promise<SingleUserTaskDto> {
    const found = await this.userTasksRepository.findOneOrFail({
      where: { id },
      relations: ['task', 'task.fileContent', 'task.comments', 'student', 'fileContent'],
    });
    found.grade = grade;
    found.status = TaskStatus.GRADED;
    const saved = await this.userTasksRepository.save(found);

    try {
      await this.mailService.sendMail({
        to: `${found.student.email}`,
        subject: "Нова оцінка",
        html: `
        <h1>${found.task.course.name}</h1>
        <p>У вас нова оцінка за завдання <strong>${found.task.name}</strong>: ${found.grade}</p>`
      })
    } catch (err) {
      console.log(err);
    }

    await this.deleteCache(`user-task:task:${saved.task.id}`)
    await this.deleteCache(`user-tasks:student:${saved.student.id}:${saved.task.course.id}`)
    await this.deleteCache(`user-tasks:single:${saved.student.id}:*:*`)
    await this.deleteCache(`user-tasks:single:*:${saved.task.id}:*`)
    await this.deleteCache(`user-tasks:byId:${saved.id}:*:*`)

    return new SingleUserTaskDto(saved);
  }

  async reject(id: Uuid): Promise<SingleUserTaskDto> {
    const found = await this.userTasksRepository.findOneOrFail({
      where: { id },
      relations: ['task', 'task.fileContent', 'task.comments', 'student', 'fileContent'],
    });
    found.status = TaskStatus.REJECTED;
    found.grade = null;
    const saved = await this.userTasksRepository.save(found);

    try {
      await this.mailService.sendMail({
        to: `${found.student.email}`,
        subject: "Завдання відхилено",
        html: `
        <h1>${found.task.course.name}</h1>
        <p>Ваше завдання <strong>${found.task.name}</strong>, відхилено. Відредагуйте свій розв'язок та надлішліть повторно</p>`
      })
    } catch (err) {
      console.log(err);
    }

    await this.deleteCache(`user-task:task:${saved.task.id}`)
    await this.deleteCache(`user-tasks:student:${saved.student.id}:${saved.task.course.id}`)
    await this.deleteCache(`user-tasks:single:*:${saved.task.id}:*`)
    await this.deleteCache(`user-tasks:single:${saved.task.id}:*:*`)
    await this.deleteCache(`user-tasks:byId:${saved.id}:*:*`)


    return new SingleUserTaskDto(saved);
  }

  async acceptTask(userTaskId: Uuid, studentId: Uuid): Promise<SingleUserTaskDto> {
    const found = await this.userTasksRepository.findOne({
      where: { id: userTaskId },
      relations: ['task', 'task.fileContent', 'task.comments', 'student', 'fileContent'],
    });
    if (!found || studentId !== found.student.id) throw new NotFoundException("У вас нема такого завдання")

    if (found.status === TaskStatus.ACCEPTED) throw new ConflictException("Завдання вже прийнято")

    found.status = TaskStatus.ACCEPTED;
    if (found.task.timeToComplete) {
      found.deadline = new Date(Date.now() + Number(found.task.timeToComplete) * 1000);
    }

    if (found.deadline) this.croneTaskService.expireUserTask(found)

    const saved = await this.userTasksRepository.save(found);

    await this.deleteCache(`user-task:task:${saved.task.id}`)
    await this.deleteCache(`user-tasks:student:${saved.student.id}:${saved.task.course.id}`)
    await this.deleteCache(`user-tasks:single:${saved.student.id}:*:*`)
    await this.deleteCache(`user-tasks:single:*:${saved.task.id}:*`)
    await this.deleteCache(`user-tasks:byId:${saved.id}:*:*`)


    return new SingleUserTaskDto(saved);
  }

  async completeTask(files: Array<Express.Multer.File>, completeTaskDto: CompleteTaskDto): Promise<SingleUserTaskDto> {
    const found = await this.userTasksRepository.findOneOrFail({
      where: { id: completeTaskDto.userTaskId },
      relations: ['task', 'task.fileContent', 'task.comments', 'student', 'fileContent'],
    });
    if (completeTaskDto.studentId !== found.student.id) throw new NotFoundException

    if (found.status === TaskStatus.ASSIGNED || found.status === TaskStatus.SUBMITED || found.status === TaskStatus.SUBMITED_LATE) throw new ConflictException

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
          const correctedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
          return this.googleDriveService.uploadFile(stream, correctedName, file.mimetype);
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

    if (found.deadline) {
      if (!isNaN(found.deadline.getTime())) {
        found.status = found.completeTimestamp.getTime() <= found.deadline.getTime()
          ? TaskStatus.SUBMITED
          : TaskStatus.SUBMITED_LATE;
      }
    } else {
    found.status = TaskStatus.SUBMITED;
  }

    const updatedUserTask = await this.userTasksRepository.save(found);

    await this.deleteCache(`user-task:task:${updatedUserTask.task.id}`)
    await this.deleteCache(`user-tasks:student:${updatedUserTask.student.id}:${updatedUserTask.task.course.id}`)
    await this.deleteCache(`user-tasks:single:${updatedUserTask.student.id}:*:*`)
    await this.deleteCache(`user-tasks:single:*:${updatedUserTask.task.id}:*`)
    await this.deleteCache(`user-tasks:byId:${updatedUserTask.id}:*:*`)


    return new SingleUserTaskDto(updatedUserTask)
  }

  async deleteByid(taskId: Uuid, userId: Uuid,) {
    const userTask = await this.findOne(taskId, userId, RoleType.TEACHER)

    if (!userTask)
      return new NotFoundException("Завдання студента не знайдено")

    if (userTask.fileContent?.length !== 0)
      for (const file of userTask.fileContent) {
        this.googleDriveService.deleteFile(file.fileId);
        await this.userTaskFileRepository.delete(file.fileId);
      }

    const delres = this.userTaskFileRepository.delete(userTask.id)

    await this.deleteCache(`user-task:task:${userTask.task.id}`)
    await this.deleteCache(`user-tasks:student:${userTask.student.id}:${userTask.task.course.id}`)
    await this.deleteCache(`user-tasks:single:${userTask.student.id}:*:*`)
    await this.deleteCache(`user-tasks:single:*:${userTask.task.id}:*`)
    await this.deleteCache(`user-tasks:byId:${userTask.id}:*:*`)


    return delres;
  }
}
