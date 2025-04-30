import { AbstractEntity } from "../../../common/abstract.entity";
import { CreateFolderDto } from "../dto/create-folder.dto";
import { Column, Entity, ManyToMany, OneToMany, type Relation } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { CourseEntity } from "../../../modules/course/entities/course.entity";


@Entity({ name: 'folders' })
export class Folder extends AbstractEntity<CreateFolderDto> {

    @ApiProperty({ description: 'Name for the folder', format: 'string' })
    @Column('text')
    name!: string;

    @ApiProperty({ description: 'id of child folder', format: 'uuid' })
    @OneToMany(() => Folder, (folder) => folder.childFolderId, { nullable: true })
    childFolderId?: Relation<Folder>;

    @ApiProperty({ description: 'id of child course', format: 'uuid' })
    @ManyToMany(() => CourseEntity, { nullable: true })
    childCourseId?: Relation<CourseEntity>;
}