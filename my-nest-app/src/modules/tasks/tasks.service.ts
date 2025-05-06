import { Injectable, NotFoundException } from '@nestjs/common';
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
    private readonly googleDriveService: GoogleDriveService,
    @InjectRepository(TaskEntity)
    private taskRepository: Repository<TaskEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(CourseEntity)
    private courseRepository: Repository<CourseEntity>,
    @InjectRepository(TaskFileEntity)
    private taskFileRepository: Repository<TaskFileEntity>,
  ) { }

  async create(createTaskDto: CreateTaskDto): Promise<SingleTaskDto> {
    console.log(createTaskDto.textContent)

    const owner = await this.userRepository.findOne({ where: { id: createTaskDto.ownerId } });
    if (!owner) throw new NotFoundException(`Користувача не існує`);
    const course = await this.courseRepository.findOne({ where: { id: createTaskDto.courseId } });
    if (!course) throw new NotFoundException(`Курсу не існує`);

    //save to google drive
    let uploadedMeta: Array<{ fileId: string; fileName: string; fileUrl: string }> = [];
    if (createTaskDto.files?.length) {
      uploadedMeta = await Promise.all(
        createTaskDto.files.map(file => {
          const stream = new PassThrough();
          stream.end(file.buffer);
          return this.googleDriveService.uploadFile(stream, file.originalname, file.mimetype);
        })
      );
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      owner,
      course,
    });
    const savedTask = await this.taskRepository.save(task);

    const fileEntities = uploadedMeta.map(meta =>
      this.taskFileRepository.create({ ...meta, data: null, task: savedTask })
    );
    savedTask.fileContent = await this.taskFileRepository.save(fileEntities);
    return new SingleTaskDto(savedTask);
  }


  async findAll(courseId: Uuid): Promise<TaskDto[]> {
    const tasks = this.taskRepository.find({
      where: { course: { id: courseId } },
      relations: ['owner', 'comments', 'userTasks'],
    });
    return (await tasks).map(task => new TaskDto(task));
  }


  async findOne(id: Uuid): Promise<SingleTaskDto> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: {
        userTasks: true,
        owner: true,
        comments: true,
        fileContent: { task: true }

      },
    });
    if (!task) {
      throw new NotFoundException(`Task with name ${id} not found`);
    }
    console.log(task)
    return new SingleTaskDto(task);
  }

  async updateById(id: Uuid, updateTaskDto: UpdateTaskDto): Promise<TaskEntity> {
    const task = await this.findOne(id);

    // if (updateTaskDto.content) task.content = updateTaskDto.content;
    // if (updateTaskDto.state) task.state = updateTaskDto.state;

    return this.taskRepository.save(task);
  }
}
