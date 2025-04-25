import { StringField, UUIDField } from "../../../decorators/field.decorators";

export class CreateCourseDto {
    @StringField()
    name!: string;

    @UUIDField()
    owner!: Uuid;
}