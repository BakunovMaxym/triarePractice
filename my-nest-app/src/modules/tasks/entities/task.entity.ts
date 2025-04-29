import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, type Relation } from 'typeorm';
import { forwardRef } from '@nestjs/common';
import { Comment } from '../../comment/entities/comment.entity';
import { UserTask } from '../../user-tasks/entities/user-task.entity';
import { CourseEntity } from '../../../modules/course/entities/course.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../../modules/user/user.entity';

@Entity('tasks')
export class TaskEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Task ID', format: 'uuid' })
  id!: Uuid;

  @Column({ unique: true })
  @ApiProperty({ description: 'Task name' })
  name!: string;

  @Column('simple-array')
  @ApiProperty({ description: 'Task content' })
  content!: string[];

  @Column()
  @ApiProperty({ description: 'Task type' })
  state!: string;

  @ManyToOne(() => UserEntity, { eager: true, onDelete: 'CASCADE' })
  @ApiProperty({ description: 'Task owner ID' })
  owner!: Relation<UserEntity>;

@ManyToOne(() => CourseEntity, (course) => course.tasks, { eager: true })
@ApiProperty({ description: 'Course ID' })
course!: Relation<CourseEntity>;

  @OneToMany(() => Comment, (comment) => comment.task)
  @ApiProperty({ description: 'Task comments' })
  comments!: Relation<Comment[]>;

  @OneToOne(() => UserTask, (userTask) => userTask.task)
  userTasks!: Relation<UserTask[]>;
}
