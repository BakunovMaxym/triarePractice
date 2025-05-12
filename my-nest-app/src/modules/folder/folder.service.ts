import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Folder } from './entities/folder.entity';
import { UpdateFolderDto } from './dto/update-folder.dto';
import type { CreateFolderDto } from './dto/create-folder.dto';
import { FolderDto } from './dto/FolderDto';

@Injectable()
export class FolderService {
  constructor(
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
  ) {}

  async findAll(): Promise<Folder[]> {
    return this.folderRepository.find({
      relations: ['parentFolder', 'childFolders'],
    });
  }

  async findOne(id: Uuid): Promise<Folder> {
    const folder = await this.folderRepository.findOne({
      where: { id },
      relations: ['parentFolder', 'childFolders'],
    });
    if (!folder) {
      throw new NotFoundException(`Folder with id ${id} not found`);
    }
    return folder;
  }

  async create(createFolderDto: CreateFolderDto): Promise<FolderDto> {
    let parentFolder: Folder | undefined = undefined;
    if (createFolderDto.parentFolderId) {
      parentFolder = await this.folderRepository.findOne({ where: { id: createFolderDto.parentFolderId } }) ?? undefined;
    }

    const folder = this.folderRepository.create({
      name: createFolderDto.name,
      parentFolder,
    });

    const savedFolder = await this.folderRepository.save(folder);

    return new FolderDto(savedFolder);
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

  async renameFolder(folderId: Uuid, newName: string): Promise<string> {
    const folder = await this.folderRepository.findOne({ where: { id: folderId } });
    if (!folder) {
      throw new NotFoundException(`Folder with id ${folderId} not found`);
    }
    folder.name = newName;
    const savedFolder = await this.folderRepository.save(folder);
    return savedFolder.name;
  }

  async addChild(parentId: Uuid, childName: string): Promise<FolderDto> {
    const parent = await this.findOne(parentId);
    const child = this.folderRepository.create({ name: childName, parentFolder: parent });
    const childFolder = await this.folderRepository.save(child);
    return new FolderDto(childFolder);
  }
}
