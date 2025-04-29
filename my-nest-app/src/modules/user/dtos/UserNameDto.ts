import { ApiProperty } from '@nestjs/swagger';

export class UserNameDto {
  @ApiProperty({ example: 1, description: 'ID користувача' })
  id: number;

  @ApiProperty({ description: "Ім'я користувача" })
  firstName: string;

  @ApiProperty({ description: 'Прізвище користувача' })
  lastName: string;

  constructor(user: any) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
  }
}