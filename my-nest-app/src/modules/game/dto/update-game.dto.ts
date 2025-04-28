import { UUIDField } from '../../../decorators/field.decorators';

export class UpdateGameDto  {
    @UUIDField()
        id!: Uuid;
}
