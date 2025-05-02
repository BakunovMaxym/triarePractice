import { StringField } from "../../../decorators/field.decorators";

export class CreateSubCategoryDto {
    @StringField({minLength: 2, maxLength: 50})
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}
