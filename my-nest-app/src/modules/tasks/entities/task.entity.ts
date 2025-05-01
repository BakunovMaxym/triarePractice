import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, type Relation } from 'typeorm';
import { Comment } from '../../comment/entities/comment.entity';
import { UserTask } from '../../user-tasks/entities/user-task.entity';
import { CourseEntity } from '../../../modules/course/entities/course.entity';
import { UserEntity } from '../../../modules/user/user.entity';
import { AbstractEntity } from '../../../common/abstract.entity';

@Entity('tasks')
export class TaskEntity extends AbstractEntity {

  @Column({ unique: true })
  name!: string;

  @Column('simple-array')
  textContent!: string[];

  @Column('simple-array')
  fileContent!: string[];

  @ManyToOne(() => UserEntity, { eager: true, onDelete: 'CASCADE' })
  owner!: Relation<UserEntity>;

  @ManyToOne(() => CourseEntity, (course) => course.tasks, { eager: true })
  course!: Relation<CourseEntity>;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments!: Relation<Comment[]>;

  @OneToOne(() => UserTask, (userTask) => userTask.task)
  userTasks!: Relation<UserTask>;
}
