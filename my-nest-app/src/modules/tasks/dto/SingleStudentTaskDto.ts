import { ApiProperty } from '@nestjs/swagger';
import type { TaskEntity } from '../entities/task.entity';
import { TaskFileDto } from '../../task-file/dto/TaskFileDto';
import { TaskDto } from './TaskDto';
import { StringField } from '../../../decorators/field.decorators';
import type { Comment } from '../../../modules/comment/entities/comment.entity';

export class SingleStudentTaskDto extends TaskDto {

    @ApiProperty()
    fileContent: (TaskFileDto | string)[];

    @ApiProperty({
        description: 'Текст завдання',
        example: ['Завдання1: виконати роботу', 'Завдання2: вчасно'],
    })
    @StringField()
    textContent!: string;

    @ApiProperty({
        description: 'Файли завдання',
        example: ['завдання.txt', 'завдання.png'],
    })

    @ApiProperty({
        description: 'Коментарі',
    })
    comments!: Comment[];

    constructor(task: TaskEntity, takenTask = false) {
        super(task)
        this.textContent = task.textContent;
        this.fileContent = takenTask
            ? task.fileContent?.map(file => new TaskFileDto(file))
            : task.fileContent?.map(file => file.fileName);
        this.comments = task.comments;
    }
}
