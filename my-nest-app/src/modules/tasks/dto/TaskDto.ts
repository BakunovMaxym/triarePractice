import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StringField } from '../../../decorators/field.decorators';
import type { UserNameDto } from 'modules/user/dtos/UserNameDto';

export class TaskDto {
  @ApiProperty({
    description: 'Unique name of the task',
    example: 'task-1',
  })
  @StringField()
  name!: string;

  @ApiProperty({
    description: 'Description of the task',
    example: 'This is a sample task description.',
  })
  @StringField()
  content!: string[];

  @ApiProperty({
    description: 'State of the task',
    example: 'open',
  })
  @StringField()
  state!: string;

  @ApiProperty({
    description: 'Owner of the task',
    example: 'Name of the owner',
  })
  owner!: UserNameDto;
  static OPEN: unknown;

  @ApiProperty({
    description: 'Course associated with the task',
    example: 'course-1234',
  })
  @StringField()
  course!: string

  @ApiProperty({
    description: 'Comments associated with the task',
    example: ['comment-1', 'comment-2'],
  })
  @IsArray()
  @IsString({ each: true })
  comments!: string[];
}
