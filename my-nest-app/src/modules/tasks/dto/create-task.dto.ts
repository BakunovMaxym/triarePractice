import { NumberFieldOptional, StringField } from '../../../decorators/field.decorators';

export class CreateTaskDto {
  @StringField({ description: 'Назва завдання', example: 'Завдання-1' })
  name!: string;

  @StringField({ description: 'Текст завдання', example: 'Виконати роботу' })
  textContent!: string;

  @NumberFieldOptional({ description: 'Час на виконання', example: '1 година', nullable: true, default: null })
  timeToComplete!: number | null;

  fileContents!: Array<Express.Multer.File> | { fileId: string, fileName: string, fileUrl: string }[]
  ownerId!: Uuid;

  courseId!: Uuid;

}
