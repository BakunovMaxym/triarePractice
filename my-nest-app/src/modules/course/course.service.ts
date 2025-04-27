import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Transactional } from 'typeorm-transactional';
import { CourseEntity } from './entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, type Repository } from 'typeorm';
import { UserEntity } from '../../modules/user/user.entity';
import { CategoryEntity } from '../../modules/category/entities/category.entity';
// import { UserEntity } from 'modules/user/user.entity';

@Injectable()
export class CourseService {
    constructor(
        @InjectRepository(CourseEntity)
        private courseRepository: Repository<CourseEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(CategoryEntity)
        private categoryRepository: Repository<CategoryEntity>,
    ) { }

    @Transactional()
    async create(userId: Uuid, createCourseDto: CreateCourseDto): Promise<CourseEntity> {

        const owner = await this.userRepository.findOne({ where: { id: userId } });

        if (!owner) {
            throw new Error("User not found");
        }

        const category = await this.categoryRepository.findOne({ where: { name: createCourseDto.category } });
    if (!category) {
      throw new Error('Category not found');
    }

    const course = this.courseRepository.create({
        name: createCourseDto.name,
        owner,
        category,
      });

        await this.courseRepository.save(course);

        return course;
    }

    // findAll() {
    //     return `This action returns all course`;
    // }

    // findOne(id: number) {
    //     return `This action returns a #${id} course`;
    // }

    async update(id: Uuid, userId: Uuid, updateCourseDto: UpdateCourseDto) : Promise<CourseEntity> {

        const course = await this.courseRepository.findOne({ 
            where: { id: id},
            relations: ["owner", "teachers", "students", "category"]
        })

        if (!course) {
            throw new Error("Course not found");
        }

        const user = await this.userRepository.findOne({ where: { id: userId}})

        if (!user) {
            throw new Error("User not found");
        }

        const isOwner = course.owner.id === userId;

        if(updateCourseDto.name !== undefined){
            if(isOwner){
                course.name = updateCourseDto.name;
            } else {
                throw new ForbiddenException("Only owner can change name")
            }
        }
        
        if(updateCourseDto.ownerId !== undefined){
            if(isOwner){
                const newOwner = await this.userRepository.findOne({ where: { id: updateCourseDto.ownerId as Uuid}})
                if (!newOwner) {
                    throw new Error("New owner not found");
                }
                course.owner = newOwner;
            } else {
                throw new ForbiddenException("Only owner can change ownership")
            }
        }

        if (updateCourseDto.teacherIds !== undefined) {
            const newTeachers = await this.userRepository.find({
                where: {
                    id: In(updateCourseDto.teacherIds as Uuid[])
                }
            });
            course.teachers.push(...newTeachers);
        }

        if (updateCourseDto.studentIds !== undefined) {
            const newStudents = await this.userRepository.find({
                where: {
                    id: In(updateCourseDto.studentIds as Uuid[])
                }
            });
            course.students.push(...newStudents);
        }
        // if(updateCourseDto.studentIds !== undefined){
        //     const newStudent = await this.userRepository.findOne({ where: { id: updateCourseDto.studentIds}})
        //     course.students.push(newStudent);
        // }

        await this.courseRepository.save(course)

        return course;
    }

    // remove(id: number) {
    //     return `This action removes a #${id} course`;
    // }
}
