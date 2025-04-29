import { Optional } from '@nestjs/common';
import { AbstractDto } from '../../../common/dto/abstract.dto';
import { DateField, StringField, UUIDField } from '../../../decorators/field.decorators';
import { ApiProperty } from '@nestjs/swagger';


export class CreateUserTaskDto extends AbstractDto {

 @ApiProperty({
    description: 'Unique identifier for the user task',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @UUIDField()
  userId!: Uuid;

    @ApiProperty({
        description: 'Unique identifier for the task',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
  @UUIDField()
  taskId!: Uuid;

  @ApiProperty({
    description: 'Status of the user task',
    example: 'open',
  })
  @StringField()
  status!: string;

    @ApiProperty({
        description: 'Completion timestamp of the user task',
        example: '2023-10-01T12:00:00Z',
    })
  @Optional()
  @DateField()
  deadline?: string;
}