import { StringField } from "../../../decorators/field.decorators";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCourseDto {
    @ApiProperty({ description: "course's name" })
    @StringField()
    readonly name!: string;

    // @ApiProperty({ description: "owner's id", nullable: true })
    // @UUIDFieldOptional({ nullable: true })
    owner!: string;

    @ApiProperty({ description: "course's category" })
    @StringField()
    readonly category!: string;

    @ApiProperty({ description: "course's subCategory" })
    @StringField()
    readonly subCategory!: string;
}