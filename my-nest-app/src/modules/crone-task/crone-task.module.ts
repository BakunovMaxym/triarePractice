
import { forwardRef, Module } from '@nestjs/common';
import { CroneTaskService } from './crone-task.service';
import { UserTasksModule } from '../../modules/user-tasks/user-tasks.module';
import { UserTask } from '../../modules/user-tasks/entities/user-task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserTask]), forwardRef(() => UserTasksModule)],
  providers: [CroneTaskService],
  exports: [CroneTaskService]
})
export class CroneTaskModule { }