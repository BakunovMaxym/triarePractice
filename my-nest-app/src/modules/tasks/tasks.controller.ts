// File: src/tasks/tasks.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { TaskService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly taskService: TaskService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({
    status: 201,
    description: 'The task has been successfully created.',
    type: TaskEntity,
  })
  create(@Body() dto: CreateTaskDto): Promise<TaskEntity> {
    return this.taskService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({
    status: 200,
    description: 'List of tasks',
    type: [TaskEntity],
  })
  findAll(): Promise<TaskEntity[]> {
    return this.taskService.findAll();
  }

  @Get(':name')
  @ApiOperation({ summary: 'Get a task by name' })
  @ApiParam({
    name: 'name',
    description: 'Unique name of the task',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Found task',
    type: TaskEntity,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findByName(
    @Param('name') name: string,
  ): Promise<TaskEntity> {
    return this.taskService.findOneByName(name);
  }

  @Patch(':name')
  @ApiOperation({ summary: 'Update a task by name' })
  @ApiParam({
    name: 'name',
    description: 'Unique name of the task to update',
    type: 'string',
  })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({
    status: 200,
    description: 'The task has been successfully updated.',
    type: TaskEntity,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  updateByName(
    @Param('name') name: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskEntity> {
    return this.taskService.updateByName(name, dto);
  }

  @Delete(':name')
  @ApiOperation({ summary: 'Delete a task by name' })
  @ApiParam({
    name: 'name',
    description: 'Unique name of the task to delete',
    type: 'string',
  })
  @ApiResponse({ status: 204, description: 'Task successfully deleted' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @HttpCode(204)
  removeByName(
    @Param('name') name: string,
  ) {
    return this.taskService.removeByName(name);
  }
}
