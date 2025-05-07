import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
