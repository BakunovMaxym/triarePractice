import { Injectable } from '@nestjs/common';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(CategoryEntity)
        private readonly categoryRepository: Repository<CategoryEntity>,
    ) { }

    async create(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
        const category = this.categoryRepository.create(createCategoryDto);
        return this.categoryRepository.save(category);
    }
    async findAll(): Promise<CategoryEntity[]> {
        return this.categoryRepository.find({ relations: ['courses'] });
    }
    async findOne(name: string): Promise<CategoryEntity> {
        const category = await this.categoryRepository.findOne({ where: { name }, relations: ['courses'] });
        if (!category) {
            throw new Error(`Category with name ${name} not found`);
        }
        return category;
    }
    async update(name: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryEntity> {
        const category = await this.categoryRepository.preload({ name, ...updateCategoryDto });
        if (!category) {
            throw new Error(`Category with name ${name} not found`);
        }
        return this.categoryRepository.save(category);
    }
    async remove(name: string): Promise<void> {
        const result = await this.categoryRepository.delete(name);
        if (result.affected === 0) {
            throw new Error(`Category with name ${name} not found`);
        }
    }
}
