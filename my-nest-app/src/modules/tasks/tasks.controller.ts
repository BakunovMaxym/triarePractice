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
  UploadedFiles,
  UseInterceptors,
  UploadedFile,
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
import { AuthUser } from '../../decorators/auth-user.decorator';
import type { UserEntity } from 'modules/user/user.entity';
import type { TaskDto } from './dto/TaskDto';
import { Auth } from '../../decorators/http.decorators';
import { RoleType } from '../../constants/role-type';
import { SingleTaskDto } from './dto/SingleTaskDto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import multer from 'multer';

@ApiTags('courses/:id/tasks')
@Controller('courses/:id/tasks')
@ApiParam({ name: "id", type: String })
export class TasksController {
  constructor(private readonly taskService: TaskService) { }

  @Post()
  @ApiOperation({ summary: 'Створити завдання' })
  @Auth([RoleType.TEACHER])
  @UseInterceptors(FilesInterceptor('file', 100, { storage: multer.memoryStorage() }))
  @ApiResponse({
    status: 201,
    description: 'Завдання створено.',
    type: TaskEntity,
  })
  async create(
    @Param('id') id: Uuid,
    @AuthUser() user: UserEntity,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreateTaskDto
  ): Promise<SingleTaskDto> {
    dto.courseId = id;
    dto.ownerId = user.id;
    dto.files = files
    return this.taskService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Отримати завдання курса' })
  @ApiResponse({
    status: 200,
    description: 'List of tasks',
    type: [TaskEntity],
  })
  findAll(
    @Param('id') id: Uuid,
  ): Promise<TaskDto[]> {
    return this.taskService.findAll(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати задання за айді' })
  @ApiParam({
    name: 'id',
    description: 'Унікальне айді завдання',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Завдання знайдено',
    type: SingleTaskDto,
  })
  @ApiResponse({ status: 404, description: 'Завдання не знайдено' })
  findByName(
    @Param('id') id: Uuid,
  ): Promise<SingleTaskDto> {
    return this.taskService.findOne(id);
  }

  @Patch(':name')
  @ApiOperation({ summary: 'Update a task by name' })
  @ApiParam({
    name: 'id',
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
    @Param('id') id: Uuid,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskEntity> {
    return this.taskService.updateById(id, dto);
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
