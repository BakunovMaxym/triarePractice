import { ApiProperty } from "@nestjs/swagger";
import type { CourseEntity } from "../entities/course.entity";
import { CourseInfoDto } from "./CurseInfoDto";
import { UserNameDto } from "../../../modules/user/dtos/UserNameDto";
import { TaskDto } from "../../../modules/tasks/dto/TaskDto";


export class SingleCourseInfoDto extends CourseInfoDto {

    @ApiProperty({ type: [UserNameDto], description: 'Список студентів курсу' })
    students: UserNameDto[];

    @ApiProperty({ type: [TaskDto], description: 'Список завдань' })
    tasks: TaskDto[];

    constructor(course: CourseEntity) {
        super(course)
        this.students = Array.isArray(course.students)
            ? course.students.map((s: any) => new UserNameDto(s))
            : [];
        this.tasks = Array.isArray(course.tasks)
            ? course.tasks.map((t: any) => { console.log("taskcraeting"); return new TaskDto(t) })
            : [];
    }

}