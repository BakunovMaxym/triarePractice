import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskEntity } from './entities/task.entity';
import { UserEntity } from '../../modules/user/user.entity';
import { CourseEntity } from '../../modules/course/entities/course.entity';
import { GoogleDriveService } from '../../modules/google-drive/google-drive.service';
import { GoogleDriveModule } from '../../modules/google-drive/google-drive.module';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity, UserEntity, CourseEntity]), GoogleDriveModule],
  providers: [TaskService, GoogleDriveModule],
  controllers: [TasksController],
  exports: [TaskService],
})
export class TaskModule { }
