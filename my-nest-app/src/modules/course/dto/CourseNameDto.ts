import { StringField, UUIDField } from "../../../decorators/field.decorators";
import type { CourseEntity } from "../entities/course.entity";

export class CourseNameDto {
    @UUIDField({ description: 'ID курсу' })
    id: Uuid;

    @StringField({ description: 'Назва курсу' })
    name: string;

    constructor(course: CourseEntity) {
        this.id = course.id;
        this.name = course.name;
    }
}