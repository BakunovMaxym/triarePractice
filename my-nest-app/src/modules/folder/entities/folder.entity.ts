import { AbstractEntity } from "../../../common/abstract.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, type Relation } from "typeorm";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { FolderDto } from "../dto/FolderDto";
import { UserEntity } from "../../../modules/user/user.entity";

@Entity({ name: 'folders' })
export class Folder extends AbstractEntity<FolderDto> {

    @ApiProperty({ description: 'Name for the folder', format: 'string' })
    @Column('text')
    name!: string;

    @ApiPropertyOptional({ description: 'Parent folder ID', format: 'uuid' })
    @ManyToOne(() => Folder, (folder) => folder.childFolders, { nullable: true })
    @JoinColumn({ name: 'parent_folder_id' })
    parentFolder?: Relation<Folder>;

    @OneToMany(() => Folder, (folder) => folder.parentFolder, { cascade: true })
    childFolders?: Relation<Folder[]>;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'owner_id' })
    owner!: Relation<UserEntity>;

}