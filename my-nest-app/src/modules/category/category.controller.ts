import { Controller, Get, Post, Patch, Delete, Body, Param, UsePipes, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
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

    @Get(':name')
    @HttpCode(HttpStatus.OK)
    async findOne(
        @Param('name') name: string,
    ): Promise<CategoryEntity> {
        return this.categoryService.findOne(name);
    }

    @Patch(':name')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('name') name: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ): Promise<CategoryEntity> {
        return this.categoryService.update(name, updateCategoryDto);
    }

    @Delete(':name')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('name') name: string,
    ): Promise<void> {
        await this.categoryService.remove(name);
    }
}
