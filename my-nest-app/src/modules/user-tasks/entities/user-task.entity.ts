import { Entity, Column, ManyToOne, JoinColumn, type Relation } from 'typeorm';
import { TaskEntity } from '../../tasks/entities/task.entity';    
import { AbstractEntity } from '../../../common/abstract.entity';
import { UserDto } from '../../../modules/user/dtos/user.dto';
import { UserEntity } from '../../../modules/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'user_tasks' })
export class UserTask extends AbstractEntity<UserTask> {

   @ApiProperty({ description: 'User task ID', format: 'uuid' }) 
  @Column('text')
  status!: string;

    @ApiProperty({ description: 'User task ID', format: 'uuid' })
  @Column({ type: 'timestamp', nullable: true })
  deadline!: Date;

    @ApiProperty({ description: 'User task ID', format: 'uuid' })
  @Column({ type: 'timestamp', nullable: true })
  completeTimestamp!: Date;

    @ApiProperty({ description: 'User task ID', format: 'uuid' })
  @ManyToOne(() => UserEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: Relation<UserEntity>;

  @ApiProperty({ description: 'User task ID', format: 'uuid' })
  @ManyToOne(() => TaskEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task!: Relation<TaskEntity>;
}