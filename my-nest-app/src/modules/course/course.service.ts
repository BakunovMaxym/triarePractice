import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Transactional } from 'typeorm-transactional';
import { CourseEntity } from './entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, type Repository } from 'typeorm';
import { UserEntity } from '../../modules/user/user.entity';
import { CategoryEntity } from '../../modules/category/entities/category.entity';
import { CourseInfoDto } from './dto/CurseInfoDto';
import { error } from 'console';
import type { DeleteUserFromCourse } from './dto/DeleteUserFromCourse';
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


    async update(id: Uuid, userId: Uuid, updateCourseDto: UpdateCourseDto): Promise<CourseEntity> {

        const course = await this.courseRepository.findOne({
            where: { id: id },
            relations: ["owner", "teachers", "students", "category"]
        })

        if (!course) {
            throw new Error("Course not found");
        }

        const user = await this.userRepository.findOne({ where: { id: userId } })

        if (!user) {
            throw new Error("User not found");
        }

        const isOwner = course.owner.id === userId;

        if (!isOwner) {
            throw new ForbiddenException("Only owner has permission")
        }

        Object.assign(course, updateCourseDto)
        await this.courseRepository.save(course)

        // if(updateCourseDto.name !== undefined){

        // }

        // if(updateCourseDto.ownerId !== undefined){
        //     if(isOwner){
        //         const newOwner = await this.userRepository.findOne({ where: { id: updateCourseDto.ownerId as Uuid}})
        //         if (!newOwner) {
        //             throw new Error("New owner not found");
        //         }
        //         course.owner = newOwner;
        //     } else {
        //         throw new ForbiddenException("Only owner can change ownership")
        //     }
        // }

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

        await this.courseRepository.save(course)

        return course;
    }

    async addTeacher(courseId: Uuid, teacherId: Uuid): Promise<CourseInfoDto> {
        const course = await this.courseRepository.findOne({
            where: { id: courseId },
            relations: ["owner", "teachers", "students", "category"],
        });

        if (!course) {
            throw new NotFoundException("Course with this id doesn't exist");
        }

        const newTeacher = await this.userRepository.findOne({ where: { id: teacherId } });

        if (!newTeacher) {
            throw new NotFoundException("Teacher with this id doesn't exist");
        }

        if (course.teachers.some(teacher => teacher.id === teacherId)) {
            throw new ConflictException("The user is already a teacher");
        }

        course.teachers.push(newTeacher);

        const savedCourse = await this.courseRepository.save(course);

        return new CourseInfoDto(savedCourse);
    }

    async addStudent(courseId: Uuid, studentId: Uuid): Promise<CourseInfoDto> {
        const course = await this.courseRepository.findOne({
            where: { id: courseId },
            relations: ["owner", "teachers", "students", "category"],
        });

        if (!course) {
            throw new NotFoundException("Course with this id doesn't exist");
        }

        const newStudent = await this.userRepository.findOne({ where: { id: studentId } });

        if (!newStudent) {
            throw new NotFoundException("Student with this id doesn't exist");
        }

        if (course.students.some(student => student.id === studentId)) {
            throw new ConflictException("The user is already a student");
        }

        course.students.push(newStudent);

        const savedCourse = await this.courseRepository.save(course);

        return new CourseInfoDto(savedCourse);
    }

    async deleteTeacher(courseId: Uuid, callerId: Uuid, teacher: DeleteUserFromCourse) {
        const course = await this.courseRepository.findOne({
            where: { id: courseId },
            relations: ["owner", "teachers", "students", "category"],
        });

        if (!course) {
            throw new NotFoundException("Course with this id doesn't exist");
        }

        const isOwnerOrTeacher =
            course.owner.id === callerId ||
            course.teachers.some(t => t.id === callerId);

        if (!isOwnerOrTeacher) {
            throw new ForbiddenException("You cannot remove teachers from this course");
        }

        const reqTeacher = teacher.userId || callerId;

        const teacherExists = course.teachers.some(t => t.id === reqTeacher);

        if (!teacherExists) {
            throw new NotFoundException("Teacher not found in this course");
        }
    
        course.teachers = course.teachers.filter(t => t.id !== reqTeacher);
    

        await this.courseRepository.save(course);
        return true;
    }
}
