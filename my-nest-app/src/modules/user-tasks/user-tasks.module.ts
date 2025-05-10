import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTasksService } from './user-tasks.service';
import { UserTask } from './entities/user-task.entity';
import { UserEntity } from '../user/user.entity';
import { UserTasksController } from './user-tasks.controller';
import { GoogleDriveModule } from '../../modules/google-drive/google-drive.module';
import { UserTaskFileModule } from '../../modules/user-task-file/user-task-file.module';
import { UserTaskFileEntity } from '../../modules/user-task-file/entities/user-task-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserTask, UserEntity, UserTask, UserTaskFileEntity]), GoogleDriveModule, UserTaskFileModule],
  controllers: [UserTasksController],
  providers: [UserTasksService],
  exports: [UserTasksService],
})
export class UserTasksModule {}
