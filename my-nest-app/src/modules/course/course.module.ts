import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from './entities/course.entity';
import { UserEntity } from '../../modules/user/user.entity';
import { CategoryEntity } from '../../modules/category/entities/category.entity';
import { SubCategoryEntity } from '../../modules/sub-category/entities/sub-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity, UserEntity, CategoryEntity, SubCategoryEntity])],
  controllers: [CourseController],
  exports: [CourseService],
  providers: [CourseService],
})
export class CourseModule { }
