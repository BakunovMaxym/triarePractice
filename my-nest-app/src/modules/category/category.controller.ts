import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UsePipes, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';

@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body() createCategoryDto: CreateCategoryDto,
    ): Promise<CategoryEntity> {
        return this.categoryService.create(createCategoryDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<CategoryEntity[]> {
        return this.categoryService.findAll();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(
        @Param('id', ParseIntPipe) id: Uuid,
    ): Promise<CategoryEntity> {
        return this.categoryService.findOne(id);
    }

    @Patch(':id')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('id', ParseIntPipe) id: Uuid,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ): Promise<CategoryEntity> {
        return this.categoryService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('id', ParseIntPipe) id: Uuid,
    ): Promise<void> {
        await this.categoryService.remove(id);
    }
}
