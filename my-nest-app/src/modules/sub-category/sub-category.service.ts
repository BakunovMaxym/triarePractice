import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { SubCategoryEntity } from './entities/sub-category.entity';
import { CourseEntity } from '../course/entities/course.entity';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectRepository(SubCategoryEntity)
    private readonly subCategoryRepo: Repository<SubCategoryEntity>,
  ) {}

  async create(dto: CreateSubCategoryDto): Promise<SubCategoryEntity> {
    const sub = this.subCategoryRepo.create(dto);
    return this.subCategoryRepo.save(sub);
  }

  async findAll(): Promise<SubCategoryEntity[]> {
    return this.subCategoryRepo.find({ relations: ['courses'] });
  }

  async findOne(name: string): Promise<SubCategoryEntity> {
    const sub = await this.subCategoryRepo.findOne({
      where: { name },
      relations: ['courses'],
    });
    if (!sub) {
      throw new NotFoundException(`SubCategory #${name} not found`);
    }
    return sub;
  }

  async update(name: string, dto: UpdateSubCategoryDto): Promise<SubCategoryEntity> {
    const result = await this.subCategoryRepo.preload({ name, ...dto });
    if (!result) {
      throw new NotFoundException(`SubCategory ${name} not found`);
    }
    return this.subCategoryRepo.save(result);
  }

  async remove(name: string): Promise<void> {
    const result = await this.subCategoryRepo.delete(name);
    if (result.affected === 0) {
      throw new NotFoundException(`SubCategory ${name} not found`);
    }
  }
}
