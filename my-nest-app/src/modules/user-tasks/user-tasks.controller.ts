import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Patch,
  Body,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UserTasksService } from './user-tasks.service';
import { Auth } from '../../decorators/http.decorators';
import { RoleType } from '../../constants/role-type';
import { UserTaskDto } from './dto/UsetTaskDto';
import { AuthUser } from '../../decorators/auth-user.decorator';
import type { UserEntity } from '../../modules/user/user.entity';
import { SingleUserTaskDto } from './dto/SingleUserTaskDto';
import { FilesInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import type { CompleteTaskDto } from '../../modules/user-task-file/dto/CompleteTaskDto';
import { CreateUserTaskDto } from './dto/create-user-task.dto';
import { TaskStatus } from '../../constants/status-type';

@ApiTags('user-tasks')
@Controller()
export class UserTasksController {
  constructor(private readonly userTasksService: UserTasksService) { }

  
    @Post("task/:taskId/user-tasks")
    @ApiParam({ name: "taskId", description: 'Унікальне айді завдання', type: String })
    @ApiOperation({ summary: 'Створити завдання студента' })
    @Auth([])
    @ApiResponse({
      status: 201,
      description: 'Завдання створено.',
      type: UserTaskDto,
    })
    async create(
      @Param('taskId') taskId: Uuid,
      @AuthUser() user: UserEntity,
    ): Promise<UserTaskDto> {
      var dto: CreateUserTaskDto = new CreateUserTaskDto()
      dto.status = TaskStatus.ACCEPTED;
      dto.student = user;
      const created = await this.userTasksService.create(dto, taskId);
      return new UserTaskDto(created)
    }

  @Get("/task/:id/user-tasks")
  @ApiParam({ name: "id", description: 'Унікальне айді завдання', type: String })
  @ApiOperation({ summary: 'Отримати всі UserTasks завдання' })
  @Auth([RoleType.TEACHER])
  @ApiResponse({ status: 200, description: 'Завдання згруповані по студенту', type: Object })
  async findAllToTask(
    @Param('id') id: Uuid,
  ) {
    const groupedByStudent = await this.userTasksService.findAllToTask(id);
    if (!groupedByStudent) throw new NotFoundException();

    return Object.entries(groupedByStudent).reduce((acc, [studentId, tasks]) => {
      acc[studentId] = tasks.map(task => new UserTaskDto(task));
      return acc;
    }, {} as Record<string, UserTaskDto[]>);
  }

  @Get("course/:cId/user-task/student/:id")
  @ApiParam({ name: "id", description: 'Унікальне айді студента', type: String })
  @ApiParam({ name: "cId", description: 'Унікальне айді курса', type: String })
  @ApiOperation({ summary: 'Отримати всі UserTasks студента' })
  @Auth([]) 
  @ApiResponse({ status: 200, description: 'Завдання згруповані по завданням', type: Object })
  async findAllToStudent(
    @Param('id') id: Uuid,
    @Param('cId') cId: Uuid,
    @AuthUser() user: UserEntity
  ) {
    const groupedByTask = await this.userTasksService.findAllToStudent(id, user, cId);
    if (!groupedByTask) throw new NotFoundException();

    return Object.entries(groupedByTask).reduce((acc, [taskId, tasks]) => {
      acc[taskId] = tasks.map(task => new UserTaskDto(task));
      return acc;
    }, {} as Record<string, UserTaskDto[]>);
  }


  @Get("/user-task/:taskid/:userid")
  @ApiParam({ name: "taskid", description: 'Унікальне айді завдання', type: String })
  @ApiParam({ name: "userid", description: 'Унікальне айді користувача', type: String })
  @ApiOperation({ summary: 'Отримати один UserTask' })
  @Auth([])
  @ApiResponse({ status: 200, description: 'Single user tasks', type: [SingleUserTaskDto] })
  async findOne(
    @Param('taskid') taskid: Uuid,
    @Param('userid') userid: Uuid,
    @AuthUser() user: UserEntity
  ) {
    const userTask = await this.userTasksService.findOne(taskid, userid, user.role);
    if (!userTask) {
      throw new NotFoundException
    }
    return userTask
  }

  @Get("/user-task/:utaskid")
  @ApiParam({ name: "utaskid", description: 'Унікальне айді завдання користувача', type: String })
  @ApiOperation({ summary: 'Отримати один UserTask' })
  @Auth([])
  @ApiResponse({ status: 200, description: 'Single user tasks', type: [SingleUserTaskDto] })
  async findOneById(
    @Param('utaskid') utaskid: Uuid,
    @AuthUser() user: UserEntity
  ) {
    const userTask = await this.userTasksService.findById(utaskid, user.id, user.role);
    if (!userTask) {
      throw new NotFoundException
    }
    return userTask
  }

  @Patch('/user-task/:id/grade')
  @ApiParam({ name: 'id', description: 'Унікальне айді завдання користувача', type: String })
  @ApiOperation({ summary: 'Поставити оцінку завданню студента' })
  @Auth([RoleType.TEACHER])
  @ApiResponse({ status: 200, description: 'user task', type: SingleUserTaskDto })
  @ApiBody({
    description: 'Оцінка завдання користувача',
    schema: {
      type: 'object',
      properties: {
        grade: { type: 'number', example: 5, description: 'Оцінка студента' },
      },
      required: ['grade'],
    },
  })
  async grade(
    @Param('id') id: Uuid,
    @Body('grade') grade: number,
  ) {
    const numericGrade = Number(grade);
    if (isNaN(numericGrade)) {
      throw new BadRequestException('Оцінка повинна бути числом');
    }

    const userTask = await this.userTasksService.grade(id, numericGrade);
    if (!userTask) {
      throw new NotFoundException();
    }

    return userTask;
  }

  @Patch("/user-task/:id/reject")
  @ApiParam({ name: "id", description: 'Унікальне айді завдання користувача', type: String })
  @ApiOperation({ summary: 'Відхилити завдання студента' })
  @Auth([RoleType.TEACHER])
  @ApiResponse({ status: 200, description: 'user task', type: [SingleUserTaskDto] })
  async reject(
    @Param('id') id: Uuid,
  ) {
    const userTask = await this.userTasksService.reject(id);
    if (!userTask) {
      throw new NotFoundException
    }
    return userTask
  }

  @Patch("/user-task/:id/accept")
  @ApiParam({ name: "id", description: 'Унікальне айді завдання користувача', type: String })
  @ApiOperation({ summary: 'прийняти завдання' })
  @Auth([])
  @ApiResponse({ status: 200, description: 'user task', type: [SingleUserTaskDto] })
  async acceptTask(
    @Param('id') id: Uuid,
    @AuthUser() user: UserEntity
  ) {
    const userTask = await this.userTasksService.acceptTask(id, user.id);
    if (!userTask) {
      throw new NotFoundException
    }
    return userTask
  }

  @Patch('/user-task/:id/complete')
  @Auth([])
  @UseInterceptors(FilesInterceptor('file', 100, { storage: multer.memoryStorage() }))
  async completeTask(
    @Param('id') id: Uuid,
    @Body() dto: CompleteTaskDto,
    @UploadedFiles() files: Express.Multer.File[],
    @AuthUser() user: UserEntity
  ): Promise<SingleUserTaskDto> {
    if (dto.fileContents && typeof dto.fileContents === 'string')
      dto.fileContents = JSON.parse(dto.fileContents);
    dto.userTaskId = id;
    dto.studentId = user.id;

    return this.userTasksService.completeTask(files, dto);
  }

}
