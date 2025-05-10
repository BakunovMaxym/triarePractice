import { Entity, Column, JoinColumn, type Relation, ManyToOne, OneToMany } from 'typeorm';
import { TaskEntity } from '../../tasks/entities/task.entity';
import { AbstractEntity } from '../../../common/abstract.entity';
import { UserEntity } from '../../../modules/user/user.entity';
import { TaskStatus } from '../../../constants/status-type';
import { UserTaskFileEntity } from '../../../modules/user-task-file/entities/user-task-file.entity';

@Entity({ name: 'user_tasks' })
export class UserTask extends AbstractEntity<UserTask> {

  @Column({ type: "enum", enum: TaskStatus, default: TaskStatus.ASSIGNED })
  status!: TaskStatus;

  @Column({ type: 'timestamp', nullable: true })
  deadline?: Date;

  @Column({ type: 'integer', nullable: true })
  grade?: number;

  @Column({ type: 'timestamp', nullable: true })
  completeTimestamp!: Date;

  @ManyToOne(() => UserEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  student!: Relation<UserEntity>;

  @ManyToOne(() => TaskEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task!: Relation<TaskEntity>;

  @OneToMany(() => UserTaskFileEntity, file => file.userTask, { cascade: ['insert'] })
  fileContent!: UserTaskFileEntity[];
}