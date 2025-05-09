import { ApiProperty } from '@nestjs/swagger';
import { StringField } from '../../../decorators/field.decorators';
import type { Comment } from 'modules/comment/entities/comment.entity';
import type { TaskEntity } from '../entities/task.entity';
import { TaskDto } from './TaskDto';
import { TaskFileDto } from '../../../modules/task-file/dto/TaskFileDto';

export class SingleTaskDto extends TaskDto {
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

    @ApiProperty()
    fileContent: TaskFileDto[];

    @ApiProperty({
        description: 'Коментарі',
    })
    comments!: Comment[];

    constructor(task: TaskEntity) {
        super(task)
        this.textContent = task.textContent;
        this.fileContent = task.fileContent?.map(file => new TaskFileDto(file));
        this.comments = task.comments;
    }
}
