import {
  StringField,
  UUIDField,
} from '../../../decorators/field.decorators.ts';





export class CreateColectionDto {
  @StringField()
  readonly name!: string;
  
  @UUIDField()
  readonly setings_id!: Uuid;

  
}
