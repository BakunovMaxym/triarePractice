import { AbstractDto } from "../../../common/dto/abstract.dto";
import { StringField, UUIDField } from "../../../decorators/field.decorators";
import type { CourseEntity } from "../entities/course.entity";


export class CourseDto extends AbstractDto {
    @StringField()
    name!: string;

    @UUIDField({ nullable: true })
    ownerId!: string;

    @UUIDField({ each: true, nullable: true })
    studentIds!: string[];
    
    @UUIDField({ each: true, nullable: true })
    teacherIds!: string[];

    @StringField()
    category!: string;

    constructor(course: CourseEntity) {
        super(course);
        this.name = course.name;
        this.ownerId = course.owner?.id ?? null;
        this.studentIds = course.students?.map(student => student.id) ?? [];
        this.teacherIds = course.teachers?.map(teacher => teacher.id) ?? [];
        this.category = course.category?.name ?? "";
    }
}