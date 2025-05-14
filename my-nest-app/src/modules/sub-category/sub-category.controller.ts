import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SubCategoryService } from './sub-category.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { SubCategoryEntity } from './entities/sub-category.entity';
import { SubCategoryDto } from './dto/SubCategoryDto';

@ApiTags('sub-categories')
@Controller('sub-categories')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new sub-category' })
  @ApiResponse({ status: 201, description: 'The sub-category has been created.', type: SubCategoryEntity })
  async create(
    @Body() createSubCategoryDto: CreateSubCategoryDto,
  ): Promise<SubCategoryEntity> {
    return await this.subCategoryService.create(createSubCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sub-categories' })
  @ApiResponse({ status: 200, description: 'List of sub-categories', type: [SubCategoryEntity] })
  async findAll(): Promise<SubCategoryDto[]> {
    return await this.subCategoryService.findAll();
  }

  @Get(':name')
  @ApiOperation({ summary: 'Get a sub-category by name' })
  @ApiParam({ name: 'name', description: 'SubCategory name', example: 'name' })
  @ApiResponse({ status: 200, description: 'The found sub-category', type: SubCategoryEntity })
  @ApiResponse({ status: 404, description: 'Sub-category not found' })
  async findOne(
    @Param('name',) name: string,
  ): Promise<SubCategoryDto> {
    return await this.subCategoryService.findOne(name);
  }

  @Patch(':name')
  @ApiOperation({ summary: 'Update a sub-category' })
  @ApiParam({ name: 'name', description: 'SubCategory name', example: 'name' })
  @ApiResponse({ status: 200, description: 'The updated sub-category', type: SubCategoryEntity })
  @ApiResponse({ status: 404, description: 'Sub-category not found' })
  async update(
    @Param('name') name: string,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
  ): Promise<SubCategoryEntity> {
    return await this.subCategoryService.update(name, updateSubCategoryDto);
  }

  @Delete(':name')
  @ApiOperation({ summary: 'Remove a sub-category' })
  @ApiParam({ name: 'name', description: 'SubCategory name', example: 'name' })
  @ApiResponse({ status: 204, description: 'Sub-category successfully deleted' })
  @ApiResponse({ status: 404, description: 'Sub-category not found' })
  async remove(
    @Param('name') name: string,
  ): Promise<void> {
    await this.subCategoryService.remove(name);
  }
}
