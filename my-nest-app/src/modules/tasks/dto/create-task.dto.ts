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
    example: ['Завдання1: виконати роботу', 'Завдання2: вчасно'],
  })
  @StringField()
  textContent!: string;

  @ApiProperty({
    description: 'Файли завдання',
    example: ['завдання.txt', 'завдання.png'],
  })
  // @StringField()
  fileContent!: string[];

  files!: Array<Express.Multer.File>
  ownerId!: Uuid;

  courseId!: Uuid;



  // @ApiProperty({
  //   description: 'Comments associated with the task',
  //   example: ['comment-1', 'comment-2'],
  // })
  // @IsArray()
  // @IsString({ each: true })
  // comments!: Uuid[];

}
