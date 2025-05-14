import { Controller, Get, Param } from '@nestjs/common';
import  { GameService } from './game.service';
import { ApiParam } from '@nestjs/swagger';

@Controller('game')
export class GameController {

    constructor(
        private readonly gameService: GameService,
    ){
    }
    @Get(':id')
    @ApiParam({ name: 'id', required: true, type: String })
    getGame(@Param('id') id: Uuid) {
        return this.gameService.getGame(id);
    }
}
