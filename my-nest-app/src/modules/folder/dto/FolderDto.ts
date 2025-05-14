import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AbstractDto } from "../../../common/dto/abstract.dto";
import type { Folder } from "../entities/folder.entity";
import { StringField } from "../../../decorators/field.decorators";
import { FolderNameDto } from "./FolderNameDto";
import { CourseNameDto } from "../../course/dto/CourseNameDto";
import { UserNameDto } from "../../../modules/user/dtos/UserNameDto";

export class FolderDto extends AbstractDto {
  @StringField({ description: 'Name for the folder' })
  name!: string;

  @ApiPropertyOptional({ description: 'Parent folder', type: () => FolderDto, nullable: true })
  parentFolder?: FolderNameDto;

  @ApiPropertyOptional({ description: 'Child folders', type: () => [FolderNameDto], nullable: true })
  childFolders?: FolderNameDto[];

  @ApiProperty({ description: 'Child courses', type: () => [CourseNameDto], nullable: true })
  childCourses?: CourseNameDto[];

  owner?: UserNameDto;

  constructor(folder: Folder) {
    super(folder);
    this.name = folder.name;
    this.parentFolder = folder.parentFolder ? new FolderDto(folder.parentFolder) : undefined;
    this.childFolders = folder.childFolders?.map((child) => new FolderDto(child));
    this.childCourses = folder.childCourses?.map((child) => new CourseNameDto(child));
    this.owner = folder.owner ? new UserNameDto(folder.owner) : undefined;

  }
}
