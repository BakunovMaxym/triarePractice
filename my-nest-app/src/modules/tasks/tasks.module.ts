import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './entities/task.entity';
import { UserEntity } from '../../modules/user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity, UserEntity])],
  imports: [TypeOrmModule.forFeature([TaskEntity, UserEntity])],
  providers: [TaskService],
  controllers: [TasksController],
  exports: [TaskService],
})
export class TaskModule { }
