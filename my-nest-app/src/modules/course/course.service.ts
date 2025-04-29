import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Transactional } from 'typeorm-transactional';
import { CourseEntity } from './entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, SelectQueryBuilder, type Repository } from 'typeorm';
import { UserEntity } from '../../modules/user/user.entity';
import { CategoryEntity } from '../../modules/category/entities/category.entity';
import { CourseInfoDto } from './dto/CurseInfoDto';
import type { FilterDto } from './dto/FilterDto';
import { SubCategoryEntity } from '../../modules/sub-category/entities/sub-category.entity';
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
        @InjectRepository(SubCategoryEntity)
        private subCategoryRepository: Repository<SubCategoryEntity>,
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

        const subCategory = await this.subCategoryRepository.findOne({ where: { name: createCourseDto.subCategory } });
        if (!subCategory) {
            throw new Error('SubCategory not found');
        }

        const course = this.courseRepository.create({
            name: createCourseDto.name,
            owner,
            category,
            subCategory,
        });

        await this.courseRepository.save(course);

        return course;
    }

    async findAllWithFilters(userId: Uuid, filter: FilterDto): Promise<{
        ownerCourses: CourseInfoDto[];
        teacherCourses: CourseInfoDto[];
        studentCourses: CourseInfoDto[];
    }> {
        // If category filter is provided, verify the category exists
        if (filter.category) {
            const category = await this.categoryRepository.findOne({
                where: { name: filter.category },
            });
            if (!category) {
                // Return empty result if category not found
                return { ownerCourses: [], teacherCourses: [], studentCourses: [] };
            }
        }

        // If subCategory filter is provided, verify it exists (and matches the category if given)
        if (filter.subCategory) {
            const subCategory = await this.subCategoryRepository.findOne({
                where: { name: filter.subCategory },
                // relations: ['category'],
            });
            if (!subCategory) {
                // Return empty result if subCategory not found or doesn't match the category
                return { ownerCourses: [], teacherCourses: [], studentCourses: [] };
            }
        }

        // Build query for courses where the user is the **owner**
        const ownerQB = this.courseRepository
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.owner', 'owner')
            .leftJoinAndSelect('course.teachers', 'teacher')
            .leftJoinAndSelect('course.students', 'student')
            .leftJoinAndSelect('course.category', 'category')
            .leftJoinAndSelect('course.subCategory', 'subCategory')
            .where('owner.id = :userId', { userId });

        // Apply filters to owner query if provided
        if (filter.ownerId) {
            ownerQB.andWhere('owner.id = :ownerId', { ownerId: filter.ownerId });
        }
        if (filter.teacherId) {
            ownerQB.andWhere('teacher.id = :teacherId', { teacherId: filter.teacherId });
        }
        if (filter.category) {
            ownerQB.andWhere('category.name = :category', { category: filter.category });
        }
        if (filter.subCategory) {
            ownerQB.andWhere('subCategory.name = :subCategory', { subCategory: filter.subCategory });
        }

        // Build query for courses where the user is a **teacher**
        const teacherQB = this.courseRepository
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.owner', 'owner')
            .leftJoinAndSelect('course.teachers', 'teacher')
            .leftJoinAndSelect('course.students', 'student')
            .leftJoinAndSelect('course.category', 'category')
            .leftJoinAndSelect('course.subCategory', 'subCategory')
            .where('teacher.id = :userId', { userId });

        // Apply filters to teacher query if provided
        if (filter.ownerId) {
            teacherQB.andWhere('owner.id = :ownerId', { ownerId: filter.ownerId });
        }
        if (filter.teacherId) {
            teacherQB.andWhere('teacher.id = :teacherId', { teacherId: filter.teacherId });
        }
        if (filter.category) {
            teacherQB.andWhere('category.name = :category', { category: filter.category });
        }
        if (filter.subCategory) {
            teacherQB.andWhere('subCategory.name = :subCategory', { subCategory: filter.subCategory });
        }

        // Build query for courses where the user is a **student**
        const studentQB = this.courseRepository
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.owner', 'owner')
            .leftJoinAndSelect('course.teachers', 'teacher')
            .leftJoinAndSelect('course.students', 'student')
            .leftJoinAndSelect('course.category', 'category')
            .leftJoinAndSelect('course.subCategory', 'subCategory')
            .where('student.id = :userId', { userId });

        // Apply filters to student query if provided
        if (filter.ownerId) {
            studentQB.andWhere('owner.id = :ownerId', { ownerId: filter.ownerId });
        }
        if (filter.teacherId) {
            studentQB.andWhere('teacher.id = :teacherId', { teacherId: filter.teacherId });
        }
        if (filter.category) {
            studentQB.andWhere('category.name = :category', { category: filter.category });
        }
        if (filter.subCategory) {
            studentQB.andWhere('subCategory.name = :subCategory', { subCategory: filter.subCategory });
        }

        // Execute all three queries in parallel
        const [ownerCourses, teacherCourses, studentCourses] = await Promise.all([
            ownerQB.getMany(),
            teacherQB.getMany(),
            studentQB.getMany(),
        ]);

        // Map each course entity to CourseInfoDto (assuming a suitable constructor or mapper)
        const ownerCourseDtos = ownerCourses.map(course => new CourseInfoDto(course));
        const teacherCourseDtos = teacherCourses.map(course => new CourseInfoDto(course));
        const studentCourseDtos = studentCourses.map(course => new CourseInfoDto(course));

        // Return the result object with three arrays of CourseInfoDto
        return {
            ownerCourses: ownerCourseDtos,
            teacherCourses: teacherCourseDtos,
            studentCourses: studentCourseDtos,
        };
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

    async deleteTeacher(courseId: Uuid, callerId: Uuid, teacher: Uuid) {
        const course = await this.courseRepository.findOne({
            where: { id: courseId },
            relations: ["owner", "teachers", "students", "category"],
        });

        if (!course) {
            throw new NotFoundException("Course with this id doesn't exist");
        }

        const isOwnerOrTeacher =
            course.owner.id === callerId ||
            callerId === teacher && course.teachers.some(t => t.id === callerId);

        if (!isOwnerOrTeacher) {
            throw new ForbiddenException("You cannot remove teachers from this course");
        }

        const teacherExists = course.teachers.some(t => { return t.id === teacher });

        if (!teacherExists) {
            throw new NotFoundException("Teacher not found in this course");
        }

        course.teachers = course.teachers.filter(t => t.id !== teacher);


        await this.courseRepository.save(course);
        return true;
    }

    async deleteStudent(courseId: Uuid, callerId: Uuid, student: Uuid) {
        const course = await this.courseRepository.findOne({
            where: { id: courseId },
            relations: ["owner", "teachers", "students", "category"],
        });

        if (!course) {
            throw new NotFoundException("Course with this id doesn't exist");
        }

        const isOwnerOrStudent =
            course.owner.id === callerId ||
            callerId === student && course.students.some(t => t.id === callerId);

        if (!isOwnerOrStudent) {
            throw new ForbiddenException("You cannot remove teachers from this course");
        }

        const studentExists = course.students.some(t => { return t.id === student });

        if (!studentExists) {
            throw new NotFoundException("Teacher not found in this course");
        }

        course.students = course.students.filter(t => t.id !== student);


        await this.courseRepository.save(course);
        return true;
    }
}
