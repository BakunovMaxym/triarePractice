import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import {  ApiCreatedResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SetingsDto } from './dtos/setings.dto';
import { SetingsService } from './setings.service';
import { CreateSetingsDto } from './dtos/createSetings.dto';



@Controller('settings')
@ApiTags('settings')
export class SetingsController {

    constructor(private readonly setingsService: SetingsService) { }


    @Get()
    @HttpCode(HttpStatus.OK)
    async get(): Promise<SetingsDto[]> {
        return this.setingsService.getSetings();
    }

    @Get(":id")
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Get users list',
        type: SetingsDto,
    })
    @ApiParam({name:"id", type: String})
    getUser(@Param('id') userId: Uuid): Promise<SetingsDto> {
        console.log(userId);
        return this.setingsService.findOne(userId);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({ type: SetingsDto })
    async createSetings(@Body() createSetingsDto: CreateSetingsDto): Promise<SetingsDto> {
        return this.setingsService.createSetings(createSetingsDto);
    }

   

}
