import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FolderController } from './folder.controller';
import { FolderService } from './folder.service';
import { Folder } from './entities/folder.entity';
import { CourseEntity } from '../course/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Folder, CourseEntity])],
  controllers: [FolderController],
  providers: [FolderService],
  exports: [FolderService],
})
export class FolderModule {}
