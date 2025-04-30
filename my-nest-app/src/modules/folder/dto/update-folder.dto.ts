import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateFolderDto } from './create-folder.dto';

export class UpdateFolderDto extends PartialType(CreateFolderDto) {
  @ApiProperty({ description: 'Folder name', example: 'Updated Folder', required: false })
  name?: string;
}
