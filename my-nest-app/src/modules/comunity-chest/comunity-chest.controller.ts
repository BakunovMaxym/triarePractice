import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ComunityChestService } from './comunity-chest.service';
import { CreateComunityChestDto } from './dto/create-comunity-chest.dto';
import { ApiParam } from '@nestjs/swagger';

@Controller('comunity-chest')
export class ComunityChestController {
  constructor(private readonly comunityChestService: ComunityChestService) {}

  @Post()
  create(@Body() createComunityChestDto: CreateComunityChestDto) {
    console.log('createComunityChestDto', createComunityChestDto);
    return this.comunityChestService.create(createComunityChestDto);
  }

  @Get('/colection/:id')
  @ApiParam({name: 'id', type: 'string'})
  findAll(@Param('id') id: Uuid) {
    return this.comunityChestService.findAllFromColection(id);
  }

  @Get(':id')
  @ApiParam({name: 'id', type: 'string'})
  findOne(@Param('id') id: Uuid) {
    return this.comunityChestService.findOne(id);
  }


}
