import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskFileEntity } from './entities/task-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskFileEntity])],
})
export class TaskFileModule { }
