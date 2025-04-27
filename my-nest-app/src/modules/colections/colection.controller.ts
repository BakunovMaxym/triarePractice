import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiParam,  ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../common/dto/page.dto.ts';
import { ApiPageResponse } from '../../decorators/api-page-response.decorator.ts';
import { UUIDParam } from '../../decorators/http.decorators.ts';
import { ColectionDto } from './dtos/colection.dto.ts';
import { ColectionService } from './colection.service.ts';
import { CreateColectionDto } from './dtos/createColection.dto.ts';


@Controller('colections')
@ApiTags('colections')
export class ColectionController {
  constructor(
    public colectionService: ColectionService,
  ) { }



  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiPageResponse({
    description: 'Get users list',
    type: PageDto,
  })
  getUsers(): Promise<ColectionDto[]> {
    return this.colectionService.getColections();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get users list',
    type: ColectionDto,
  })
  @ApiParam({name: "id", type: String})
  getUser(@UUIDParam('id') userId: Uuid): Promise<ColectionDto> {
    return this.colectionService.getColection(userId);
  }


  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: ColectionDto })
  async createSetings(@Body() createColectionDto: CreateColectionDto): Promise<ColectionDto> {
    return this.colectionService.createColection(createColectionDto);
  }
}
