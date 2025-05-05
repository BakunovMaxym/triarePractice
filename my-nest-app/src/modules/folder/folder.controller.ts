import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import { FolderService } from './folder.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

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

  @Post(':id/add-file')
  @ApiOperation({ summary: 'Add a file to a folder' })
  @ApiParam({ name: 'id', description: 'Folder ID', type: 'string' })
  @ApiBody({ schema: { type: 'string', example: 'filename.txt', description: 'File name to add' } })
  @ApiResponse({ status: 200, description: 'File added successfully' })
  addFile(@Param('id') id: Uuid, @Body() fileName: string) {
    return this.folderService.addFile(id, fileName);
  }

  @Delete(':id/remove-file')
  @ApiOperation({ summary: 'Remove a file from a folder' })
  @ApiParam({ name: 'id', description: 'Folder ID', type: 'string' })
  @ApiBody({ schema: { type: 'string', example: 'filename.txt', description: 'File name to remove' } })
  @ApiResponse({ status: 200, description: 'File removed successfully' })
  removeFile(@Param('id') id: Uuid, @Body() fileName: string) {
    return this.folderService.removeFile(id, fileName);
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
  @ApiOperation({ summary: 'Add a child folder to a folder or course' })
  @ApiParam({ name: 'id', description: 'Folder or Course ID', type: 'string' })
  @ApiBody({ schema: { type: 'object', properties: { childName: { type: 'string', example: 'Child Folder Name' } } } })
  @ApiResponse({ status: 200, description: 'Child folder added successfully' })
  addChild(@Param('id') id: Uuid, @Body('childName') childName: string) {
    return this.folderService.addChild(id, childName);
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
