import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserEntity } from '../user/user.entity';
import { CourseEntity } from '../../modules/course/entities/course.entity';
import { SingleTaskDto } from './dto/SingleTaskDto';
import { GoogleDriveService } from '../../modules/google-drive/google-drive.service';
import { PassThrough } from 'node:stream';
import { TaskDto } from './dto/TaskDto';
import { TaskFileEntity } from '../../modules/task-file/entities/task-file.entity';
import { UserTasksService } from '../../modules/user-tasks/user-tasks.service';
import { TaskStatus } from '../../constants/status-type';
import { Transactional } from 'typeorm-transactional';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
// import { TaskFileService } from '../../modules/task-file/task-file.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly googleDriveService: GoogleDriveService,
    private readonly userTaskService: UserTasksService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,

    @InjectRepository(TaskEntity)
    private taskRepository: Repository<TaskEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(CourseEntity)
    private courseRepository: Repository<CourseEntity>,
    @InjectRepository(TaskFileEntity)
    private taskFileRepository: Repository<TaskFileEntity>,
  ) { }


  async deleteCache(key: string) {
    const keys: string[] = await this.cacheManager.store.keys(key);

    if (keys.length > 0) {
      for (const key of keys) {
        await this.cacheManager.store.del(key);
      }
    }
  }

  @Transactional()
  async create(createTaskDto: CreateTaskDto): Promise<SingleTaskDto> {
    const owner = await this.userRepository.findOne({ where: { id: createTaskDto.ownerId } });
    if (!owner) throw new NotFoundException(`Користувача не існує`);
    const course = await this.courseRepository.findOne({ where: { id: createTaskDto.courseId }, relations: { students: true } });
    if (!course) throw new NotFoundException(`Курсу не існує`);

    //save to google drive
    let uploadedMeta: Array<{ fileId: string; fileName: string; fileUrl: string }> = [];
    if (createTaskDto.fileContents?.length) {
      uploadedMeta = await Promise.all(
        createTaskDto.fileContents.map(file => {
          if ('buffer' in file) {
            const stream = new PassThrough();
            stream.end(file.buffer);
            const correctedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
            return this.googleDriveService.uploadFile(stream, correctedName, file.mimetype);
          } else {
            return file;
          }
        })
      );
    }


    const task: TaskEntity = this.taskRepository.create({
      ...createTaskDto,
      owner,
      course,
    });

    let savedTask = await this.taskRepository.save(task);

    const fileEntities = uploadedMeta.map(meta => {
      return this.taskFileRepository.create({
        fileId: meta.fileId,
        fileName: meta.fileName,
        fileUrl: meta.fileUrl,
        task: savedTask,
      });
    });

    course.students?.forEach(async (student) => {
      const userTaskDto = { student: student, deadline: undefined, task: savedTask, status: TaskStatus.ASSIGNED };
      await this.userTaskService.create(userTaskDto);
    });

    await this.taskFileRepository.save(fileEntities);

    const finalTask = await this.findOne(savedTask.id)

    this.deleteCache(`courses:single:*:${finalTask.course.id}`)

    return new SingleTaskDto(finalTask);
  }


  async findAll(courseId: Uuid): Promise<TaskDto[]> {
    const cacheKey = `tasks:allToCourse:${courseId}`;
    const cached: TaskDto[] | undefined = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const tasks = this.taskRepository.find({
      where: { course: { id: courseId } },
      relations: ['owner', 'comments', 'userTasks'],
    });
    const tasksDto = (await tasks).map(task => new TaskDto(task))

    await this.cacheManager.set(cacheKey, tasksDto);

    return tasksDto;
  }


  async findOne(id: Uuid): Promise<TaskEntity> {
    const cacheKey = `tasks:single:${id}`;
    const cached: TaskEntity | undefined = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const task = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.userTasks', 'userTasks')
      .leftJoinAndSelect('task.owner', 'owner')
      .leftJoinAndSelect('task.comments', 'comments')
      .leftJoinAndSelect('comments.owner', 'commentOwner')
      .leftJoinAndSelect('task.fileContent', 'fileContent')
      .leftJoinAndSelect('fileContent.task', 'fileContentTask')
      .leftJoinAndSelect('task.course', 'course')
      .leftJoinAndSelect('course.teachers', 'teachers')
      .where('task.id = :id', { id })
      .orderBy('comments.createdAt', 'DESC')
      .getOne();

    if (!task) {
      throw new NotFoundException(`Task with name ${id} not found`);
    }

    await this.cacheManager.set(cacheKey, task);

    return task;
  }

  async updateById(id: Uuid, files: Array<Express.Multer.File>, updateTaskDto: UpdateTaskDto, teacherId: Uuid): Promise<SingleTaskDto> {
    const task = await this.findOne(id);

    if (!task) throw new NotFoundException

    if (!task.course.teachers?.some((teach => teach.id === teacherId)))
      throw new ForbiddenException

    if (task.fileContent.length !== 0) {
      let filesToKeepIds: string[] = [];
      if (updateTaskDto.fileContents) {
        filesToKeepIds = updateTaskDto.fileContents
          .filter(file => typeof file === 'object' && file !== null && 'fileId' in file)
          .map(file => file.fileId);
      }

      for (const file of task.fileContent) {
        if (!filesToKeepIds.includes(file.fileId)) {
          this.googleDriveService.deleteFile(file.fileId);
          await this.taskFileRepository.delete(file.fileId);

          task.fileContent = task.fileContent.filter(f => f.fileId !== file.fileId);
        }
      }
    }

    Object.assign(task, updateTaskDto);

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
        this.taskFileRepository.create({ ...meta, task })
      );

      let allfiles: TaskFileEntity[] = [];

      if (updateTaskDto.fileContents) {
        allfiles = [...task.fileContent, ...fileEntities]
      } else {
        allfiles = [...fileEntities]
      }

      const savedFiles = await this.taskFileRepository.save(allfiles);

      task.fileContent = savedFiles;
    }

    const updatedTask = await this.taskRepository.save(task);

    this.deleteCache(`courses:single:*:${updatedTask.course.id}`)
    this.deleteCache(`tasks:allToCourse:${updatedTask.course.id}`)
    this.deleteCache(`tasks:single:${updatedTask.id}`)
    await this.deleteCache(`user-tasks:single:*:${updatedTask.id}:*`)

    return new SingleTaskDto(updatedTask)
  }

  async deleteByid(id: Uuid, teacherId: Uuid) {
    const task = await this.findOne(id)

    if (!task)
      throw new NotFoundException("Завдання не знайдено")

    if (task.owner.id !== teacherId)
      throw new ForbiddenException

    if (task.fileContent?.length !== 0)
      for (const file of task.fileContent) {
        this.googleDriveService.deleteFile(file.fileId);
        await this.taskFileRepository.delete(file.fileId);
      }

    if (task.userTasks.length !== 0) {
      task.userTasks.forEach(userTask => {
        console.log(`delete usertask ${userTask.id}`);
        this.userTaskService.deleteByid(userTask.task.id, userTask.student.id)
      })
    }

    const delres = this.taskRepository.delete(task.id)

    this.deleteCache(`courses:single:*:${task.course.id}`)
    this.deleteCache(`tasks:allToCourse:*:${task.course.id}`)
    this.deleteCache(`tasks:single:*:${task.id}`)
    await this.deleteCache(`user-tasks:single:*:${task.id}:*`)

    return delres;
  }
}
