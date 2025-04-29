import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTasksService } from './user-tasks.service';
import { UserTasksController } from './user-tasks.controller';
import { UserTask } from './entities/user-task.entity';
import { UserEntity } from '../user/user.entity';
import { TaskEntity } from '../tasks/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserTask, UserEntity, TaskEntity])],
  controllers: [UserTasksController],
  providers: [UserTasksService],
  exports: [UserTasksService],
})
export class UserTasksModule {}
