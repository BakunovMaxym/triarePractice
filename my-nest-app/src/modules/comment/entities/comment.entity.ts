import {
    Entity,
    Column,
    ManyToOne,
    type Relation,
    JoinColumn,
  } from 'typeorm';
  import { forwardRef } from '@nestjs/common';
  import { UserDto } from '../../user/dtos/user.dto';
  import { TaskEntity } from '../../tasks/entities/task.entity';
import { AbstractEntity } from '../../../common/abstract.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UserEntity } from '../../../modules/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';
  
  @Entity({ name: 'comments' })
  export class Comment extends AbstractEntity<CreateCommentDto> {
  
    @ApiProperty({ description: 'Comment content', format: 'string' })
    @Column('text')
    content!: string;
  

    @ManyToOne(() => UserEntity, {
      nullable: false,
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'owner_id' })
    @ApiProperty({ description: 'Comment owner ID' })
    owner!: Relation<UserEntity>;
  
    @ManyToOne(() => TaskEntity, task => task.comments, {
      nullable: false,
      onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'task_id' })
    @ApiProperty({ description: 'Task ID' })
    task!: Relation<TaskEntity>;
  }
