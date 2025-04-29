import { Module } from '@nestjs/common';
import { TaskService } from './tasks.service';
import { TasksController } from './tasks.controller';

@Module({
  providers: [TaskService],
  controllers: [TasksController],
  exports: [TaskService],
})
export class TaskModule {}
