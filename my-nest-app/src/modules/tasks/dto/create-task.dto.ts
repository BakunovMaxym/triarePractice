import { IsArray, IsString, IsInt } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  name!: string;

  @IsArray()
  content!: string[];

  @IsString()
  state!: string;

  @IsInt()
  ownerId!: Uuid;
}
