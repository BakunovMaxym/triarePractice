import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubCategoryController } from './sub-category.controller';
import { SubCategoryService } from './sub-category.service';
import { SubCategoryEntity } from './entities/sub-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubCategoryEntity])],
  controllers: [SubCategoryController],
  providers: [SubCategoryService],
  exports: [SubCategoryService],
})
export class CategoryModule {}
