import { PartialType } from '@nestjs/swagger';
import { CreateTaskFileDto } from './create-task-file.dto';

export class UpdateTaskFileDto extends PartialType(CreateTaskFileDto) {}
