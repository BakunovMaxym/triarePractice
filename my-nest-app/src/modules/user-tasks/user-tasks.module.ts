import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTasksService } from './user-tasks.service';
import { UserTask } from './entities/user-task.entity';
import { UserEntity } from '../user/user.entity';
import { UserTasksController } from './user-tasks.controller';
import { GoogleDriveModule } from '../../modules/google-drive/google-drive.module';
import { UserTaskFileModule } from '../../modules/user-task-file/user-task-file.module';
import { UserTaskFileEntity } from '../../modules/user-task-file/entities/user-task-file.entity';
import { CroneTaskModule } from '../../modules/crone-task/crone-task.module';
import { TaskEntity } from '../../modules/tasks/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserTask, UserEntity, UserTaskFileEntity, TaskEntity]), GoogleDriveModule, UserTaskFileModule, forwardRef(() => CroneTaskModule)],
  controllers: [UserTasksController],
  providers: [UserTasksService],
  exports: [UserTasksService],
})
export class UserTasksModule { }
