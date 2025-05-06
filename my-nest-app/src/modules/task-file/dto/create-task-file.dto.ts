import type { TaskDto } from 'modules/tasks/dto/TaskDto';
import { StringField, UUIDField } from '../../../decorators/field.decorators';
import { TaskFileEntity } from '../entities/task-file.entity';

export class CreateTaskFileDto {

    task: TaskDto;

    @UUIDField()
    fileId: string;

    @StringField()
    fileName: string;

    @StringField()
    fileUrl: string;

    constructor(taskFile: TaskFileEntity) {
        this.task = taskFile.task;
        this.fileId = taskFile.fileId;
        this.fileName = taskFile.fileName;
        this.fileUrl = taskFile.fileUrl;
    }
}
