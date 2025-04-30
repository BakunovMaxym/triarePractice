import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Folder } from './entities/folder.entity';
import { UpdateFolderDto } from './dto/update-folder.dto';
import type { CreateFolderDto } from './dto/create-folder.dto';

@Injectable()
export class FolderService {
  constructor(
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
  ) {}

  async findAll(): Promise<Folder[]> {
    return this.folderRepository.find({
      relations: ['childFolderId', 'childCourseId'],
    });
  }

  async findOne(id: Uuid): Promise<Folder> {
    const folder = await this.folderRepository.findOne({
      where: { id },
      relations: ['childFolderId', 'childCourseId'],
    });
    if (!folder) {
      throw new NotFoundException(`Folder with id ${id} not found`);
    }
    return folder;
  }

  async create(createFolderDto: CreateFolderDto): Promise<Folder> {
    const folder = this.folderRepository.create({
      name: createFolderDto.name,
      childFolderId: createFolderDto.childFolderId
        ? { id: createFolderDto.childFolderId }
        : undefined,
      childCourseId: createFolderDto.childCourseId
        ? { id: createFolderDto.childCourseId }
        : undefined,
    });
    return this.folderRepository.save(folder);
  }

  async update(id: Uuid, updateFolderDto: UpdateFolderDto): Promise<Folder> {
    const folder = await this.folderRepository.findOne({ where: { id } });
    if (!folder) {
      throw new NotFoundException(`Folder with id ${id} not found`);
    }
    Object.assign(folder, updateFolderDto);
    return this.folderRepository.save(folder);
  }

  async remove(id: Uuid): Promise<void> {
    const result = await this.folderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Folder with id ${id} not found`);
    }
  }

  async addFile(folderId: Uuid, fileName: string): Promise<string> {
    return `File "${fileName}" added to folder #${folderId}`;
  }

  async removeFile(folderId: Uuid, fileName: string): Promise<string> {
    return `File "${fileName}" removed from folder #${folderId}`;
  }

  async renameFolder(folderId: Uuid, newName: string): Promise<string> {
    const folder = await this.folderRepository.findOne({ where: { id: folderId } });
    if (!folder) {
      throw new NotFoundException(`Folder with id ${folderId} not found`);
    }
    folder.name = newName;
    await this.folderRepository.save(folder);
    return `Folder #${folderId} renamed to "${newName}"`;
  }

  async addChild(parentId: Uuid, childName: string): Promise<string> {
    return `Child folder "${childName}" added to parent #${parentId}`;
  }
}
