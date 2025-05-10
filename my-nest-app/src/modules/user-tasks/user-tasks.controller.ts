import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserTasksService } from './user-tasks.service';
import { CreateUserTaskDto } from './dto/create-user-task.dto';
import { Auth } from '../../decorators/http.decorators';
import { RoleType } from '../../constants/role-type';
import { UserTaskDto } from './dto/UsetTaskDto';

@ApiTags('user-tasks')
@Controller()
export class UserTasksController {
  constructor(private readonly userTasksService: UserTasksService) { }

  @Get("/task/:id")
  @ApiParam({ name: "id", description: 'Унікальне айді завдання', type: String })
  @ApiOperation({ summary: 'Отримати всі UserTasks завдання' })
    @Auth([RoleType.TEACHER])
  @ApiResponse({ status: 200, description: 'List of user tasks', type: [CreateUserTaskDto] })
  async findAll(
    @Param('id') id: Uuid,
  ) {
    const userTasks = await this.userTasksService.findAllToTask(id);
    if(!userTasks){
      throw new NotFoundException
    }

    return userTasks?.map(ut => new UserTaskDto(ut))
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати UserTask за UUID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'UUID UserTask' })
  @ApiResponse({ status: 200, description: 'Found UserTask', type: CreateUserTaskDto })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findOne(@Param('id', new ParseUUIDPipe()) id: Uuid) {
    return this.userTasksService.findOne(id);
  }

  // @Patch(':id')
  // @ApiOperation({ summary: 'Оновити UserTask за UUID' })
  // @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'UUID UserTask' })
  // @ApiBody({ type: UpdateUserTaskDto })
  // @ApiResponse({ status: 200, description: 'Updated successfully', type: CreateUserTaskDto })
  // @ApiResponse({ status: 404, description: 'Not Found' })
  // update(
  //   @Param('id', new ParseUUIDPipe()) id: Uuid,
  //   @Body() updateDto: UpdateUserTaskDto,
  // ) {
  //   return this.userTasksService.update(id, updateDto);
  // }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Видалити UserTask за UUID' })
  // @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'UUID UserTask' })
  // @ApiResponse({ status: 204, description: 'Deleted successfully' })
  // @ApiResponse({ status: 404, description: 'Not Found' })
  // remove(@Param('id', new ParseUUIDPipe()) id: Uuid) {
  //   return this.userTasksService.remove(id);
  // }
}
