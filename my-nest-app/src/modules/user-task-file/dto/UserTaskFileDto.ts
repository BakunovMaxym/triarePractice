import { StringField, UUIDField } from '../../../decorators/field.decorators';
import { UserTaskFileEntity } from '../entities/user-task-file.entity';
// import { TaskNameDto } from '../../../modules/tasks/dto/TaskNameDto';
// import { ApiProperty } from '@nestjs/swagger';
// import { Type } from 'class-transformer';

export class UserTaskFileDto {

    @UUIDField()
    fileId: string;

    @StringField()
    fileName: string;

    @StringField()
    fileUrl: string;

    constructor(taskFile: UserTaskFileEntity) {
        this.fileId = taskFile.fileId;
        this.fileName = taskFile.fileName;
        this.fileUrl = taskFile.fileUrl;
    }
}
