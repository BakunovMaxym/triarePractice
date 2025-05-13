import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Folder } from './entities/folder.entity';
import { UpdateFolderDto } from './dto/update-folder.dto';
import type { CreateFolderDto } from './dto/create-folder.dto';
import { FolderDto } from './dto/FolderDto';
import { CourseEntity } from '../../modules/course/entities/course.entity';
import { UserEntity } from '../../modules/user/user.entity';

@Injectable()
export class FolderService {
  constructor(
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
  ) {}

  async findAll(): Promise<FolderDto[]> {
    const folders = await this.folderRepository.find({
      relations: [
        'parentFolder',
        'childFolders',
        'childCourses',
        'owner',
      ],
    });
    return folders.map(f => new FolderDto(f));
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

    // Fetch owner entity
    const owner = await this.folderRepository.manager.getRepository(UserEntity).findOne({
      where: { id: createFolderDto.ownerId },
    });
    if (!owner) {
      throw new NotFoundException(`Owner with id ${createFolderDto.ownerId} not found`);
    }

    const folder = this.folderRepository.create({
      name: createFolderDto.name,
      parentFolder,
      owner,
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

  async addChild(parentId: Uuid, childName?: string, childCourseId?: Uuid): Promise<FolderDto> {
    if (childCourseId) {
      // Move course to folder
      const folder = await this.folderRepository.findOne({ where: { id: parentId } });
      if (!folder) throw new NotFoundException(`Folder with id ${parentId} not found`);
      const course = await this.courseRepository.findOne({ where: { id: childCourseId } });
      if (!course) throw new NotFoundException(`Course with id ${childCourseId} not found`);
      course.folder = folder;
      await this.courseRepository.save(course);
      // Return updated folder with courses
      const updatedFolder = await this.folderRepository.findOne({
        where: { id: parentId },
        relations: ['parentFolder', 'childFolders', 'childCourses', 'owner'],
      });
      return new FolderDto(updatedFolder!);
    }
    if (!childName) {
      throw new Error('childName is required to create a child folder');
    }
    const parent = await this.findOne(parentId);
    const child = this.folderRepository.create({ name: childName, parentFolder: parent });
    const childFolder = await this.folderRepository.save(child);
    return new FolderDto(childFolder);
  }
}
