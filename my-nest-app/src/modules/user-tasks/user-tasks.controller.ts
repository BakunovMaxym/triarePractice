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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';  // імпорт Swagger
import { UserTasksService } from './user-tasks.service';
import { CreateUserTaskDto } from './dto/create-user-task.dto';
import { UpdateUserTaskDto } from './dto/update-user-task.dto';

@ApiTags('user-tasks')  // Групує всі ендпоінти в розділі “user-tasks” :contentReference[oaicite:0]{index=0}
@Controller('user-tasks')
export class UserTasksController {
  constructor(private readonly userTasksService: UserTasksService) {}

  @Post()
  @ApiOperation({ summary: 'Створити нове завдання користувача' })  // Опис операції :contentReference[oaicite:1]{index=1}
  @ApiBody({ type: CreateUserTaskDto })  // Вказує на DTO для Swagger :contentReference[oaicite:2]{index=2}
  @ApiResponse({ status: 201, description: 'Created successfully', type: CreateUserTaskDto })
  create(@Body() createDto: CreateUserTaskDto) {
    return this.userTasksService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Отримати всі UserTasks' })  // Короткий опис для списку :contentReference[oaicite:3]{index=3}
  @ApiResponse({ status: 200, description: 'List of user tasks', type: [CreateUserTaskDto] })
  findAll() {
    return this.userTasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати UserTask за UUID' })  // Опис отримання одиночного запису :contentReference[oaicite:4]{index=4}
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'UUID UserTask' })  // Параметр шляху :contentReference[oaicite:5]{index=5}
  @ApiResponse({ status: 200, description: 'Found UserTask', type: CreateUserTaskDto })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findOne(@Param('id', new ParseUUIDPipe()) id: Uuid) {  // Використовуємо ParseUUIDPipe для валідації UUID :contentReference[oaicite:6]{index=6}
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
