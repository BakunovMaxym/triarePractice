import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Transactional } from 'typeorm-transactional';
import { CourseEntity } from './entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, type Repository } from 'typeorm';
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

        // Очищення кешу курсів для цього користувача, щоб новий курс з'явився у списку
        await this.deleteCache(userId);

        return course;
    }

    async findAllWithFilters(userId: Uuid, filter: FilterDto): Promise<{
        ownerCourses: CourseInfoDto[];
        teacherCourses: CourseInfoDto[];
        studentCourses: CourseInfoDto[];
    }> {
        // Ігноруємо userId, повертаємо всі курси
        const cacheKey = `courses:all:${JSON.stringify(filter)}`;

        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;

        const qb = this.courseRepository
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.owner', 'owner')
            .leftJoinAndSelect('course.teachers', 'teacher')
            .leftJoinAndSelect('course.students', 'student')
            .leftJoinAndSelect('course.category', 'category')
            .leftJoinAndSelect('course.subCategory', 'subCategory');

        if (filter?.ownerId) {
            qb.andWhere('owner.id = :ownerId', { ownerId: filter.ownerId });
        }
        if (filter?.name) {
            qb.andWhere('course.name = :name', { name: filter.name });
        }
        if (filter?.teacherId) {
            qb.andWhere('teacher.id = :teacherId', { teacherId: filter.teacherId });
        }
        if (filter?.category) {
            qb.andWhere('category.name = :category', { category: filter.category });
        }
        if (filter?.subCategory) {
            qb.andWhere('subCategory.name = :subCategory', { subCategory: filter.subCategory });
        }

        const allCourses = await qb.getMany();
        const courseDtos = allCourses.map(course => new CourseInfoDto(course));

        // Всі курси повертаємо як ownerCourses, інші масиви порожні
        const result = {
            ownerCourses: courseDtos,
            teacherCourses: [],
            studentCourses: [],
        };

        await this.cacheManager.set(cacheKey, result);

        return result;
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
            relations: ["owner", "teachers", "students", "category", "subCategory"]
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
