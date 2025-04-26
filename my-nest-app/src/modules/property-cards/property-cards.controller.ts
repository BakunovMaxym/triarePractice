import { Controller, Get, Post, Body,  Param } from '@nestjs/common';
import  { PropertyCardsService } from './property-cards.service';
import { CreatePropertyCardDto } from './dto/create-property-card.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('property-cards')
@ApiTags('property-cards')
export class PropertyCardsController {
  constructor(private readonly propertyCardsService: PropertyCardsService) {}

  @Post()
  create(@Body() createPropertyCardDto: CreatePropertyCardDto) {
    return this.propertyCardsService.create(createPropertyCardDto);
  }

  @Get()
  findAll() {
    return this.propertyCardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: Uuid) {
    return this.propertyCardsService.findOne(id);
  }

  
}
