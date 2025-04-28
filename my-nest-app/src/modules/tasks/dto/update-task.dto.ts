import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  content?: string[];

  @IsOptional()
  @IsString()
  state?: string;
}
