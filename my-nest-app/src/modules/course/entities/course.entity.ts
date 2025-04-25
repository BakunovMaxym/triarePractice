import { UseDto } from "../../../decorators/use-dto.decorator";
// import { UseDto } from "../../../decorators/";
import { Column, Entity, ManyToMany, ManyToOne } from "typeorm";
import { CourseDto } from "../dto/CourseDto";
import { UserEntity } from "../../user/user.entity";
import { CategoryEntity } from "../../category/entities/category.entity";
import { AbstractEntity } from "../../../common/abstract.entity";

@Entity({name: "courses"})
@UseDto(CourseDto)
export class CourseEntity extends AbstractEntity<CourseDto> {
    @Column({nullable: false, type: "varchar"})
    name!: string;

    @ManyToOne(() => UserEntity, (userEntity) => userEntity.id)
    owner?: UserEntity;

    @ManyToMany(() => UserEntity, (userEntity) => userEntity.id)
    students?: UserEntity[];

    @ManyToMany(() => UserEntity, (userEntity) => userEntity.id)
    teachers?: UserEntity[];

    // @OneToMany(() => TaskEntity, (taskEntity) => taskEntity.id)
    // tasks?: TaskEntity[];

    @ManyToOne(() => CategoryEntity, (categoryEntity) => categoryEntity.name)
    category?: CategoryEntity;

    // @ManyToOne(() => SubCategoryEntity, (subCategoryEntity) => subCategoryEntity.name)
    // subCategory?: SubCategoryEntity;

    
}


