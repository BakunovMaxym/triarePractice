import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TurnsService } from './turns.service';
import { CreateTurnDto } from './dto/create-turn.dto';
import { ApiParam } from '@nestjs/swagger';

@Controller('turns')
export class TurnsController {
  constructor(private readonly turnsService: TurnsService) {}

  @Post()
  create(@Body() createTurnDto: CreateTurnDto) {
    return this.turnsService.create(createTurnDto);
  }

  @Get()
  findAll() {
    return this.turnsService.findAll();
  }

  @Get(':id')
  @ApiParam({name:'id', type:'string'})
  findOne(@Param('id') id: Uuid) {
    return this.turnsService.findOne(id);
  }

}
