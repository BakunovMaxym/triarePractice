import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, type OnGatewayConnection, type OnGatewayDisconnect } from '@nestjs/websockets';
import { GameService } from './game.service';
import type { CreateGameDto } from './dto/create-game.dto';
import { Server, type Socket } from 'socket.io';
import type { GameDto } from './dto/game.dto';
import { AuthService } from '../../modules/auth/auth.service';
import type { joinGameDto } from './dto/join-game.dto';
import { UserService } from '../../modules/user/user.service';
import type { UserDto } from '../../modules/user/dtos/user.dto';
import { RoleType } from '../../constants/role-type';
import type { LoginPayloadDto } from '../../modules/auth/dto/login-payload.dto';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from './ws-auth.guard';
import type { KickDto } from './dto/kick.dto';
import { GameStatuses } from './enums/game-status.enum';
import type { CreateSetingsDto } from '../../modules/setings/dtos/createSetings.dto';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() public server: Server = new Server()

  constructor(
    private readonly gameService: GameService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly wsGuard: WsAuthGuard
  ) { }


  @OnEvent('gameService')
  handleUserAdded({ room, event, data }) {
    this.server.to(room).emit(event, data); 
  }

  handleConnection(client: Socket) {

    const user = this.wsGuard.GetUser(client);

    if (user) {
      client.join(user.game.id);
      client.join(user.id);
      this.server.to(user.game.id).emit('useractive', user.id);
    }
  }

  handleDisconnect(client: Socket) {
    const user = this.wsGuard.GetUser(client);

    if (user) {
      this.server.to(user.game.id).emit('userpasive', user.id);
    }
  }


  @SubscribeMessage('createGame')
  async createGame(@MessageBody() createGameDto: CreateGameDto, @ConnectedSocket() socket: Socket) {

    const game: GameDto = await this.gameService.create(createGameDto);

    const user: UserDto = await this.userService.createUser({ username: createGameDto.username, money: game.colection.setings.starterMoney, role: RoleType.HOST })

    this.gameService.addUserToGame(game.id, user);

    const inGameUser = await this.userService.getUser(user.id);

    socket.join(game.id);
    const token = await this.authService.createAccessToken({ user: inGameUser })

    const loginPayload: LoginPayloadDto = { user: inGameUser, token }

    const curentGame: GameDto = await this.gameService.findOne(game.id)

    this.server.to(game.id).emit('gameCreated', curentGame);
    socket.emit('roomJoined', loginPayload);
    console.log();

    return false;
  }

  @SubscribeMessage('joinGame')
  async JoinGame(@MessageBody() joinGameDto: joinGameDto, @ConnectedSocket() socket: Socket) {
    const game: GameDto = await this.gameService.findOne(joinGameDto.gameId)
    const user: UserDto = await this.userService.createUser({ username: joinGameDto.username, money: game.colection.setings.starterMoney, role: RoleType.USER })

    await this.gameService.addUserToGame(joinGameDto.gameId, user);

    console.log("user", user)

    const inGameUser = await this.userService.getUser(user.id);
    const curentGame: GameDto = await this.gameService.findOne(joinGameDto.gameId)
    const token = await this.authService.createAccessToken({ user: inGameUser })

    const loginPayload: LoginPayloadDto = { user: inGameUser, token }
    socket.join(joinGameDto.gameId);
    this.server.to(joinGameDto.gameId).emit('userJoined', { inGameUser, curentGame });
    socket.emit('roomJoined', loginPayload);

  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('kickFromGame')
  async KickFromGame(@MessageBody() kickDto: KickDto, @ConnectedSocket() socket: Socket, @AuthUser() user: UserDto) {
    const gameId = user.game.id;

    if (user.role !== RoleType.HOST) {
      socket.emit('error', { desription: 'You are not allowed to kick users from the game' });
      return false;
    }
    await this.gameService.kickFromGame(gameId, kickDto.playerId);

    this.server.to(gameId).emit('Kicked', kickDto.playerId);

    (await this.server.sockets.fetchSockets()).forEach((socke) => {
      if (socke.rooms.has(kickDto.playerId)) {
        socke.leave(gameId);
      }
    })
    return true;
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('leaveGame')
  async LeaveGame(@ConnectedSocket() socket: Socket, @AuthUser() user: UserDto) {
    console.log("leavegame")
    const gameId = user.game.id;

    await this.gameService.kickFromGame(gameId, user.id)
    socket.leave(gameId);
    socket.emit('Leave', 'you left the game')

    this.server.to(gameId).emit('userLeft', user.id);
    if (user.role === RoleType.HOST) {
      this.server.to(gameId).emit('kaput');
      this.gameService.deleteGame(gameId);
    }

    return true;
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('changeSettings')
  async SetSettings(@MessageBody() createSettingsDto: CreateSetingsDto, @ConnectedSocket() socket: Socket, @AuthUser() user: UserDto) {
    const gameId = user.game.id;

    const game: GameDto = await this.gameService.findOne(gameId);
    if (user.role !== RoleType.HOST || game.status !== GameStatuses.WITING_PLAYERS) {
      socket.emit('error', { desription: 'You can not change game settings' });
      return false;
    }

    const newColection = await this.gameService.UpdateSettings(game, createSettingsDto)
    this.server.to(gameId).emit('settingsChanged', newColection);
    return true;

  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('startGame')
  async startGame(@ConnectedSocket() socket: Socket, @AuthUser() user: UserDto) {
    const gameId = user.game.id;

    let game: GameDto = await this.gameService.findOne(gameId);
    if (user.role !== RoleType.HOST || game.status !== GameStatuses.WITING_PLAYERS) {
      socket.emit('error', { desription: 'You can not start the game' });
      return false;
    }

    const turnOrder = await this.gameService.startGame(game)
    this.server.to(gameId).emit('gameStarted', turnOrder);
    game = await this.gameService.findOne(gameId);
    this.gameService.StartTurn(game);
    return true;

  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('me')
  async GetMe(@ConnectedSocket() socket: Socket, @AuthUser() user: UserDto) {
    const userDto: UserDto = await this.userService.getUser(user.id);
    console.log(user)
    socket.emit('you', userDto);
    return true;
  }


  @UseGuards(WsAuthGuard)
  @SubscribeMessage('ThrowDice')
  async ThrowDice(@AuthUser() user: UserDto) {
    const game: GameDto = await this.gameService.findOne(user.game.id);
    this.gameService.ThrowDice(game);
  }


  @UseGuards(WsAuthGuard)
  @SubscribeMessage('LandOnProperty')
  async LandOnProperty(@MessageBody() property: { propertyId: Uuid }, @AuthUser() user: UserDto) {
    user = await this.userService.getUser(user.id)
    const game: GameDto = await this.gameService.findOne(user.game.id);
    this.gameService.LandOnProperty(game, property.propertyId, user);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('PayInvoice')
  async PayInvoice(@MessageBody() payInvoiceDto: { cost: number, invoiceId: Uuid }, @AuthUser() user: UserDto) {
    user = await this.userService.getUser(user.id)
    console.log('pay invoice\n',payInvoiceDto)
    this.gameService.PayInvoice(user, payInvoiceDto.cost, payInvoiceDto.invoiceId);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('BuyProperty')
  async BuyProperty(@MessageBody() buyPropertyDto: { peopertyId: Uuid }, @AuthUser() user: UserDto) {
    user = await this.userService.getUser(user.id)
    this.gameService.BuyProperty(user, buyPropertyDto.peopertyId);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('UseGetOutofJailCard')
  async UseGetOutofJailCard(@AuthUser() user: UserDto) {
    user = await this.userService.getUser(user.id)
    this.gameService.UseGetOutofJailCard(user);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('UpgradeProperty')
  async UpgradeProperty(@MessageBody() upgradePropertyDto: { peopertyId: Uuid }, @AuthUser() user: UserDto) {
    user = await this.userService.getUser(user.id)
    this.gameService.UpgradeProperty(user, upgradePropertyDto.peopertyId);
  }
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('EndTurn')
  async EndTurn(@AuthUser() user: UserDto) {
    user = await this.userService.getUser(user.id)
    this.gameService.EndTurn(user);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('GiveUp')
  async GiveUp(@AuthUser() user: UserDto) {
    user = await this.userService.getUser(user.id)
    const game: GameDto = await this.gameService.findOne(user.game.id);
    this.gameService.GiveUp(game, user);
  }



}
