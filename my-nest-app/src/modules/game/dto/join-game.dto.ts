import { StringField, UUIDField } from "../../../decorators/field.decorators";

export class joinGameDto{
    @StringField()
    username!: string;

    @UUIDField()
    gameId!: Uuid;

}