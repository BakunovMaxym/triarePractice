import { Entity, Column, ManyToOne, JoinColumn, type Relation } from 'typeorm';
import { TaskEntity } from '../../tasks/entities/task.entity';
import { AbstractEntity } from '../../../common/abstract.entity';
import { UserEntity } from '../../../modules/user/user.entity';
import { TaskStatus } from '../../../constants/status-type';

@Entity({ name: 'user_tasks' })
export class UserTask extends AbstractEntity<UserTask> {

  @Column({ type: "enum", enum: TaskStatus, default: TaskStatus.ASSIGNED })
  status!: TaskStatus;

  @Column({ type: 'timestamp', nullable: true })
  deadline!: Date;

  @Column({ type: 'timestamp', nullable: true })
  completeTimestamp!: Date;

  @ManyToOne(() => UserEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: Relation<UserEntity>;

  @ManyToOne(() => TaskEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task!: Relation<TaskEntity>;
}