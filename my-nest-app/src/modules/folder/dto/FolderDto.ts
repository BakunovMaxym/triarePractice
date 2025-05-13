import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AbstractDto } from "../../../common/dto/abstract.dto";
import type { Folder } from "../entities/folder.entity";
import { StringField, UUIDField } from "../../../decorators/field.decorators";
import { FolderNameDto } from "./FolderNameDto";
import type { CourseDto } from "modules/course/dto/CourseDto";
import { CourseNameDto } from "../../course/dto/CourseNameDto";
import type { UserNameDto } from "modules/user/dtos/UserNameDto";

export class FolderDto extends AbstractDto {
  @StringField()
  @ApiProperty({ description: 'Name for the folder' })
  name!: string;

  @ApiPropertyOptional({ description: 'Parent folder', type: () => FolderDto, nullable: true })
  parentFolder?: FolderNameDto;

  @ApiPropertyOptional({ description: 'Child folders', type: () => [FolderNameDto], nullable: true })
  childFolders?: FolderNameDto[];

  @ApiProperty({ description: 'Child courses', type: () => [CourseNameDto], nullable: true })
  childCourses?: CourseNameDto[];

  @UUIDField()
  @ApiProperty({ description: 'Associated owner ID', type: () => [String], nullable: true })
  ownerId?: UserNameDto;

  constructor(folder: Folder & { id: string; createdAt: Date; updatedAt: Date }) {
    super(folder);
    this.name = folder.name;
    this.parentFolder = folder.parentFolder ? new FolderDto(folder.parentFolder) : undefined;
    this.childFolders = folder.childFolders?.map((child) => new FolderDto(child));
  }
}
