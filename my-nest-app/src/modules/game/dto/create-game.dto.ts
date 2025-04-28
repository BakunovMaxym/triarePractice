import { UUIDField } from "../../../decorators/field.decorators";

export class CreateGameDto{
    
    @UUIDField()
    id!: Uuid;
}
