import { Module } from '@nestjs/common';
import { TaskFileService } from './task-file.service';
import { TaskFileController } from './task-file.controller';
import { TaskFileEntity } from './entities/task-file.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleDriveModule } from '../../modules/google-drive/google-drive.module';

@Module({
  imports: [TypeOrmModule.forFeature([TaskFileEntity]), GoogleDriveModule],
  controllers: [TaskFileController],
  providers: [TaskFileService],
  exports: [TaskFileService]
})
export class TaskFileModule { }
