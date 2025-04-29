

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './entities/comment.entity';
import { UserEntity } from '../user/user.entity';
import { TaskEntity } from '../tasks/entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Comment,        
      UserEntity,     
      TaskEntity,     
    ]),
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
