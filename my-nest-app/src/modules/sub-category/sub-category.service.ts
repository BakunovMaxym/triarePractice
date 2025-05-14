import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { SubCategoryEntity } from './entities/sub-category.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { SubCategoryDto } from './dto/SubCategoryDto';

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

  async findAll(): Promise<SubCategoryDto[]> {
    const cacheKey = 'sub-categories';
    const cached = await this.cacheManager.get<SubCategoryDto[]>(cacheKey);
    if (cached) return cached;

    const subs = await this.subCategoryRepo.find({ relations: ['courses'] });
    const subCatDto = subs.map(subCat => new SubCategoryDto(subCat))
    await this.cacheManager.set(cacheKey, subCatDto);
    return subCatDto;
  }

  async findOne(name: string): Promise<SubCategoryDto> {
    const cacheKey = `sub-category:${name}`;
    const cached = await this.cacheManager.get<SubCategoryDto>(cacheKey);
    if (cached) return cached;

    const sub = await this.subCategoryRepo.findOne({
      where: { name },
      relations: ['courses'],
    });
    if (!sub) {
      throw new NotFoundException(`SubCategory #${name} not found`);
    }

    const subCatDto = new SubCategoryDto(sub)
    await this.cacheManager.set(cacheKey, subCatDto);
    return subCatDto;
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
