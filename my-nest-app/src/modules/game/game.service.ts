import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import  { ColectionService } from '../../modules/colections/colection.service';
import  { Repository } from 'typeorm';
import  { GameEntity } from './entities/game.entity';
import type { CreateGameDto } from './dto/create-game.dto';
import  { PropertyService } from '../../modules/property/property.service';
import type { UserDto } from '../../modules/user/dtos/user.dto';
import  { UserEntity } from '../../modules/user/user.entity';

@Injectable()
export class GameService {
  async kickFromGame(gameId: Uuid, playerId: Uuid) {
    const game = await this.gameRepository.findOneOrFail({
      where: { id: gameId },
      relations:{
        users:true,
        propertys:{
          owner:true,
        }
      }, 
    });

    game.propertys = game.propertys.map((property) => {
      if(!property.owner){
      return property

      }
      if (property.owner.id === playerId) {
        property.owner = null; 
      }

      return property
    })
  
    game.users = game.users.filter((user) => user.id !== playerId);
  
    const updatedGame = await this.gameRepository.save(game);
  
    return updatedGame.toDto(); 
  }


  


  async addUserToGame(gameId: Uuid, user: UserDto) {
    
    const game = await this.gameRepository
      .createQueryBuilder("game")
      .leftJoinAndSelect("game.users", "user")
      .where("game.id = :id", { id: gameId })
      .getOne();
    

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const userEntity: UserEntity = new UserEntity();
    Object.assign(userEntity, user); 
    game.users = [...game.users, userEntity];

    return await this.gameRepository.save(game).then((result) => result.toDto()); 
  
  
  }
  constructor(
    @InjectRepository(GameEntity)
    private gameRepository: Repository<GameEntity>,
    private readonly colectionService: ColectionService,
    private readonly propertyService: PropertyService,
  ) {}
  async create(createGameDto: CreateGameDto) {
    let colection = await this.colectionService.getColectionSmall(createGameDto.colectionId);
    if (!colection) {
      throw new NotFoundException('Colection not found');
    }
    const propertys = await this.propertyService.createManyFromColectiion(createGameDto.colectionId);

    const game = this.gameRepository.create({ colection, propertys });
    return this.gameRepository.save(game).then((game) => game.toDto());
  }

  findAll() {
    return `This action returns all game`;
  }

  findOne(id: Uuid) {
    return this.gameRepository.findOne({
      where: { id: id },
      relations: {
        colection: {
          setings:true,
        },
      }
    }).then((game) => {
      if(game == null) {
        throw new NotFoundException('Game not found');
      }
      return game.toDto()
      });
  }

  update(id: Uuid, updateGameDto: UpdateGameDto) {
    return `This action updates a #${id} game, ${updateGameDto}`;
  }

  remove(id: number) {
    return `This action removes a #${id} game`;
  }
}
