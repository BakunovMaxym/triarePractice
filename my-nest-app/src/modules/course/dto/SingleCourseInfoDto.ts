import { ApiProperty } from "@nestjs/swagger";
import type { CourseEntity } from "../entities/course.entity";
import { CourseInfoDto } from "./CurseInfoDto";
import { UserNameDto } from "../../../modules/user/dtos/UserNameDto";
import { CreateTaskDto } from "../../../modules/tasks/dto/create-task.dto";


export class SingleCourseInfoDto extends CourseInfoDto {

    @ApiProperty({ type: [UserNameDto], description: 'Список студентів курсу' })
    students: UserNameDto[];

    @ApiProperty({ type: [CreateTaskDto], description: 'Список завдань' })
    tasks: CreateTaskDto[];

    constructor(course: CourseEntity) {
        super(course)
        this.students = Array.isArray(course.students)
            ? course.students.map((s: any) => new UserNameDto(s))
            : [];
        this.tasks = Array.isArray(course.tasks)
            ? course.tasks.map((t: any) => new CreateTaskDto(t))
            : [];
    }

}