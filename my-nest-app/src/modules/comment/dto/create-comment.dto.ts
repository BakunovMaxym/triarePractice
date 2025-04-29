import { ApiProperty } from '@nestjs/swagger';
import { AbstractDto } from '../../../common/dto/abstract.dto';
import { StringField, UUIDField } from '../../../decorators/field.decorators';

export class CreateCommentDto extends AbstractDto {

@ApiProperty({
    description: 'content of comment',
    example: 'This is a sample comment.',
  })
@StringField()  
  content!: string;

    @ApiProperty({
        description: 'Unique identifier for the task',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
  @UUIDField()
  taskId!: Uuid;

    @ApiProperty({
        description: 'Unique identifier for the owner',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
  @UUIDField()
  ownerId!: Uuid;
}
