import type { UserEntity } from "modules/user/user.entity";
import { ClassField, StringField, UUIDField, UUIDFieldOptional } from "../../../decorators/field.decorators";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCourseDto {
    @ApiProperty({ description: "course's name"})
    @StringField()
    readonly name!: string;

    @ApiProperty({ description: "owner's id", nullable: true})
    @UUIDFieldOptional({nullable: true})
    owner!: string;

    @ApiProperty({ description: "course's category"})
    @StringField()
    readonly category!: string;
}