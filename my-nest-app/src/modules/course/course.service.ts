import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Transactional } from 'typeorm-transactional';
import { CourseEntity } from './entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

@Injectable()
export class CourseService {
    constructor(
        @InjectRepository(CourseEntity)
        private courseRepository: Repository<CourseEntity>,
    ) { }

    @Transactional()
    async create(createCourseDto: CreateCourseDto): Promise<CourseEntity> {
        const course = this.courseRepository.create(createCourseDto);
        await this.courseRepository.save(course);

        return course;
    }

    // findAll() {
    //     return `This action returns all course`;
    // }

    // findOne(id: number) {
    //     return `This action returns a #${id} course`;
    // }

    // // update(id: number, updateCourseDto: UpdateCourseDto) {
    // //   return `This action updates a #${id} course`;
    // // }

    // remove(id: number) {
    //     return `This action removes a #${id} course`;
    // }
}
