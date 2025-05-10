import { StringField, UUIDField } from '../../../decorators/field.decorators';
import { UserTaskFileEntity } from '../entities/user-task-file.entity';
import { UserTaskDto } from '../../../modules/user-tasks/dto/UsetTaskDto';

export class CreateUserTaskFileDto {

    userTask: UserTaskDto;

    @UUIDField()
    fileId: string;

    @StringField()
    fileName: string;

    @StringField()
    fileUrl: string;

    constructor(taskFile: UserTaskFileEntity) {
        this.userTask = new UserTaskDto(taskFile.userTask);
        this.fileId = taskFile.fileId;
        this.fileName = taskFile.fileName;
        this.fileUrl = taskFile.fileUrl;
    }
}
