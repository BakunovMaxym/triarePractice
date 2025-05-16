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
  ) { }

  async findAll(): Promise<FolderDto[]> {
    const folders = await this.folderRepository.find({
      relations: {
        parentFolder: true,
        childFolders: true,
        childCourses: true,
        owner: true
      }
    });
    return folders.map(f => new FolderDto(f));
  }

  async findOne(id: Uuid): Promise<FolderDto> {
    const folder = await this.folderRepository.findOne({
      where: { id },
      relations: {
        parentFolder: true,
        childFolders: true,
        childCourses: true,
        owner: true
      }
    });
    if (!folder) {
      throw new NotFoundException(`Folder with id ${id} not found`);
    }
    console.log(folder)
    return new FolderDto(folder);
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

    let childCourses: CourseEntity[] = [];
    if (createFolderDto.courseIds?.length) {
      const foundCourses = await Promise.all(
        createFolderDto.courseIds.map(courseId => this.courseRepository.findOneBy({ id: courseId }))
      );
      childCourses = foundCourses.filter(Boolean) as CourseEntity[];
    }


    const folder = this.folderRepository.create({
      name: createFolderDto.name,
      parentFolder,
      childCourses,
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
    // Видалити всі дочірні папки рекурсивно
    const folder = await this.folderRepository.findOne({
      where: { id },
      relations: { childFolders: true },
    });
    if (!folder) {
      throw new NotFoundException(`Folder with id ${id} not found`);
    }
    // Рекурсивно видалити дочірні папки
    if (folder.childFolders && folder.childFolders.length > 0) {
      for (const child of folder.childFolders) {
        await this.remove(child.id);
      }
    }
    // Видалити саму папку
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
    const folder = await this.folderRepository.findOne({
      where: { id: parentId },
      relations: { owner: true },
    });
    if (!folder) throw new NotFoundException(`Folder with id ${parentId} not found`);

    if (childCourseId) {
      const course = await this.courseRepository.findOne({ where: { id: childCourseId } });
      if (!course) throw new NotFoundException(`Course with id ${childCourseId} not found`);
      course.folder = folder;
      await this.courseRepository.save(course);
    }

    if (childName) {
      const child = this.folderRepository.create({
        name: childName,
        parentFolder: folder,
        owner: folder.owner,
      });
      await this.folderRepository.save(child);
    }

    const updatedFolder = await this.folderRepository.findOneOrFail({
      where: { id: parentId },
      relations: ['owner', 'childCourses', 'childFolders', 'parentFolder'],
    });
    return new FolderDto(updatedFolder);
  }
}
