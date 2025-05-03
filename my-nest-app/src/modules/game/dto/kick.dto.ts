import { UUIDField } from "../../../decorators/field.decorators";

export class KickDto {
    @UUIDField()
    playerId!: Uuid
}