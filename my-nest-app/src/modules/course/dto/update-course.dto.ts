import { PartialType } from '@nestjs/swagger';
import { CourseDto } from './CourseDto';

export class UpdateCourseDto extends PartialType(CourseDto) {}
