import { StringFieldOptional, UUIDFieldOptional } from "../../../decorators/field.decorators";


export class FilterDto {
    @UUIDFieldOptional()
    ownerId?: Uuid;

    @StringFieldOptional()
    name?: string;

    @UUIDFieldOptional()
    teacherId?: Uuid;

    @StringFieldOptional()
    category?: string;

    @StringFieldOptional()
    subCategory?: string;
}