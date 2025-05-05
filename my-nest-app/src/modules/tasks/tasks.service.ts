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
import fs from 'fs';

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

    try {
      console.log(createTaskDto.files)
      if (createTaskDto.files.length > 0) {
        createTaskDto.files.forEach(async (file) => {
          console.log(file)
          const bufferStream = new PassThrough();
          bufferStream.end(file.buffer)
          fs.writeFileSync('test_output.txt', file.buffer);

          await this.googleDriveService.uploadFile(bufferStream, file.originalname, "1U3U7U3fSJte9l_iTmVmSfdHVHtB8BeBe", file.mimetype)
        }

        )
      }
    } catch (errror: any) {
      console.log("errror")
      console.log(errror)
    }
    const task = this.taskRepository.create({
      name: createTaskDto.name,
      textContent: createTaskDto.textContent,
      fileContent: createTaskDto.fileContent,
      owner: owner,
      course: course,
    });
    // const 
    return this.taskRepository.save(new SingleTaskDto(task));
  }

  async findAll(): Promise<TaskEntity[]> {
    return this.taskRepository.find({ relations: ['owner', 'comments', 'userTasks'] });
  }

  async findOneByName(name: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({
      where: { name },
      relations: ['owner', 'comments', 'userTasks'],
    });
    if (!task) {
      throw new NotFoundException(`Task with name ${name} not found`);
    }
    return task;
  }

  async updateByName(name: string, updateTaskDto: UpdateTaskDto): Promise<TaskEntity> {
    const task = await this.findOneByName(name);

    if (updateTaskDto.content) task.content = updateTaskDto.content;
    if (updateTaskDto.state) task.state = updateTaskDto.state;

    return this.taskRepository.save(task);
  }
}
