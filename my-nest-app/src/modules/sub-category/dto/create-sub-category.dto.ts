import { IsString, Length } from "class-validator";

export class CreateSubCategoryDto {
    @IsString()
    @Length(2, 50)
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}
