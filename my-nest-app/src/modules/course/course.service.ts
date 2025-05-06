import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Transactional } from 'typeorm-transactional';
import { CourseEntity } from './entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, SelectQueryBuilder, type Repository } from 'typeorm';
import { UserEntity } from '../../modules/user/user.entity';
import { CategoryEntity } from '../../modules/category/entities/category.entity';
import { CourseInfoDto } from './dto/CurseInfoDto';
import type { FilterDto } from './dto/FilterDto';
import { SubCategoryEntity } from '../../modules/sub-category/entities/sub-category.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { SingleCourseInfoDto } from './dto/SingleCourseInfoDto';
// import { UserEntity } from 'modules/user/user.entity';

@Injectable()
export class CourseService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @InjectRepository(CourseEntity)
        private courseRepository: Repository<CourseEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(CategoryEntity)
        private categoryRepository: Repository<CategoryEntity>,
        @InjectRepository(SubCategoryEntity)
        private subCategoryRepository: Repository<SubCategoryEntity>,
    ) { }

    async deleteCache(userId: Uuid) {
        const keys: string[] = await this.cacheManager.store.keys(`courses:${userId}:*`);

        if (keys.length > 0) {
            for (const key of keys) {
                await this.cacheManager.store.del(key);
            }
        }
    }

    @Transactional()
    async create(userId: Uuid, createCourseDto: CreateCourseDto): Promise<CourseEntity> {

        const owner = await this.userRepository.findOne({ where: { id: userId } });

        if (!owner) {
            throw new NotFoundException("Користувача не знайдено");
        }

        const category = await this.categoryRepository.findOne({ where: { name: createCourseDto.category } });
        if (!category) {
            throw new NotFoundException('Категорію не знайдено');
        }

        const subCategory = await this.subCategoryRepository.findOne({ where: { name: createCourseDto.subCategory } });
        if (!subCategory) {
            throw new NotFoundException('Підкатегорію не знайдено');
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
        const cacheKey = `courses:${userId}:${JSON.stringify(filter)}`;

        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;

        if (filter.category) {
            const category = await this.categoryRepository.findOne({
                where: { name: filter.category },
            });
            if (!category) {
                return { ownerCourses: [], teacherCourses: [], studentCourses: [] };
            }
        }

        if (filter.subCategory) {
            const subCategory = await this.subCategoryRepository.findOne({
                where: { name: filter.subCategory },
            });
            if (!subCategory) {
                return { ownerCourses: [], teacherCourses: [], studentCourses: [] };
            }
        }

        // owner
        const ownerQB = this.courseRepository
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.owner', 'owner')
            .leftJoinAndSelect('course.teachers', 'teacher')
            .leftJoinAndSelect('course.students', 'student')
            .leftJoinAndSelect('course.category', 'category')
            .leftJoinAndSelect('course.subCategory', 'subCategory')
            .where('owner.id = :userId', { userId });

        if (filter.ownerId) {
            ownerQB.andWhere('owner.id = :ownerId', { ownerId: filter.ownerId });
        }
        if (filter.name) {
            ownerQB.andWhere('course.name = :name', { name: filter.name });
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

        // teacher
        const teacherQB = this.courseRepository
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.owner', 'owner')
            .leftJoinAndSelect('course.teachers', 'teacher')
            .leftJoinAndSelect('course.students', 'student')
            .leftJoinAndSelect('course.category', 'category')
            .leftJoinAndSelect('course.subCategory', 'subCategory')
            .where('teacher.id = :userId', { userId });

        if (filter.ownerId) {
            teacherQB.andWhere('owner.id = :ownerId', { ownerId: filter.ownerId });
        }
        if (filter.name) {
            ownerQB.andWhere('course.name = :name', { name: filter.name });
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

        // student
        const studentQB = this.courseRepository
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.owner', 'owner')
            .leftJoinAndSelect('course.teachers', 'teacher')
            .leftJoinAndSelect('course.students', 'student')
            .leftJoinAndSelect('course.category', 'category')
            .leftJoinAndSelect('course.subCategory', 'subCategory')
            .where('student.id = :userId', { userId });

        if (filter.ownerId) {
            studentQB.andWhere('owner.id = :ownerId', { ownerId: filter.ownerId });
        }
        if (filter.name) {
            ownerQB.andWhere('course.name = :name', { name: filter.name });
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

        const [ownerCourses, teacherCourses, studentCourses] = await Promise.all([
            ownerQB.getMany(),
            teacherQB.getMany(),
            studentQB.getMany(),
        ]);

        const ownerCourseDtos = ownerCourses.map(course => new CourseInfoDto(course));
        const teacherCourseDtos = teacherCourses.map(course => new CourseInfoDto(course));
        const studentCourseDtos = studentCourses.map(course => new CourseInfoDto(course));

        await this.cacheManager.set(cacheKey, {
            ownerCourses: ownerCourseDtos,
            teacherCourses: teacherCourseDtos,
            studentCourses: studentCourseDtos,
        });

        return {
            ownerCourses: ownerCourseDtos,
            teacherCourses: teacherCourseDtos,
            studentCourses: studentCourseDtos,
        };
    }


    async findById(userId: Uuid, courseid: Uuid): Promise<SingleCourseInfoDto> {
        const cacheKey = `courses:${userId}:${courseid}`;

        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;

        const courseQuery = this.courseRepository
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.owner', 'owner')
            .leftJoinAndSelect('course.teachers', 'teacher')
            .leftJoinAndSelect('course.students', 'student')
            .leftJoinAndSelect('course.category', 'category')
            .leftJoinAndSelect('course.subCategory', 'subCategory')
            .leftJoinAndSelect('course.tasks', 'tasks')
            .leftJoinAndSelect('tasks.owner', 'taskOwner')
            .where('course.id = :courseid', { courseid })
            .andWhere(new Brackets(qb =>
                qb.where('owner.id = :userId', { userId })
                    .orWhere('teacher.id = :userId', { userId })
                    .orWhere('student.id = :userId', { userId })
            ))



        const course = await courseQuery.getOne()

        if (!course) {
            throw new NotFoundException("Не вдалось знайти ваш курс")
        }

        await this.cacheManager.set(cacheKey, course);

        return new SingleCourseInfoDto(course)
    }


    async update(id: Uuid, userId: Uuid, updateCourseDto: UpdateCourseDto): Promise<CourseEntity> {
        await this.deleteCache(userId)

        const course = await this.courseRepository.findOne({
            where: { id: id },
            relations: ["owner", "teachers", "students", "category"]
        })

        if (!course) {
            throw new Error("Курс не знайдено");
        }

        const user = await this.userRepository.findOne({ where: { id: userId } })

        if (!user) {
            throw new Error("Користувача не знайдено");
        }

        const isOwner = course.owner.id === userId;
        if (!isOwner) {
            throw new ForbiddenException("Тільки власник має дозвіл")
        }

        Object.assign(course, updateCourseDto)
        await this.courseRepository.save(course)
        return course;
    }

    async addTeacher(courseId: Uuid, teacherId: Uuid): Promise<SingleCourseInfoDto> {
        await this.deleteCache(teacherId)

        const course = await this.courseRepository.findOne({
            where: { id: courseId },
            relations: ["owner", "teachers", "students", "category"],
        });

        if (!course) {
            throw new NotFoundException("Курс не знайдено");
        }

        const newTeacher = await this.userRepository.findOne({ where: { id: teacherId } });

        if (!newTeacher) {
            throw new NotFoundException("Вчителя не знайдено");
        }

        if (course.teachers.some(teacher => teacher.id === teacherId)) {
            throw new ConflictException("Користувач вже у списку вчителів");
        }
        course.teachers.push(newTeacher);
        course.updatedAt = new Date()

        const savedCourse = await this.courseRepository.save(course);

        return new SingleCourseInfoDto(savedCourse);
    }

    async addStudent(courseId: Uuid, studentId: Uuid): Promise<SingleCourseInfoDto> {
        await this.deleteCache(studentId)

        const course = await this.courseRepository.findOne({
            where: { id: courseId },
            relations: ["owner", "teachers", "students", "category"],
        });

        if (!course) {
            throw new NotFoundException("Курс не знайдено");
        }

        const newStudent = await this.userRepository.findOne({ where: { id: studentId } });

        if (!newStudent) {
            throw new NotFoundException("Студента не знайдено");
        }

        if (course.students.some(student => student.id === studentId)) {
            throw new ConflictException("Користувач вже у списку студентів");
        }

        course.students.push(newStudent);

        const savedCourse = await this.courseRepository.save(course);

        return new SingleCourseInfoDto(savedCourse);
    }

    async deleteTeacher(courseId: Uuid, callerId: Uuid, teacher: Uuid) {
        await this.deleteCache(callerId)
        await this.deleteCache(teacher)

        const course = await this.courseRepository.findOne({
            where: { id: courseId },
            relations: ["owner", "teachers", "students", "category"],
        });

        if (!course) {
            throw new NotFoundException("Курс не знайдено");
        }

        const isOwnerOrTeacher =
            course.owner.id === callerId ||
            callerId === teacher && course.teachers.some(t => t.id === callerId);

        if (!isOwnerOrTeacher) {
            throw new ForbiddenException("Ви не маєте прав на видалення викладача з цього курсу");
        }

        const teacherExists = course.teachers.some(t => { return t.id === teacher });

        if (!teacherExists) {
            throw new NotFoundException("Вчителя в курсі не знайдено");
        }

        course.teachers = course.teachers.filter(t => t.id !== teacher);


        await this.courseRepository.save(course);
        return true;
    }

    async deleteStudent(courseId: Uuid, callerId: Uuid, student: Uuid) {
        await this.deleteCache(callerId)
        await this.deleteCache(student)

        const course = await this.courseRepository.findOne({
            where: { id: courseId },
            relations: ["owner", "teachers", "students", "category"],
        });

        if (!course) {
            throw new NotFoundException("Курс не знайдено");
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
