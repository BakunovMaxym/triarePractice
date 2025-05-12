import { StringField, UUIDField } from "../../../decorators/field.decorators";

export class FolderNameDto {
  @UUIDField({ description: 'ID of the folder' })
  id!: Uuid;

  @StringField({ description: 'Name of the folder' })
  name!: string;

  constructor(id: Uuid, name: string) {
    this.id = id;
    this.name = name;
  }
}
