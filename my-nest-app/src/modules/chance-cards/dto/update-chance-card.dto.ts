import { PartialType } from '@nestjs/swagger';
import { CreateChanceCardDto } from './create-chance-card.dto';

export class UpdateChanceCardDto extends PartialType(CreateChanceCardDto) {}
