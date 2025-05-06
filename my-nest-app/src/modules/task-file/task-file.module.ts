import { Module } from '@nestjs/common';
import { TaskFileService } from './task-file.service';
import { TaskFileController } from './task-file.controller';
import { TaskFileEntity } from './entities/task-file.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TaskFileEntity])],
  controllers: [TaskFileController],
  providers: [TaskFileService],
  exports: [TaskFileService]
})
export class TaskFileModule { }
