import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AbstractDto } from "../../../common/dto/abstract.dto";
import type { Folder } from "../entities/folder.entity";
import { UUIDField, StringField } from "../../../decorators/field.decorators";
import type { CourseEntity } from "../../../modules/course/entities/course.entity";

export class FolderDto extends AbstractDto {
  @StringField()
  @ApiProperty({ description: 'Name for the folder' })
  name!: string;

  @ApiPropertyOptional({ description: 'Child folder', type: () => FolderDto, nullable: true })
  childFolder?: FolderDto;

  @ApiProperty({ description: 'Child course', type: () => Object, nullable: true })
  childCourse?: CourseEntity;

  constructor(folder: Folder & { id: string; createdAt: Date; updatedAt: Date }) {
    super(folder);
    this.name = folder.name;
    this.childFolder = (folder as any).childFolder
      ? new FolderDto((folder as any).childFolder as Folder & { id: string; createdAt: Date; updatedAt: Date })
      : undefined;
    this.childCourse = (folder as any).childCourse;
  }
}
