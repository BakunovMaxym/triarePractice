import { Entity, Column, ManyToOne, OneToMany, OneToOne, type Relation } from 'typeorm';
import { Comment } from '../../comment/entities/comment.entity';
import { UserTask } from '../../user-tasks/entities/user-task.entity';
import { CourseEntity } from '../../../modules/course/entities/course.entity';
import { UserEntity } from '../../../modules/user/user.entity';
import { AbstractEntity } from '../../../common/abstract.entity';
import { TaskFileEntity } from '../../task-file/entities/task-file.entity';

@Entity('tasks')
export class TaskEntity extends AbstractEntity {

  @Column()
  name!: string;

  @Column({ nullable: true, type: 'varchar' })
  textContent!: string;

  @Column({ nullable: true, type: 'interval' })
  timeToComplete!: string

  @OneToMany(() => TaskFileEntity, file => file.task, { cascade: ['insert'] })
  fileContent!: TaskFileEntity[];

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.id, { eager: true, onDelete: 'CASCADE' })
  owner!: Relation<UserEntity>;

  @ManyToOne(() => CourseEntity, (course) => course.tasks, { eager: true })
  course!: Relation<CourseEntity>;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments!: Relation<Comment[]>;

  @OneToOne(() => UserTask, (userTask) => userTask.task)
  userTasks!: Relation<UserTask>;
}
