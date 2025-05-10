import { UUIDField } from '../../../decorators/field.decorators';

export class CompleteTaskDto {

    @UUIDField()
    userTaskId!: Uuid;

    @UUIDField()
    studentId!: Uuid;

    fileContents!: { fileId: string, fileName: string, fileUrl: string }[]

}
