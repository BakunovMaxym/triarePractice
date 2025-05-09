import { ApiProperty } from '@nestjs/swagger';
import { StringField } from '../../../decorators/field.decorators';

export class CreateCommentDto {
  @ApiProperty({
    description: 'content of comment',
    example: 'This is a sample comment.',
  })
  @StringField()
  content!: string;

  ownerId!: Uuid;
}
