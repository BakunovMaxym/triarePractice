import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  HttpCode,
} from '@nestjs/common';
import { TaskService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';

@Controller('tasks')
export class TasksController {
  constructor(private readonly taskService: TaskService) {}

  
  @Post()
  async create(@Body() dto: CreateTaskDto): Promise<TaskEntity> {
    return await this.taskService.create(dto);
  }

  
  @Get()
  async findAll(): Promise<TaskEntity[]> {
    return await this.taskService.findAll();
  }

  
  @Get(':name')
  async findByName(@Param('name') name: string): Promise<TaskEntity> {
    return await this.taskService.findOneByName(name);
  }

  
  @Patch(':name')
  async updateByName(
    @Param('name') name: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskEntity> {
    return await this.taskService.updateByName(name, dto);
  }

  
  @Delete(':name')
  @HttpCode(204)
  removeByName(@Param('name') name: string): Promise<TaskEntity> {
    return this.taskService.removeByName(name);
  }
}
