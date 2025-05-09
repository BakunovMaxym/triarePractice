import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UserTasksService } from './user-tasks.service';
import { CreateUserTaskDto } from './dto/create-user-task.dto';
import { UpdateUserTaskDto } from './dto/update-user-task.dto';

@ApiTags('user-tasks')
@Controller('user-tasks')
export class UserTasksController {
  constructor(private readonly userTasksService: UserTasksService) { }

  @Post()
  @ApiOperation({ summary: 'Створити нове завдання користувача' })
  @ApiBody({ type: CreateUserTaskDto })
  @ApiResponse({ status: 201, description: 'Created successfully', type: CreateUserTaskDto })
  create(@Body() createDto: CreateUserTaskDto) {
    return this.userTasksService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Отримати всі UserTasks' })
  @ApiResponse({ status: 200, description: 'List of user tasks', type: [CreateUserTaskDto] })
  findAll() {
    return this.userTasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати UserTask за UUID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'UUID UserTask' })
  @ApiResponse({ status: 200, description: 'Found UserTask', type: CreateUserTaskDto })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findOne(@Param('id', new ParseUUIDPipe()) id: Uuid) {
    return this.userTasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Оновити UserTask за UUID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'UUID UserTask' })
  @ApiBody({ type: UpdateUserTaskDto })
  @ApiResponse({ status: 200, description: 'Updated successfully', type: CreateUserTaskDto })
  @ApiResponse({ status: 404, description: 'Not Found' })
  update(
    @Param('id', new ParseUUIDPipe()) id: Uuid,
    @Body() updateDto: UpdateUserTaskDto,
  ) {
    return this.userTasksService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Видалити UserTask за UUID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'UUID UserTask' })
  @ApiResponse({ status: 204, description: 'Deleted successfully' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  remove(@Param('id', new ParseUUIDPipe()) id: Uuid) {
    return this.userTasksService.remove(id);
  }
}
