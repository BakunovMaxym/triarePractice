import { StringFieldOptional, UUIDFieldOptional } from '../../../decorators/field.decorators';

export class UpdateCourseDto {
    @StringFieldOptional()
    name!: string;

    @UUIDFieldOptional({ nullable: false })
    ownerId!: Uuid;
}
