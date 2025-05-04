import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { GameService } from './game.service';
import { UpdateGameDto } from './dto/update-game.dto';
import type { CreateGameDto } from './dto/create-game.dto';
import { Server, type Socket } from 'socket.io';
import type { GameDto } from './dto/game.dto';
import  { AuthService } from '../../modules/auth/auth.service';
import type { joinGameDto } from './dto/join-game.dto';
import  { UserService } from '../../modules/user/user.service';
import type { UserDto } from '../../modules/user/dtos/user.dto';
import { RoleType } from '../../constants/role-type';
import type { LoginPayloadDto } from '../../modules/auth/dto/login-payload.dto';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from './ws-auth.guard';
import type { KickDto } from './dto/kick.dto';
import { Console } from 'node:console';

@WebSocketGateway()
export class GameGateway {

  @WebSocketServer() server: Server = new Server()

  constructor(
    private readonly gameService: GameService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @SubscribeMessage('createGame')
  async createGame(@MessageBody() createGameDto: CreateGameDto, @ConnectedSocket() socket: Socket) {
    
    const game: GameDto = await this.gameService.create(createGameDto);
    
    const user : UserDto = await this.userService.createUser({username: createGameDto.username, money: game.colection.setings.starterMoney , role: RoleType.HOST })

    this.gameService.addUserToGame(game.id, user);
    
    const inGameUser = await this.userService.getUser(user.id);
    
    socket.join(game.id);
    const token = await this.authService.createAccessToken({user: inGameUser})

    const loginPayload:LoginPayloadDto ={user: inGameUser, token}
    socket.emit('roomJoined', loginPayload);
    this.server.to(game.id).emit('gameCreated', game);
    console.log();
    

    return false;
  }

  @SubscribeMessage('joinGame')
  async JoinGame(@MessageBody() joinGameDto: joinGameDto, @ConnectedSocket() socket: Socket) {
    const game : GameDto = await this.gameService.findOne(joinGameDto.gameId)
    const user : UserDto = await this.userService.createUser({username: joinGameDto.username, money: game.colection.setings.starterMoney, role: RoleType.USER })

    this.gameService.addUserToGame(joinGameDto.gameId, user);

    const inGameUser = await this.userService.getUser(user.id);
    const curentGame : GameDto = await this.gameService.findOne(joinGameDto.gameId)
    const token = await this.authService.createAccessToken({user: inGameUser})

    const loginPayload:LoginPayloadDto ={user: inGameUser, token}
    socket.emit('roomJoined', loginPayload);
    socket.join(joinGameDto.gameId);
    this.server.to(joinGameDto.gameId).emit('userJoined', {inGameUser, curentGame});

  }


  @UseGuards(WsAuthGuard)
  @SubscribeMessage('kickFromGame')
  async KickFromGame(@MessageBody() kickDto: KickDto, @ConnectedSocket() socket: Socket, @AuthUser() user: UserDto) {
    const gameId = [...socket.rooms][1];
    if(user.role !== RoleType.HOST) {
      socket.emit('error', 'You are not allowed to kick users from the game');
      return false;
    }
    await this.gameService.kickFromGame(gameId, kickDto.playerId)

    socket.leave(gameId);
    socket.emit('Kicked', 'you have been kicked');
    this.server.to(gameId).emit('userLeft', kickDto.playerId);
    return true;
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('leaveGame')
  async LeaveGame( @ConnectedSocket() socket: Socket, @AuthUser() user: UserDto) {
    console.log("leavegame")
    const gameId = [...socket.rooms][1];
    if(user.role !== RoleType.HOST) {
      socket.emit('error', 'You are not allowed to kick users from the game');
      return false;
    }
    await this.gameService.kickFromGame(gameId, user.id)
    socket.leave(gameId);
    socket.emit('Leave', 'you left the game')
    this.server.to(gameId).emit('userLeft', user.id);

    return true;
  }

}
