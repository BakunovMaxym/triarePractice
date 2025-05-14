import { PartialType } from '@nestjs/swagger';
import { CreateComunityChestDto } from './create-comunity-chest.dto';

export class UpdateComunityChestDto extends PartialType(CreateComunityChestDto) {}
