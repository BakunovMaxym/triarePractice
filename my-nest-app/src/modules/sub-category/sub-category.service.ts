import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { SubCategoryEntity } from './entities/sub-category.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class SubCategoryService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(SubCategoryEntity)
    private readonly subCategoryRepo: Repository<SubCategoryEntity>,
  ) { }

  async create(dto: CreateSubCategoryDto): Promise<SubCategoryEntity> {
    await this.cacheManager.store.del('sub-categories');
    const sub = this.subCategoryRepo.create(dto);
    return this.subCategoryRepo.save(sub);
  }

  async findAll(): Promise<SubCategoryEntity[]> {
    const cacheKey = 'sub-categories';
    const cached = await this.cacheManager.get<SubCategoryEntity[]>(cacheKey);
    if (cached) return cached;

    const subs = await this.subCategoryRepo.find({ relations: ['courses'] });
    await this.cacheManager.set(cacheKey, subs);
    return subs;
  }

  async findOne(name: string): Promise<SubCategoryEntity> {
    const cacheKey = `sub-category:${name}`;
    const cached = await this.cacheManager.get<SubCategoryEntity>(cacheKey);
    if (cached) {
      // Always fetch from DB to ensure a real entity is returned
      const sub = await this.subCategoryRepo.findOne({
        where: { name },
        relations: ['courses'],
      });
      if (sub) return sub;
      throw new NotFoundException(`SubCategory #${name} not found`);
    }

    const sub = await this.subCategoryRepo.findOne({
      where: { name },
      relations: ['courses'],
    });
    if (!sub) {
      throw new NotFoundException(`SubCategory #${name} not found`);
    }
    await this.cacheManager.set(cacheKey, { ...sub });
    return sub;
  }

  async update(name: string, dto: UpdateSubCategoryDto): Promise<SubCategoryEntity> {
    await this.cacheManager.store.del('sub-categories');
    await this.cacheManager.store.del(`sub-category:${name}`);

    // Find by name to get the id
    const existing = await this.subCategoryRepo.findOne({ where: { name } });
    if (!existing) {
      throw new NotFoundException(`SubCategory ${name} not found`);
    }

    // Preload by id, not name
    const result = await this.subCategoryRepo.preload({ id: existing.id, ...dto });
    if (!result) {
      throw new NotFoundException(`SubCategory ${name} not found`);
    }
    return this.subCategoryRepo.save(result);
  }

  async remove(name: string): Promise<void> {
    await this.cacheManager.store.del('sub-categories');
    await this.cacheManager.store.del(`sub-category:${name}`);
    // Find by name to get the id
    const existing = await this.subCategoryRepo.findOne({ where: { name } });
    if (!existing) {
      throw new NotFoundException(`SubCategory ${name} not found`);
    }
    const result = await this.subCategoryRepo.delete(existing.id);
    if (result.affected === 0) {
      throw new NotFoundException(`SubCategory ${name} not found`);
    }
  }
}
