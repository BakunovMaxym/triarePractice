import { IsArray, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StringField, UUIDField } from '../../../decorators/field.decorators';

export class CreateTaskDto {
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
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @UUIDField()
  ownerId!: Uuid;
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
