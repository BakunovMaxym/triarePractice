import { ApiProperty } from '@nestjs/swagger';
import { StringField } from '../../../decorators/field.decorators';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Назва завдання',
    example: 'Завдання-1',
  })
  @StringField()
  name!: string;

  @ApiProperty({
    description: 'Текст завдання',
    example: 'виконати роботу',
  })
  @StringField()
  textContent!: string;

  fileContent!: Array<Express.Multer.File>
  ownerId!: Uuid;

  courseId!: Uuid;

}
