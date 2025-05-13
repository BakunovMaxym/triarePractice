import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import { FolderService } from './folder.service';
import { CreateFolderDto } from './dto/create-folder.dto';

@Controller('folder')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get folder by ID' })
  @ApiParam({ name: 'id', description: 'Folder ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Folder found' })
  findOne(@Param('id') id: Uuid) {
    return this.folderService.findOne(id);
  }

  @Get()
  async findAll() {
    return this.folderService.findAll();
  }

  @Patch(':id/rename')
  @ApiOperation({ summary: 'Rename a folder' })
  @ApiParam({ name: 'id', description: 'Folder ID', type: 'string' })
  @ApiBody({ schema: { type: 'object', properties: { newName: { type: 'string', example: 'New Folder Name' } } } })
  @ApiResponse({ status: 200, description: 'Folder renamed successfully' })
  renameFolder(@Param('id') id: Uuid, @Body('newName') newName: string) {
    return this.folderService.renameFolder(id, newName);
  }

  @Post(':id/add-child')
  @ApiOperation({ summary: 'Add a child folder to a folder' })
  @ApiParam({ name: 'id', description: 'Parent folder ID', type: 'string' })
  @ApiBody({ schema: { 
    type: 'object', 
    properties: { 
      childName: { type: 'string', example: 'Child Folder Name' },
      childCourseId: { type: 'string', example: 'Course UUID' }
    } 
  } })
  @ApiResponse({ status: 200, description: 'Child folder added successfully' })
  async addChild(
    @Param('id') id: Uuid, 
    @Body() body: { childName?: string, childCourseId?: Uuid }
  ) {
    return this.folderService.addChild(id, body.childName, body.childCourseId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new folder' })
  @ApiBody({ type: CreateFolderDto })
  @ApiResponse({ status: 201, description: 'Folder created successfully' })
  async create(@Body() createFolderDto: CreateFolderDto) {
    return this.folderService.create(createFolderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a folder by ID' })
  @ApiParam({ name: 'id', description: 'Folder ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'Folder deleted successfully' })
  async remove(@Param('id') id: Uuid): Promise<void> {
    await this.folderService.remove(id);
  }
}
