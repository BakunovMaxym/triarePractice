import { Inject, Injectable } from '@nestjs/common';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from './entities/category.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CategoryService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @InjectRepository(CategoryEntity)
        private readonly categoryRepository: Repository<CategoryEntity>,
    ) { }

    async create(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
        await this.cacheManager.store.del("categories");
        const category = this.categoryRepository.create(createCategoryDto);
        return this.categoryRepository.save(category);
    }
    async findAll(): Promise<CategoryEntity[]> {
        const cacheKey = `categories`;
    
        const cached = await this.cacheManager.get<CategoryEntity[]>(cacheKey);
        if (cached) return cached;
    
        const categories = await this.categoryRepository.find({ relations: ['courses'] });
        await this.cacheManager.set(cacheKey, categories);
    
        return categories;
    }
    async findOne(name: string): Promise<CategoryEntity> {
        const cacheKey = `category:${name}`;

        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;

        const category = await this.categoryRepository.findOne({ where: { name }, relations: ['courses'] });
        if (!category) {
            throw new Error(`Category with name ${name} not found`);
        }

        await this.cacheManager.set(cacheKey, category)
        return category;
    }
    async update(name: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryEntity> {
        await this.cacheManager.store.del("categories");
        await this.cacheManager.store.del(`category:${name}`);
        
        const category = await this.categoryRepository.preload({ name, ...updateCategoryDto });
        if (!category) {
            throw new Error(`Category with name ${name} not found`);
        }
        return this.categoryRepository.save(category);
    }
    async remove(name: string): Promise<void> {
        await this.cacheManager.store.del("categories");
        const result = await this.categoryRepository.delete(name);
        if (result.affected === 0) {
            throw new Error(`Category with name ${name} not found`);
        }
    }
}
