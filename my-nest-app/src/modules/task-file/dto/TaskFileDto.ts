import { StringField, UUIDField } from '../../../decorators/field.decorators';
import { TaskFileEntity } from '../entities/task-file.entity';
import { TaskNameDto } from '../../../modules/tasks/dto/TaskNameDto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class TaskFileDto {

    @UUIDField()
    fileId: string;

    @StringField()
    fileName: string;

    @StringField()
    fileUrl: string;

    @ApiProperty({ type: () => TaskNameDto })
    @Type(() => TaskNameDto)
    task: TaskNameDto;

    constructor(taskFile: TaskFileEntity) {
        this.task = new TaskNameDto(taskFile.task);
        this.fileId = taskFile.fileId;
        this.fileName = taskFile.fileName;
        this.fileUrl = taskFile.fileUrl;
    }
}
