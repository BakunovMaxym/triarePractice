import { Controller, Param, Delete } from '@nestjs/common';
import { TaskFileService } from './task-file.service';

@Controller('task-file')
export class TaskFileController {
  constructor(private readonly taskFileService: TaskFileService) { }

  // @Post()
  // create(@Body() createTaskFileDto: CreateTaskFileDto) {
  //   return this.taskFileService.create(createTaskFileDto);
  // }

  // @Get()
  // findAll() {
  //   return this.taskFileService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.taskFileService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTaskFileDto: UpdateTaskFileDto) {
  //   return this.taskFileService.update(+id, updateTaskFileDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: Uuid) {
    return this.taskFileService.remove(id);
  }
}
