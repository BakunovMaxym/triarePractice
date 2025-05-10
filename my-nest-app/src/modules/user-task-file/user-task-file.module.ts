import { Module } from '@nestjs/common';
import { UserTaskFileService } from './user-task-file.service';
import { UserTaskFileController } from './user-task-file.controller';
import { UserTaskFileEntity } from './entities/user-task-file.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleDriveModule } from '../google-drive/google-drive.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserTaskFileEntity]), GoogleDriveModule],
  controllers: [UserTaskFileController],
  providers: [UserTaskFileService],
  exports: [UserTaskFileService]
})
export class UserTaskFileModule { }
