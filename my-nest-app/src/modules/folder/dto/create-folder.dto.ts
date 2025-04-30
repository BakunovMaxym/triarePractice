import { ApiProperty } from "@nestjs/swagger";
import { AbstractDto } from "../../../common/dto/abstract.dto";
import { StringField, UUIDField } from "../../../decorators/field.decorators";

export class CreateFolderDto extends AbstractDto {

    @ApiProperty({
        description: 'Name for the folder',
        example: 'My Folder',
    })
    @StringField()
    name!: string;

    @ApiProperty({
        description: 'id of child floder',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @UUIDField()
    childFolderId?: Uuid;

    @ApiProperty({
        description: 'id of child course',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @UUIDField()
    childCourseId?: Uuid;

}
