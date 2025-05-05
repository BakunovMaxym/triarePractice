import type { UserEntity } from '../user.entity';
import { StringField, UUIDField } from '../../../decorators/field.decorators';

export class UserNameDto {
  @UUIDField({ example: 1, description: 'ID користувача' })
  id: Uuid;

  @StringField({ description: "Ім'я користувача" })
  firstName: string;

  @StringField({ description: 'Прізвище користувача' })
  lastName: string;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
  }
}