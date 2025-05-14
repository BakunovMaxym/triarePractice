import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { StringField, UUIDField, UUIDFieldOptional } from "../../../decorators/field.decorators";

export class CreateFolderDto {

    @ApiProperty({
        description: 'Name for the folder',
        example: 'My Folder',
    })
    @StringField()
    name!: string;

    @UUIDFieldOptional({ nullable: true })
    parentFolderId?: Uuid;

    @ApiPropertyOptional({
        description: 'Associated course IDs',
        type: [String],
        example: ['550e8400-e29b-41d4-a716-446655440000'],
    })
    @UUIDField({ each: true })
    courseIds?: Uuid[] = [];

    @ApiProperty({
        description: 'Owner user ID',
        type: String,
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @UUIDField({ nullable: false })
    ownerId!: Uuid;
}
