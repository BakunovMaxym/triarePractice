import { Controller, Param, Delete } from '@nestjs/common';
import { UserTaskFileService } from './user-task-file.service';

@Controller('task-file')
export class UserTaskFileController {
  constructor(private readonly userTaskFileService: UserTaskFileService) { }

  @Delete(':id')
  remove(@Param('id') id: Uuid) {
    return this.userTaskFileService.remove(id);
  }
}
