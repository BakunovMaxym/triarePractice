import { PartialType } from '@nestjs/swagger';
import { CreateUserTaskFileDto } from './create-user-task-file.dto';

export class UpdateUserTaskFileDto extends PartialType(CreateUserTaskFileDto) {}
 