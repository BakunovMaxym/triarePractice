import {  UUIDField } from "decorators/field.decorators";

export class CreatePropertyDto {

    @UUIDField({ nullable: false })
    property!: Uuid;

}
