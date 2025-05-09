import { ApiProperty } from "@nestjs/swagger";
import { StringField, UUIDField, UUIDFieldOptional } from "../../../decorators/field.decorators";

export class CreateFolderDto {

    @ApiProperty({
        description: 'Name for the folder',
        example: 'My Folder',
    })
    @StringField()
    name!: string;


    @UUIDFieldOptional({ nullable: true })
    childFolderId?: Uuid;

    @ApiProperty({
        description: 'id of child course',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @UUIDField()
    childCourseId?: Uuid;

}
