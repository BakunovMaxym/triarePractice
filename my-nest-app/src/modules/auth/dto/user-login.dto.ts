import {
  StringField,
} from '../../../decorators/field.decorators.ts';

export class UserLoginDto {
  @StringField()
  name!: string;


}
