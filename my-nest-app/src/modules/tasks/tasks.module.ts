import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskEntity } from './entities/task.entity';
import { UserEntity } from '../../modules/user/user.entity';
import { CourseEntity } from '../../modules/course/entities/course.entity';
import { GoogleDriveService } from '../../modules/google-drive/google-drive.service';
import { GoogleDriveModule } from '../../modules/google-drive/google-drive.module';
import { TaskFileService } from '../../modules/task-file/task-file.service';
import { TaskFileModule } from '../../modules/task-file/task-file.module';
import { TaskFileEntity } from '../../modules/task-file/entities/task-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity, UserEntity, CourseEntity, TaskFileEntity]), GoogleDriveModule, TaskFileModule],
  providers: [TaskService, GoogleDriveModule],
  controllers: [TasksController],
  exports: [TaskService],
})
export class TaskModule { }
