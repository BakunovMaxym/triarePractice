import { StringField } from "../../../decorators/field.decorators";

export class CreateCourseDto {
    @StringField({ description: "course's name", maxLength: 254 })
    readonly name!: string;

    owner!: string;

    @StringField({ description: "course's category", maxLength: 254 })
    readonly category!: string;

    @StringField({ description: "course's subCategory", maxLength: 254 })
    readonly subCategory!: string;
}