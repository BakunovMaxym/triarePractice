import { IsString, Length } from "class-validator";

export class CreateCategoryDto {
    @IsString()
    @Length(2, 50)
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}
