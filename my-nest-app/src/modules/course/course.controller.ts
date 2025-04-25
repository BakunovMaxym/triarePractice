import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { CourseDto } from './dto/CourseDto';

@Controller('course')
export class CourseController {
    constructor(private readonly courseService: CourseService) { }

    @Post()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: CourseDto, description: "Course created" })
    async create(@Body() createCourseDto: CreateCourseDto): Promise<CourseDto> {

        const createdCourse = await this.courseService.create(createCourseDto);
        return createdCourse.toDto();
    }

    //   @Get()
    //   findAll() {
    //     return this.courseService.findAll();
    //   }

    //   @Get(':id')
    //   findOne(@Param('id') id: string) {
    //     return this.courseService.findOne(+id);
    //   }

    //   @Patch(':id')
    //   update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    //     return this.courseService.update(+id, updateCourseDto);
    //   }

    //   @Delete(':id')
    //   remove(@Param('id') id: string) {
    //     return this.courseService.remove(+id);
    //   }
}
