import { UseDto } from '../../../decorators/use-dto.decorator';
import { TaskEntity } from '../../tasks/entities/task.entity';
import { Entity, Column, ManyToOne, type Relation, PrimaryColumn } from 'typeorm';
import { TaskFileDto } from '../dto/TaskFileDto';

@Entity('task_files')
@UseDto(TaskFileDto)
export class TaskFileEntity {

    @PrimaryColumn()
    fileId!: string;

    @Column()
    fileName!: string;

    @Column()
    fileUrl!: string;

    @ManyToOne(() => TaskEntity, (t) => t.fileContent, { onDelete: 'CASCADE' })
    task!: Relation<TaskEntity>;
}
