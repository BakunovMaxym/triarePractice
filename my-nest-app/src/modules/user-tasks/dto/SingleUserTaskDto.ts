import { UserTaskDto } from "./UsetTaskDto";
import { SingleTaskDto } from "../../../modules/tasks/dto/SingleTaskDto";
import { UserTaskFileDto } from "../../../modules/user-task-file/dto/UserTaskFileDto";
import type { UserTask } from "../entities/user-task.entity";
import { TaskStatus } from "../../../constants/status-type";
import { SingleStudentTaskDto } from "../../../modules/tasks/dto/SingleStudentTaskDto";


export class SingleUserTaskDto extends UserTaskDto {
    declare task: SingleTaskDto | SingleStudentTaskDto;

    fileContent: UserTaskFileDto[];

    constructor(userTask: UserTask, teacher = false) {
        super(userTask)
        this.task = teacher || (userTask.deadline && userTask.status !== TaskStatus.ASSIGNED)
            ? new SingleTaskDto(userTask.task)
            : new SingleStudentTaskDto(userTask.task, userTask.status !== TaskStatus.ASSIGNED);
        this.fileContent = userTask.fileContent?.map(file => new UserTaskFileDto(file)) || [];
    }
}