import { UseDto } from '../../../decorators/use-dto.decorator';
import { AbstractEntity } from '../../../common/abstract.entity';
import { TaskEntity } from '../../tasks/entities/task.entity';
import { Entity, Column, ManyToOne, type Relation } from 'typeorm';
import { TaskFileDto } from '../dto/TaskFileDto';

@Entity('task_files')
@UseDto(TaskFileDto)
export class TaskFileEntity extends AbstractEntity {

    @Column()
    fileId!: string;

    @Column()
    fileName!: string;

    @Column()
    fileUrl!: string;

    @ManyToOne(() => TaskEntity, (task) => task.fileContent, { onDelete: 'CASCADE' })
    task!: Relation<TaskEntity>;
}
