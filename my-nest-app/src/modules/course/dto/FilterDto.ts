import { StringFieldOptional, UUIDFieldOptional } from "../../../decorators/field.decorators";


export class FilterDto {
    @UUIDFieldOptional()
    ownerId?: Uuid;

    @UUIDFieldOptional()
    teacherId?: Uuid;

    @StringFieldOptional()
    category?: string;

    @StringFieldOptional()
    subCategory?: string;
}