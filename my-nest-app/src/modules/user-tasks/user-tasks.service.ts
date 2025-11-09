import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
import { CroneTaskService } from '../../modules/crone-task/crone-task.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import { TaskEntity } from '../../modules/tasks/entities/task.entity';
import { MailerService } from '@nestjs-modules/mailer';
// import { MailService } from '../../shared/mail/mail.service';

type GroupedByStudent = Record<string, UserTask[]>;
type GroupedByTask = Record<string, UserTask[]>;
type GroupedByCourse = Record<string, UserTask[]>;

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

  private async deleteByPattern(pattern: string) {
    const anyStore: any = this.cacheManager.store as any;
    if (typeof anyStore?.delPattern === 'function') {
      await anyStore.delPattern(pattern);
      return;
    }
    if (typeof anyStore?.keys === 'function') {
      const keys: string[] = await anyStore.keys(pattern);
      if (keys?.length) {
        await Promise.all(keys.map((k) => this.cacheManager.del(k)));
      }
      return;
    }
  }

  private async purgeUserTaskCache(ut: Pick<UserTask, 'id' | 'student' | 'task'>) {
    const userTaskId = ut.id;
    const studentId = ut.student?.id;
    const taskId = ut.task?.id;
    const courseId = ut.task?.course?.id;

    if (!userTaskId && !studentId && !taskId) return;

    const patterns = new Set<string>();

    if (userTaskId) patterns.add(`user-tasks:byId:${userTaskId}:*:*`);
    if (studentId && taskId) patterns.add(`user-tasks:single:${studentId}:${taskId}:*`);
    if (taskId) patterns.add(`user-tasks:single:*:${taskId}:*`);

    if (taskId) patterns.add(`user-tasks:task:${taskId}`);
    if (studentId && courseId) patterns.add(`user-tasks:student:${studentId}:${courseId}`);
    if (studentId) patterns.add(`user-tasks:student:${studentId}:accepted`);

    await Promise.all([...patterns].map((p) => this.deleteByPattern(p)));
  }

  async create(createDto: CreateUserTaskDto, taskId?: Uuid): Promise<UserTask> {
    if (taskId) {
      const task = await this.taskRepository.findOne({ where: { id: taskId } });
      if (!task) throw new NotFoundException();
      createDto.task = task;
      if (task.timeToComplete) {
        createDto.deadline = new Date(Date.now() + Number(task.timeToComplete) * 1000);
      }
    }

    const userTask = this.userTasksRepository.create(createDto);
    const savedUserTask = await this.userTasksRepository.save(userTask);

    try {
      if (!taskId) {
        await this.mailService.sendMail({
          to: `${userTask.student.email}`,
          subject: 'Нове завдання',
          html: `<p>У вас нове завдання від <strong>${userTask.task.owner.lastName}</strong>:
                 <a href="http://localhost:3000/user-task/${userTask.id}">${userTask.task.name}</a></p>`,
        });
      }
    } catch (err) {
      console.log(err);
    }

    await this.purgeUserTaskCache(savedUserTask);
    return savedUserTask;
  }

  async findAllToTask(taskId: Uuid): Promise<GroupedByStudent> {
    const cacheKey = `user-tasks:task:${taskId}`;
    const cached: UserTask[] | undefined = await this.cacheManager.get(cacheKey);
    const utasks = cached
      ? plainToInstance(UserTask, cached)
      : await this.userTasksRepository.find({ where: { task: { id: taskId } }, order: { createdAt: 'DESC' } });

    if (!cached) await this.cacheManager.set(cacheKey, utasks);

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
        where: { student: { id: studentId }, task: { course: { id: courseId } } },
        order: { createdAt: 'DESC' },
      });

    if (!cached) await this.cacheManager.set(cacheKey, utasks);

    const grouped: GroupedByTask = utasks.reduce((acc, ut) => {
      const tid = ut.task.id;
      if (!acc[tid]) acc[tid] = [];
      acc[tid].push(ut);
      return acc;
    }, {} as GroupedByTask);

    return grouped;
  }

  async findAllAcceptedToStudent(studentId: Uuid, user: UserEntity): Promise<GroupedByTask> {
    if (user.role !== RoleType.TEACHER && user.id !== studentId) {
      throw new ForbiddenException();
    }

    const cacheKey = `user-tasks:student:${studentId}:accepted`;
    const cached: UserTask[] | undefined = await this.cacheManager.get(cacheKey);
    const utasks = cached
      ? plainToInstance(UserTask, cached)
      : await this.userTasksRepository.find({
        where: {
          student: { id: studentId },
          task: { course: true },
          status: In([TaskStatus.ACCEPTED, TaskStatus.EXPIRED]),
        },
        order: { createdAt: 'DESC' },
      });

    if (!cached) await this.cacheManager.set(cacheKey, utasks);

    const grouped: GroupedByCourse = utasks.reduce((acc, ut) => {
      const cid = ut.task.course.id;
      if (!acc[cid]) acc[cid] = [];
      acc[cid].push(ut);
      return acc;
    }, {} as GroupedByCourse);

    return grouped;
  }

  async findOne(taskId: Uuid, userId: Uuid, userRole: RoleType): Promise<SingleUserTaskDto> {
    const cacheKey = `user-tasks:single:${userId}:${taskId}:${userRole}`;
    const cached: SingleUserTaskDto | undefined = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const found = await this.userTasksRepository
      .createQueryBuilder('userTask')
      .leftJoinAndSelect('userTask.task', 'task')
      .leftJoinAndSelect('task.fileContent', 'taskFileContent')
      .leftJoinAndSelect('task.comments', 'taskComments')
      .leftJoinAndSelect('taskComments.owner', 'commentOwner')
      .leftJoinAndSelect('userTask.student', 'student')
      .leftJoinAndSelect('userTask.fileContent', 'userFileContent')
      .where('task.id = :taskId', { taskId })
      .andWhere('student.id = :userId', { userId })
      .orderBy('taskComments.createdAt', 'DESC')
      .getOne();

    if (found) {
      const dto = new SingleUserTaskDto(found, userRole === RoleType.TEACHER);
      await this.cacheManager.set(cacheKey, dto);
      return dto;
    }

    throw new NotFoundException();
  }

  async findById(userTaskId: Uuid, userId: Uuid, userRole: RoleType): Promise<SingleUserTaskDto> {
    const cacheKey = `user-tasks:byId:${userTaskId}:${userId}:${userRole}`;
    const cached: SingleUserTaskDto | undefined = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const found = await this.userTasksRepository
      .createQueryBuilder('userTask')
      .leftJoinAndSelect('userTask.task', 'task')
      .leftJoinAndSelect('task.fileContent', 'taskFileContent')
      .leftJoinAndSelect('task.comments', 'taskComments')
      .leftJoinAndSelect('taskComments.owner', 'commentOwner')
      .leftJoinAndSelect('userTask.student', 'student')
      .leftJoinAndSelect('userTask.fileContent', 'userFileContent')
      .where('userTask.id = :userTaskId', { userTaskId })
      .orderBy('taskComments.createdAt', 'DESC')
      .getOne();

    if (!found) throw new NotFoundException();
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
      relations: ['task', 'task.fileContent', 'task.comments', 'student', 'fileContent', 'task.course'],
    });
    found.grade = grade;
    found.status = TaskStatus.GRADED;
    const saved = await this.userTasksRepository.save(found);

    try {
      await this.mailService.sendMail({
        to: `${found.student.email}`,
        subject: 'Нова оцінка',
        html: `<h1>${found.task.course.name}</h1>
               <p>У вас нова оцінка за завдання <strong>${found.task.name}</strong>: ${found.grade}</p>`,
      });
    } catch (err) {
      console.log(err);
    }

    await this.purgeUserTaskCache(saved);
    return new SingleUserTaskDto(saved);
  }

  async reject(id: Uuid): Promise<SingleUserTaskDto> {
    const found = await this.userTasksRepository.findOneOrFail({
      where: { id },
      relations: ['task', 'task.fileContent', 'task.comments', 'student', 'fileContent', 'task.course'],
    });
    found.status = TaskStatus.REJECTED;
    found.grade = null;
    const saved = await this.userTasksRepository.save(found);

    try {
      await this.mailService.sendMail({
        to: `${found.student.email}`,
        subject: 'Завдання відхилено',
        html: `<h1>${found.task.course.name}</h1>
               <p>Ваше завдання <strong>${found.task.name}</strong> відхилено. Відредагуйте розв’язок і надішліть повторно</p>`,
      });
    } catch (err) {
      console.log(err);
    }

    await this.purgeUserTaskCache(saved);
    return new SingleUserTaskDto(saved);
  }

  async acceptTask(userTaskId: Uuid, studentId: Uuid): Promise<SingleUserTaskDto> {
    const found = await this.userTasksRepository.findOne({
      where: { id: userTaskId },
      relations: ['task', 'task.fileContent', 'task.comments', 'student', 'fileContent', 'task.course'],
    });
    if (!found || studentId !== found.student.id) throw new NotFoundException('У вас нема такого завдання');
    if (found.status === TaskStatus.ACCEPTED) throw new ConflictException('Завдання вже прийнято');

    found.status = TaskStatus.ACCEPTED;
    if (found.task.timeToComplete) {
      found.deadline = new Date(Date.now() + Number(found.task.timeToComplete) * 1000);
    }
    if (found.deadline) this.croneTaskService.expireUserTask(found);

    const saved = await this.userTasksRepository.save(found);
    await this.purgeUserTaskCache(saved);
    return new SingleUserTaskDto(saved);
  }

  async completeTask(files: Array<Express.Multer.File>, completeTaskDto: CompleteTaskDto): Promise<SingleUserTaskDto> {
    const found = await this.userTasksRepository.findOneOrFail({
      where: { id: completeTaskDto.userTaskId },
      relations: ['task', 'task.fileContent', 'task.comments', 'student', 'fileContent', 'task.course'],
    });
    if (completeTaskDto.studentId !== found.student.id) throw new NotFoundException();

    if ([TaskStatus.ASSIGNED, TaskStatus.SUBMITED, TaskStatus.SUBMITED_LATE].includes(found.status))
      throw new ConflictException();

    if (found.fileContent.length !== 0) {
      let filesToKeepIds: string[] = [];
      if (completeTaskDto.fileContents) {
        filesToKeepIds = completeTaskDto.fileContents
          .filter((file) => typeof file === 'object' && file !== null && 'fileId' in file)
          .map((file) => (file as any).fileId);
      }
      for (const file of found.fileContent) {
        if (!filesToKeepIds.includes(file.fileId)) {
          await this.googleDriveService.deleteFile(file.fileId);
          found.fileContent = found.fileContent.filter((f) => f.fileId !== file.fileId);
        }
      }
    }

    if (files?.length) {
      const uploadedMeta = await Promise.all(
        files.map((file) => {
          const stream = new PassThrough();
          stream.end(file.buffer);
          const correctedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
          return this.googleDriveService.uploadFile(stream, correctedName, file.mimetype);
        }),
      );

      const fileEntities = uploadedMeta.map((meta) => this.userTaskFileRepository.create({ ...meta, userTask: found }));

      let allfiles: UserTaskFileEntity[] = [];
      if (completeTaskDto.fileContents) allfiles = [...found.fileContent, ...fileEntities];
      else allfiles = [...fileEntities];

      const savedFiles = await this.userTaskFileRepository.save(allfiles);
      found.fileContent = savedFiles;
    }

    found.completeTimestamp = new Date();
    if (found.deadline && !isNaN(found.deadline.getTime())) {
      found.status =
        found.completeTimestamp.getTime() <= found.deadline.getTime()
          ? TaskStatus.SUBMITED
          : TaskStatus.SUBMITED_LATE;
    } else {
      found.status = TaskStatus.SUBMITED;
    }

    const updated = await this.userTasksRepository.save(found);
    await this.purgeUserTaskCache(updated);
    return new SingleUserTaskDto(updated);
  }

  async deleteByid(taskId: Uuid, userId: Uuid) {
    const userTask = await this.findOne(taskId, userId, RoleType.TEACHER);
    if (!userTask) return new NotFoundException('Завдання студента не знайдено');

    if (userTask.fileContent?.length) {
      for (const file of userTask.fileContent) {
        this.googleDriveService.deleteFile(file.fileId);
        await this.userTaskFileRepository.delete(file.fileId);
      }
    }

    const delres = this.userTasksRepository.delete(userTask.id);

    await this.purgeUserTaskCache({
      id: userTask.id,
      student: { id: userTask.student.id } as any,
      task: { id: userTask.task.id, course: { id: userTask.task.course.id } as any } as any,
    });

    return delres;
  }
}
