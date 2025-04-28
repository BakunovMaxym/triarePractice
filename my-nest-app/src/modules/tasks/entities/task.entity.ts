import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { UserEntity } from '../../user/user.entity';
import { CommentEntity } from '../../comments/entities/comment.entity';
import { UserTasksEntity } from '../../user-tasks/entities/user-tasks.entity';
import { CourseEntity } from 'modules/course/entities/course.entity';

@Entity('tasks')
export class TaskEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column('simple-array')
  content!: string[];

  @Column()
  state!: string;

  @Column()
  owner!: string;

@ManyToOne(() => CourseEntity, (course) => course.tasks, { eager: true })
course!: CourseEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.task)
  comments!: CommentEntity[];

  @OneToOne(() => UserTasksEntity, (userTask) => userTask.task)
  userTasks!: UserTasksEntity[];
}
