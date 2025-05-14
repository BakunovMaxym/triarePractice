import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ChanceCardsService } from './chance-cards.service';
import { CreateChanceCardDto } from './dto/create-chance-card.dto';
import { ApiParam } from '@nestjs/swagger';

@Controller('chance-cards')
export class ChanceCardsController {
  constructor(private readonly chanceCardsService: ChanceCardsService) {}

  @Post()
  create(@Body() createChanceCardDto: CreateChanceCardDto) {
    return this.chanceCardsService.create(createChanceCardDto);
  }

  @Get()
  findAll() {
    return this.chanceCardsService.findAll();
  }

  @Get(':id')
  @ApiParam({name: 'id', type: 'string', required: true})
  findOne(@Param('id') id: Uuid) {
    return this.chanceCardsService.findOne(id);
  }

  @Get('colection/:id')
  @ApiParam({name: 'id', type: 'string', required: true})
  findByColection(@Param('id') id: Uuid) {
    return this.chanceCardsService.findAllByColectionId(id);
  }
}
