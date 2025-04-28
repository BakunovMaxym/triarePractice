import type { UserEntity } from "modules/user/user.entity";
import { AbstractDto } from "../../../common/dto/abstract.dto";
import { StringField, UUIDField } from "../../../decorators/field.decorators";
import type { CourseEntity } from "../entities/course.entity";


export class CourseDto extends AbstractDto {
    @StringField()
    name!: string;

    // @UUIDField({ nullable: false })
    ownerId!: UserEntity;

    // @UUIDField({ each: true, nullable: true })
    studentIds!: UserEntity[];

    // @UUIDField({ each: true, nullable: true })
    teacherIds!: UserEntity[];

    @StringField()
    category!: string;

    constructor(course: CourseEntity) {
        super(course);
        this.name = course.name;
        this.ownerId = course.owner;
        this.studentIds = course.students;
        this.teacherIds = course.teachers;
        this.category = course.category?.name ?? "";
    }
}