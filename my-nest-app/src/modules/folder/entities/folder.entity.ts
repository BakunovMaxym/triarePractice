import { AbstractEntity } from "../../../common/abstract.entity";
import { CreateFolderDto } from "../dto/create-folder.dto";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, type Relation } from "typeorm";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CourseEntity } from "../../../modules/course/entities/course.entity";
import type { FolderDto } from "../dto/FolderDto";

@Entity({ name: 'folders' })
export class Folder extends AbstractEntity<FolderDto> {

    @ApiProperty({ description: 'Name for the folder', format: 'string' })
    @Column('text')
    name!: string;

    @ApiPropertyOptional({ description: 'id of child folder', format: 'uuid' })
    @ManyToOne(() => Folder, (folder) => folder.childFolders, { nullable: true })
    @JoinColumn({ name: 'child_folder_id' })
    childFolderId?: Relation<Folder>;

    @OneToMany(() => Folder, (folder) => folder.childFolderId)
    childFolders?: Relation<Folder[]>;

    @ApiProperty({ description: 'id of child course', format: 'uuid' })
    @ManyToOne(() => CourseEntity, { nullable: true })
    @JoinColumn({ name: 'child_course_id' })
    childCourseId?: Relation<CourseEntity>;
}