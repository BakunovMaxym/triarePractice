import { UserTaskDto } from "./UsetTaskDto";
import { SingleTaskDto } from "../../../modules/tasks/dto/SingleTaskDto";
import { UserTaskFileDto } from "../../../modules/user-task-file/dto/UserTaskFileDto";
import type { UserTask } from "../entities/user-task.entity";


export class SingleUserTaskDto extends UserTaskDto {
    declare task: SingleTaskDto;

    fileContent: UserTaskFileDto[];

    constructor(userTask: UserTask) {
        super(userTask)
        this.task = new SingleTaskDto(userTask.task);
        this.fileContent = userTask.fileContent?.map(file => new UserTaskFileDto(file)) || [];

    }
}