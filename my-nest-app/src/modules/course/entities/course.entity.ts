import { UseDto } from "../../../decorators/use-dto.decorator";
// import { UseDto } from "../../../decorators/";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, type Relation, OneToMany } from "typeorm";
import { CourseDto } from "../dto/CourseDto";
import { UserEntity } from "../../user/user.entity";
import { CategoryEntity } from "../../category/entities/category.entity";
import { AbstractEntity } from "../../../common/abstract.entity";
import { TaskEntity } from "../../tasks/entities/task.entity";
import { SubCategoryEntity } from "../../../modules/sub-category/entities/sub-category.entity";

@Entity({ name: "courses" })
@UseDto(CourseDto)
export class CourseEntity extends AbstractEntity<CourseDto> {
    @Column({ nullable: false, type: "varchar" })
    name!: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'owner_id' })
    owner!: Relation<UserEntity>;

    @ManyToMany(() => UserEntity, (userEntity) => userEntity.studentCourses, { onDelete: 'CASCADE' })
    @JoinTable({
        name: 'courses_students',
        joinColumn: {
            name: 'course_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'student_id',
            referencedColumnName: 'id',
        },
    })
    students!: UserEntity[];

    @ManyToMany(() => UserEntity, (userEntity) => userEntity.teachCourses, { onDelete: 'CASCADE' })
    @JoinTable({
        name: 'courses_teachers',
        joinColumn: {
            name: 'course_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'teacher_id',
            referencedColumnName: 'id',
        },
    })
    teachers!: UserEntity[];


    // @ManyToMany(() => UserEntity, (userEntity) => userEntity.id)
    // students?: UserEntity[];

    // @ManyToMany(() => UserEntity, (userEntity) => userEntity.id)
    // teachers?: UserEntity[];

    @OneToMany(() => TaskEntity, (taskEntity) => taskEntity.id)
    tasks?: TaskEntity[];

    @ManyToOne(() => CategoryEntity, (categoryEntity) => categoryEntity.courses)
    @JoinColumn()
    category?: Relation<CategoryEntity>;

    @ManyToOne(() => SubCategoryEntity, (subCategoryEntity) => subCategoryEntity.name)
    @JoinColumn()
    subCategory?: Relation<SubCategoryEntity>;

}


