import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SetingsDto } from './dtos/setings.dto';
import { SetingsService } from './setings.service';
import type { CreateSetingsDto } from './dtos/createSetings.dto';


export const parameterUuid = (key = 'id') =>
    `:${key}(*)`;
  
  export const parameterId = (key = 'id') => `:${key}([0-9]+)`;


@Controller('settings')
@ApiTags('settings')
export class SetingsController {

    constructor(private readonly setingsService: SetingsService) { }


    @Get()
    @HttpCode(HttpStatus.OK)
    async get(): Promise<any> {
        return { message: 'Setings controller is working!' };
    }

    @Get(":id")
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Get users list',
        type: SetingsDto,
    })
    getUser(@Param('id') userId: Uuid): Promise<SetingsDto> {
        return this.setingsService.findOne(userId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({ type: SetingsDto })
    async createSetings(@Body() createSetingsDto: CreateSetingsDto): Promise<SetingsDto> {
        return this.setingsService.createSetings(createSetingsDto);
    }

   

}
