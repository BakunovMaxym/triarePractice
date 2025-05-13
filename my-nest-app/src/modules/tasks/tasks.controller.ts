import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  HttpCode,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { TaskService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskEntity } from './entities/task.entity';
import { AuthUser } from '../../decorators/auth-user.decorator';
import type { UserEntity } from 'modules/user/user.entity';
import type { TaskDto } from './dto/TaskDto';
import { Auth } from '../../decorators/http.decorators';
import { RoleType } from '../../constants/role-type';
import { SingleTaskDto } from './dto/SingleTaskDto';
import { FilesInterceptor } from '@nestjs/platform-express';
import multer from 'multer';

@ApiTags('tasks')
@Controller()
@ApiParam({ name: "id", type: String })
export class TasksController {
  constructor(private readonly taskService: TaskService) { }

  @Post("courses/:id/tasks")
  @ApiParam({ name: "id", description: 'Унікальне айді курса', type: String })
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
    dto.fileContents = files
    return this.taskService.create(dto);
  }

  @Get("courses/:id/tasks")
  @ApiOperation({ summary: 'Отримати завдання курса' })
  @ApiParam({
    name: 'id',
    description: 'Унікальне айді курса',
    type: String,
  })
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

  @Get('/tasks/:id')
  @ApiOperation({ summary: 'Отримати задання за айді' })
  @Auth([RoleType.TEACHER])
  @ApiParam({
    name: 'id',
    description: 'Унікальне айді завдання',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Завдання знайдено',
    type: SingleTaskDto,
  })
  @ApiResponse({ status: 404, description: 'Завдання не знайдено' })
  async findByName(
    @Param('id') id: Uuid,
  ): Promise<SingleTaskDto> {
    return new SingleTaskDto(await this.taskService.findOne(id));
  }

  @Patch('/tasks/:id')
  @Auth([RoleType.TEACHER])
  @UseInterceptors(FilesInterceptor('file', 100, { storage: multer.memoryStorage() }))
  async updateByName(
    @Param('id') id: Uuid,
    @Body() dto: any,
    @UploadedFiles() files: Express.Multer.File[],
    @AuthUser() teacher: UserEntity
  ): Promise<SingleTaskDto> {
    if (dto.fileContents && typeof dto.fileContents === 'string')
      dto.fileContents = JSON.parse(dto.fileContents);
    return this.taskService.updateById(id, files, dto, teacher.id);
  }


  @Delete('/tasks/:id')
  @ApiOperation({ summary: 'Видалити завдання за айді' })
  @Auth([RoleType.TEACHER])
  @ApiParam({
    name: 'id',
    description: 'Унікальне айді завдання',
    type: String,
  })
  @ApiResponse({ status: 204, description: 'Завдання видалено' })
  @ApiResponse({ status: 404, description: 'Завдання не знайдено' })
  @HttpCode(204)
  deleteById(
    @Param('id') id: Uuid,
    @AuthUser() teacher: UserEntity
  ) {
    return this.taskService.deleteByid(id, teacher.id);
  }
}
