import { Entity, Column, ManyToOne, type Relation, PrimaryColumn } from 'typeorm';
import { UserTask } from '../../../modules/user-tasks/entities/user-task.entity';

@Entity('user_task_files')
// @UseDto(TaskFileDto)
export class UserTaskFileEntity {

    @PrimaryColumn()
    fileId!: string;

    @Column()
    fileName!: string;

    @Column()
    fileUrl!: string;

    @ManyToOne(() => UserTask, (t) => t.fileContent, { onDelete: 'CASCADE' })
    userTask!: Relation<UserTask>;
}
