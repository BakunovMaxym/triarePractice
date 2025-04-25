import { AbstractDto } from "../../../common/dto/abstract.dto";
import { StringField } from "../../../decorators/field.decorators";
import type { CourseEntity } from "../entities/course.entity";


export class CourseDto extends AbstractDto {
    @StringField()
    name!: string;

    @StringField()
    owner!: string;

    @StringField()
    category!: string;

    @StringField()
    subCategory!: string;

    constructor(course: CourseEntity) {
        super(course)
        this.name = course.name;
        this.owner = course.owner?.lastName ?? "";
        this.category = course.category?.name ?? "";
        this.subCategory = course.subCategory?.name ?? "";
    }
}