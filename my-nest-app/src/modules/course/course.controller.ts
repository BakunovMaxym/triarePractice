import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiBearerAuth, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { CourseDto } from './dto/CourseDto';
import { Auth } from '../../decorators/http.decorators';
import { RoleType } from '../../constants/role-type';
import { AuthUser } from '../../decorators/auth-user.decorator';
import type { UserEntity } from 'modules/user/user.entity';

@ApiTags("courses")
@ApiBearerAuth()
@Controller('course')
export class CourseController {
    constructor(private readonly courseService: CourseService) { }

    @Post()
    @HttpCode(HttpStatus.OK)
    @Auth([RoleType.TEACHER])
    @ApiOkResponse({ type: CourseDto, description: "Course created" })
    async create(
        @Body() createCourseDto: CreateCourseDto,
        @AuthUser() user: UserEntity
    ): Promise<CourseDto> {
        const createdCourse = await this.courseService.create(user.id, createCourseDto);
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

    @Patch(':id')
    @ApiParam({name: "id", type: String})
    @Auth([RoleType.TEACHER, RoleType.STUDENT])
    @ApiOkResponse({ type: CourseDto, description: "Course updated" })
    async update(
        @Param('id') id: Uuid,
        @Body() updateCourseDto: UpdateCourseDto,
        @AuthUser() user: UserEntity
    ): Promise<CourseDto> {
        const updatedCourse = await this.courseService.update(id, user.id, updateCourseDto)
        return updatedCourse.toDto();
    }

    //   @Delete(':id')
    //   remove(@Param('id') id: string) {
    //     return this.courseService.remove(+id);
    //   }
}
