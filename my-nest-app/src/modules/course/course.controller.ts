import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { CourseDto } from './dto/CourseDto';
import { Auth } from '../../decorators/http.decorators';
import { RoleType } from '../../constants/role-type';
import { AuthUser } from '../../decorators/auth-user.decorator';
import type { UserEntity } from 'modules/user/user.entity';
import { CourseInfoDto } from './dto/CurseInfoDto';
import { DeleteUserFromCourse } from './dto/DeleteUserFromCourse';

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
    @ApiParam({ name: "id", type: String })
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


    @Post(':id/at')
    @ApiParam({ name: "id", type: String })
    @Auth([RoleType.TEACHER])
    @ApiOkResponse({ type: CourseInfoDto, description: "" })
    async addTeacher(
        @Param("id") id: Uuid,
        @AuthUser() teacher: UserEntity

    ): Promise<CourseInfoDto> {
        const addedTeacherCourse = await this.courseService.addTeacher(id, teacher.id);
        return addedTeacherCourse;
    }


    @Post(':id/as')
    @ApiParam({ name: "id", type: String })
    @Auth([RoleType.TEACHER, RoleType.STUDENT])
    @ApiOkResponse({ type: CourseInfoDto, description: "" })
    async addStudent(
        @Param("id") id: Uuid,
        @AuthUser() student: UserEntity
    ): Promise<CourseInfoDto> {
        const addedStudentCourse = await this.courseService.addStudent(id, student.id);
        return addedStudentCourse;
    }

    @Delete(":id/dt")
    @ApiParam({ name: "id", type: String })
    @Auth([RoleType.TEACHER])
    @ApiBody({ type: DeleteUserFromCourse })
    @ApiOkResponse({ description: "Teacher successfully deleted" })
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteTeacher(
        @Param("id") id: Uuid,
        @Body() tId: DeleteUserFromCourse,
        @AuthUser() caller: UserEntity
    ): Promise<HttpStatus> {
        const isTeacherDeleted = await this.courseService.deleteTeacher(id, caller.id, tId);
        return isTeacherDeleted ? HttpStatus.NO_CONTENT : HttpStatus.BAD_REQUEST;
    }
    //   @Delete(':id')
    //   remove(@Param('id') id: string) {
    //     return this.courseService.remove(+id);
    //   }
}
