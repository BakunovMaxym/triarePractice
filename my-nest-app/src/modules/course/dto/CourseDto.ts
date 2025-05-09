import { AbstractDto } from "../../../common/dto/abstract.dto";
import { StringField } from "../../../decorators/field.decorators";
import type { CourseEntity } from "../entities/course.entity";
import { UserNameDto } from "../../../modules/user/dtos/UserNameDto";


export class CourseDto extends AbstractDto {
    @StringField()
    name!: string;

    // @UUIDField({ nullable: false })
    ownerId!: UserNameDto;

    // @UUIDField({ each: true, nullable: true })
    studentIds!: UserNameDto[];

    // @UUIDField({ each: true, nullable: true })
    teacherIds!: UserNameDto[];

    @StringField()
    category!: string;

    @StringField()
    subCategory!: string;

    constructor(course: CourseEntity) {
        super(course);
        this.name = course.name;
        this.ownerId = new UserNameDto(course.owner);
        this.studentIds = course.students?.length !== 0 ?
            course.students?.map(student => new UserNameDto(student)) : [];
        this.teacherIds = course.teachers?.length !== 0 ?
            course.teachers?.map(teacher => new UserNameDto(teacher)) : [];;
        this.category = course.category?.name ?? "";
        this.subCategory = course.subCategory?.name ?? "";
    }
}