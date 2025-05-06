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
  ) { }

  async create(createTaskDto: CreateTaskDto): Promise<SingleTaskDto> {
    const owner = await this.userRepository.findOne({ where: { id: createTaskDto.ownerId } });
    if (!owner) {
      throw new NotFoundException(`Такого користувача не існує`);
    }

    const course = await this.courseRepository.findOne({ where: { id: createTaskDto.courseId } });
    if (!course) {
      throw new NotFoundException(`Такого курса не існує`);
    }
    let fileContent: object[] = [];

    try {
      if (createTaskDto.files && createTaskDto.files.length > 0) {
        const uploadPromises = createTaskDto.files.map(async (file) => {
          const bufferStream = new PassThrough();
          bufferStream.end(file.buffer);

          const uploadedFile = await this.googleDriveService.uploadFile(
            bufferStream,
            file.originalname,
            "1U3U7U3fSJte9l_iTmVmSfdHVHtB8BeBe",
            file.mimetype
          );

          return uploadedFile;
        });

        fileContent = await Promise.all(uploadPromises);

        console.log(fileContent);
      }
    } catch (error: any) {
      console.log("error");
      console.log(error);
    }

    const task = this.taskRepository.create({
      name: createTaskDto.name,
      textContent: createTaskDto.textContent,
      fileContent: fileContent,
      owner: owner,
      course: course,
    });

    const savedTask = await this.taskRepository.save(task);

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
      relations: ['owner', 'comments', 'userTasks'],
    });
    if (!task) {
      throw new NotFoundException(`Task with name ${id} not found`);
    }
    return new SingleTaskDto(task);
  }

  async updateById(id: Uuid, updateTaskDto: UpdateTaskDto): Promise<TaskEntity> {
    const task = await this.findOne(id);

    // if (updateTaskDto.content) task.content = updateTaskDto.content;
    // if (updateTaskDto.state) task.state = updateTaskDto.state;

    return this.taskRepository.save(task);
  }
}
