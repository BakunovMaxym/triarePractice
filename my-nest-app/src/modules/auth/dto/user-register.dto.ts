import {
  NumberFieldOptional,
  StringField,
} from '../../../decorators/field.decorators.ts';

export class UserRegisterDto {
  @StringField()
  readonly username!: string;

  @NumberFieldOptional({ nullable: true })
  readonly money?: number;

}
