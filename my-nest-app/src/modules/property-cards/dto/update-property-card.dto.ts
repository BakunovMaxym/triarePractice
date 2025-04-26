import { PartialType } from '@nestjs/swagger';
import { CreatePropertyCardDto } from './create-property-card.dto';

export class UpdatePropertyCardDto extends PartialType(CreatePropertyCardDto) {}
