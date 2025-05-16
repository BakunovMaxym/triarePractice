import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ColectionService } from '../../modules/colections/colection.service';
import { Repository } from 'typeorm';
import { GameEntity } from './entities/game.entity';
import type { CreateGameDto } from './dto/create-game.dto';
import { PropertyService } from '../../modules/property/property.service';
import type { UserDto } from '../../modules/user/dtos/user.dto';
import { UserEntity } from '../../modules/user/user.entity';
import { GameStatuses } from './enums/game-status.enum';
import { GameDto } from './dto/game.dto';
import type { CreateSetingsDto } from '../../modules/setings/dtos/createSetings.dto';
import { SetingsService } from '../../modules/setings/setings.service';
import { PropertyCardsService } from '../../modules/property-cards/property-cards.service';
import { ComunityChestService } from '../../modules/comunity-chest/comunity-chest.service';
import { ChanceCardsService } from '../../modules/chance-cards/chance-cards.service';

import type { PropertyDto } from '../../modules/property/dto/property.dto';
import { PropertyType } from '../../modules/property-cards/PropertyType';
import { ComunityChestTypes } from '../../modules/comunity-chest/enum/comynity-chest-types.enum';
import { ChanceCardTypes } from '../../modules/chance-cards/enum/chance-card-types.enum';
import { UserService } from '../../modules/user/user.service';
import { PropertyStatyses } from '../../modules/property/ProprtyStatyses';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class GameService {

  async deleteGame(gameId: Uuid) {
    const game = await this.findOne(gameId);
    game.status = GameStatuses.ABORTED;
    await this.gameRepository.save(game);

  }

  constructor(
    @InjectRepository(GameEntity)
    private gameRepository: Repository<GameEntity>,
    private readonly colectionService: ColectionService,
    private readonly propertyService: PropertyService,
    private setingsService: SetingsService,
    private readonly propertyCardService: PropertyCardsService,
    private readonly comunityChestService: ComunityChestService,
    private readonly chanceCardsService: ChanceCardsService,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,

  ) {
    console.log('EventEmitter2 injected:', !!eventEmitter);
  }

  getGame(id: Uuid) {
    return this.gameRepository.findOneOrFail({
      where: {
        id
      },
      relations: {
        users: true,
        propertys: {
          property: true,
          owner: true,
        },
        colection: {
          setings: true
        }
      }
    }).then((game) => { return game.toDto() });
  }

  async kickFromGame(gameId: Uuid, playerId: Uuid) {
    const game = await this.gameRepository.findOneOrFail({
      where: { id: gameId },
      relations: {
        users: true,
        propertys: {
          owner: true,
        }
      },
    });

    game.propertys = game.propertys.map((property) => {
      if (!property.owner) {
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

  async create(createGameDto: CreateGameDto) {
    let colection = await this.colectionService.getColectionSmall(createGameDto.colectionId);
    if (!colection) {
      throw new NotFoundException('Colection not found');
    }

    const game = this.gameRepository.create({ colection });
    return this.gameRepository.save(game).then((game) => game.toDto());
  }

  findAll() {
    return `This action returns all game`;
  }

  findOne(id: Uuid) {
    return this.gameRepository.findOne({
      where: { id: id },
      relations: {
        propertys: true,
        users: true,
        colection: {
          setings: true,
        },
      }
    }).then((game) => {
      if (game == null) {
        throw new NotFoundException('Game not found');
      }
      return game.toDto()
    });
  }

  ChangeStatus(game: GameDto, status: GameStatuses) {
    game.status = status;
    return this.gameRepository.save(game).then((game) => game.toDto());
  }

  async UpdateSettings(game: GameDto, settings: CreateSetingsDto) {
    const newSettings = await this.setingsService.createSetings(settings);

    const newColection = await this.colectionService.createColection({ name: game.colection.name, setings_id: newSettings.id })

    const propertys = await this.propertyCardService.clone(game.colection.id, newColection.id);
    const chancecards = await this.chanceCardsService.clone(game.colection.id, newColection.id);
    const comunityChests = await this.comunityChestService.clone(game.colection.id, newColection.id)

    console.log("propetyyd", propertys)
    console.log("chancecards", chancecards)
    console.log("comunityChests", comunityChests)

    game.colection = newColection;


    await this.gameRepository.save(game)

    const colection = await this.colectionService.getColection(game.colection.id);
    return colection;
  }

  async GetDiceRoll(gameId: Uuid) {
    const firstCube = Math.floor(Math.random() * 6) + 1
    const secondCube = Math.floor(Math.random() * 6) + 1

    const game: GameDto = await this.findOne(gameId);

    if (game.colection.setings.bostercube) {
      const boosterCube = Math.floor(Math.random() * 6) + 1
      return { firstCube, secondCube, boosterCube }

    }
    return { firstCube, secondCube }
  }

  async startGame(game: GameDto) {
    game = await this.gameRepository.findOneOrFail({ where: { id: game.id }, relations: { users: true, colection: { propertyCards: true, chanceCards: true, comunityChests: true, setings: true } } }).then((game) => game.toDto())
    game.status = GameStatuses.IN_PROGRESS;

    const turnOrder = await Promise.all(
      game.users.map(async (user) => {
        const diceRoll = await this.GetDiceRoll(game.id);
        const total = diceRoll.firstCube + diceRoll.secondCube;
        return { user, diceRoll, total };
      })
    );

    game.users.forEach((user) => {
      user.money = game.colection.setings.starterMoney
      this.userService.save(user)
    })

    turnOrder.sort((a, b) => b.total - a.total);

    game.turnOrder = turnOrder.map((item) => item.user.id);

    const propertys = await this.propertyService.createManyFromColectiion(game.colection.id);
    game.propertys = propertys;

    await this.gameRepository.save(game);
    console.log("game", game)
    return game;
  }

  async StartTurn(game: GameDto) {
    const user = game.users.filter((user) => user.id === game.turnOrder[(game.currentTurn % game.turnOrder.length)])[0];
    if (!user) {
      throw new NotFoundException('User not found')
    } this.eventEmitter.emit('gameService', {
      room: game.id,
      event: 'YourTurn',
      data: { user: user }
    })
    user.doublesCount = 0;
    this.userService.save(user);
  }

  async ThrowDice(game: GameDto) {
    const user = game.users.filter((user) => user.id === game.turnOrder[(game.currentTurn % game.turnOrder.length)])[0];

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const diceRoll = await this.GetDiceRoll(game.id);
    const dable = diceRoll.firstCube === diceRoll.secondCube;
    user.doublesCount++;
    if (user.doublesCount === 3) {
      user.JailTime = 3;
      this.eventEmitter.emit('gameService', {
        room: user.id,
        event: 'GoToJail',
      })
    }
    console.log('dice rool', game.id, { diceRoll, user: user, dable })
    this.eventEmitter.emit('gameService', {
      room: game.id,
      event: 'diceRolled',
      data: { diceRoll, user: user, dable }
    })


    await this.gameRepository.save(game);
    this.userService.save(user);
  }

  async LandOnProperty(game: GameDto, propertyId: Uuid, player: UserDto) {
    const property: PropertyDto = await this.propertyService.findOne(propertyId);
    if (!property) {
      throw new NotFoundException('Property not found')
    }
    if (property.property.type === PropertyType.CHANCHE ||
      property.property.type === PropertyType.COMUNITY_CHEST ||
      property.property.type === PropertyType.GO_TO_PRISON ||
      property.property.type === PropertyType.PRISON) {
      switch (property.property.type) {
        case PropertyType.CHANCHE:
          const chanceCards = await this.chanceCardsService.findAllByColectionId(game.colection.id);
          const chanceCard = chanceCards[Math.floor(Math.random() * chanceCards.length)]
          if (!chanceCard) {
            throw new NotFoundException('chance card not found')
          }
          this.eventEmitter.emit('gameService', {
            room: game.id,
            event: 'ChanceCard',
            data: { description: chanceCard.description }
          })

          switch (chanceCard.type) {
            case ChanceCardTypes.ALL_PAY_ME:
              game.users.forEach((user) => {
                if (user.id !== player.id) {
                  this.eventEmitter.emit('gameService', {
                    room: user.id,
                    event: 'Invoice',
                    data: { type: 'chanceCard', cost: chanceCard.money }
                  })
                }
              })
              this.eventEmitter.emit('gameService', {
                room: player.id,
                event: 'Invoice',
                data: { type: 'chanceCard', cost: chanceCard.money * (game.users.length - 1) }
              })
              break;
            case ChanceCardTypes.PAY_SINGLE:
              this.eventEmitter.emit('gameService', {
                room: player.id,
                event: 'Invoice',
                data: { type: 'chanceCard', cost: chanceCard.money }
              })
              break;
            case ChanceCardTypes.GO_TO_JAIL:
              player.JailTime = 3;
              this.eventEmitter.emit('gameService', {
                room: player.id,
                event: 'GoToJail',
              })
              break;

            case ChanceCardTypes.GET_OUT_JAIL:
              if (!player.getOutOfJailCard) {
                player.getOutOfJailCard = true;
                this.eventEmitter.emit('gameService', {
                  room: player.id,
                  event: 'GetOutOfJailCard',
                  data: { count: player.getOutOfJailCard }
                })
              }
              else {
                this.eventEmitter.emit('gameService', {
                  room: player.id,
                  event: 'GetOutOfJailCardFull',
                })
              }
              break;
            case ChanceCardTypes.GO_AND_WAIT:
              this.eventEmitter.emit('gameService', {
                room: player.id,
                event: 'GoToProperty',
                data: { property: chanceCard.destination }
              })
              break;

            case ChanceCardTypes.GO_WHERE_PLAYER_WANT:
              this.eventEmitter.emit('gameService', {
                room: player.id,
                event: 'ChoseDestination',
                data: { cost: chanceCard.money }
              })

          }
          break;
        case PropertyType.COMUNITY_CHEST:
          const comunityChests = await this.comunityChestService.findAllFromColection(game.colection.id);
          const randomIndex = Math.floor(Math.random() * comunityChests.length);
          const comunityChestCard = comunityChests[randomIndex];
          this.eventEmitter.emit('gameService', {
            room: game.id,
            event: 'userComunityCardLost',
            data: { description: comunityChestCard?.description }
          })

          const usersMoney = new Map<Uuid, number>()

          switch (comunityChestCard?.type) {
            case ComunityChestTypes.MONEY_BY_PROPERTY:
              game.propertys.forEach((property) => {
                if (property.owner && comunityChestCard.propertys.includes(property.property.name)) {
                  const userMoney = usersMoney.get(property.owner.id);
                  if (userMoney) {
                    usersMoney.set(property.owner.id, userMoney + comunityChestCard.moneyForProperty)
                  }
                  else {
                    usersMoney.set(property.owner.id, comunityChestCard.moneyForProperty)
                  }
                }
              })

              usersMoney.forEach((value, key) => {
                this.eventEmitter.emit('gameService', {
                  room: key,
                  event: 'Invoice',
                  data: { type: "comunityChest", cost: value }
                })
              })
              break;

            case ComunityChestTypes.MONEY_BY_HOUSE:
              game.propertys.forEach((property) => {
                if (property.owner && property.upgradeCount != 5) {
                  const userMoney = usersMoney.get(property.owner.id);
                  if (userMoney) {
                    usersMoney.set(property.owner.id, userMoney + comunityChestCard.moneyForHouse * property.upgradeCount)
                  }
                  else {
                    usersMoney.set(property.owner.id, comunityChestCard.moneyForHouse * property.upgradeCount)
                  }
                }
              })

              usersMoney.forEach((value, key) => {
                this.eventEmitter.emit('gameService', {
                  room: key,
                  event: 'Invoice',
                  data: { type: "comunityChest", cost: value }
                })
              })
              break;

            case ComunityChestTypes.MONEY_BY_BOTH_BUILDING:
              game.propertys.forEach((property) => {
                if (property.owner) {
                  const userMoney = usersMoney.get(property.owner.id);
                  if (userMoney) {
                    if (property.upgradeCount === 5) {
                      usersMoney.set(property.owner.id, userMoney + comunityChestCard.moneyForHotel)

                    } else {
                      usersMoney.set(property.owner.id, userMoney + comunityChestCard.moneyForHouse * property.upgradeCount)

                    }
                  }
                  else {
                    if (property.upgradeCount === 5) {
                      usersMoney.set(property.owner.id, comunityChestCard.moneyForHotel)

                    } else {
                      usersMoney.set(property.owner.id, comunityChestCard.moneyForHouse * property.upgradeCount)

                    }
                  }
                }
              })

              usersMoney.forEach((value, key) => {
                this.eventEmitter.emit('gameService', {
                  room: key,
                  event: 'comunityChest',
                  data: { type: "comunityChest", cost: value }
                })
              })
              break;

          }
          break;
        case PropertyType.GO_TO_PRISON:
          player.JailTime = 3;
          this.eventEmitter.emit('gameService', {
            room: player.id,
            event: 'GoToJail',
          })
          break;
        case PropertyType.PRISON:
          break;
        default:
          break;
      }
    }
    else {
      if (property.owner && property.propertyType !== PropertyStatyses.MORTGAGE) {
        let sum;
        let sameTypeCount: number = 0;

        switch (property.property.type) {
          case PropertyType.STANDART:
            switch (property.upgradeCount) {
              case 1:
                sum = property.property.rentWithOneHouse
                break;
              case 2:
                sum = property.property.rentWithTwoHouse
                break;
              case 3:
                sum = property.property.rentWithThreeHouse
                break;
              case 4:
                sum = property.property.rentWithFourHouse
                break;
              case 5:
                sum = property.property.rentWithHotel
                break;
              default:
                sum = property.property.rent
                break;
            }
            break;
          case PropertyType.FOURTYPE:
            const propertiesForFourType = await this.propertyService.getUserProperties(property.owner.id);
            propertiesForFourType.forEach((properti) => {
              if (properti.property.type === PropertyType.FOURTYPE) {
                sameTypeCount++;
              }
            })

            switch (sameTypeCount) {
              case 1:
                sum = property.property.rent
                break;
              case 2:
                sum = property.property.rentWithOneHouse
                break;
              case 3:
                sum = property.property.rentWithTwoHouse
                break;
              case 4:
                sum = property.property.rentWithThreeHouse
                break;
              default:
                sum = property.property.rent
                break;
            }



            break;

          case PropertyType.DiCETYPE:
            const propertiesForDiceType = await this.propertyService.getUserProperties(property.owner.id);
            propertiesForDiceType.forEach((properti) => {
              if (properti.property.type === PropertyType.DiCETYPE) {
                sameTypeCount++;
              }
            })

            switch (sameTypeCount) {
              case 1:
                sum = property.property.rent
                break;
              case 2:
                sum = property.property.rentWithOneHouse
                break;
              default:
                sum = property.property.rent
                break;
            }
            break;


        }
        this.eventEmitter.emit('gameService', {
          room: player.id,
          event: 'Invoice',
          data: { type: "rent", cost: sum, propertyType: property.property.type }
        })
      }
      else {
        console.log(property)

        this.eventEmitter.emit('gameService', {
          room: player.id,
          event: 'CanBuy',
          data: { property }
        })
      }
    }
    await this.userService.save(player);
  }

  async PayInvoice(user: UserDto, cost: number, invoiceId: Uuid) {
    if (user.money + cost < 0) {

      this.eventEmitter.emit('gameService', {
        room: user.id,
        event: 'error',
        data: { type: 'failedInvoice', id: invoiceId, description: "not enough money" }
      })
    }
    else {
      console.log('start usr\n', user)
      console.log(cost)

      user.money += cost;

      this.eventEmitter.emit('gameService', {
        room: user.id,
        event: 'InvoiceComplete',
        data: { id: invoiceId }
      })
      this.userService.save(user);
    }
  }

  async BuyProperty(user: UserDto, propertyId: Uuid) {
    const property = await this.propertyService.findOne(propertyId);
    property.owner = user;

    this.propertyService.save(property);
    this.eventEmitter.emit('gameService', {
      room: user.game.id,
      event: 'PropertyBought',
      data: { property }
    })

  }

  async UseGetOutofJailCard(user: UserDto) {
    if (user.getOutOfJailCard) {
      user.getOutOfJailCard = false;
      user.JailTime = 0;
      this.eventEmitter.emit('gameService', {
        room: user.id,
        event: 'JailTime',
        data: { JailTime: user.JailTime }
      })

    }
    else {
      this.eventEmitter.emit('gameService', {
        room: user.id,
        event: 'error',
        data: { description: 'you dont have an get out of jail card' }
      })

    }
  }

  async UpgradeProperty(user: UserDto, propertyId: Uuid) {
    const property = await this.propertyService.findOne(propertyId)
    if (!property.owner || property.owner.id !== user.id || property.upgradeCount === 5) {
      this.eventEmitter.emit('gameService', {
        room: user.id,
        event: 'error',
        data: { desription: 'you can not upgrade this property' }
      })

      return;
    }

    property.upgradeCount++;
    this.eventEmitter.emit('gameService', {
      room: user.game.id,
      event: 'propertyUpgraded',
      data: { property }
    })


    this.propertyService.save(property)

  }

  async EndTurn(user: UserDto) {
    let game: GameDto = await this.findOne(user.game.id)
    if (user.JailTime !== 0) {
      game.currentTurn++;

    }
    else {
      if (user.doublesCount === 0) {
        game.currentTurn++;

      }
    }
    await this.gameRepository.save(game)
    this.StartTurn(user.game)
  }
  async GiveUp(game: GameDto, user: UserDto) {
    game.turnOrder.filter(filteredUser => user.id !== filteredUser);
    game.currentTurn--;
    this.eventEmitter.emit('gameService', {
      room: game.id,
      event: 'userLost',
      data: { user }
    })

    await this.gameRepository.save(game);
  }
}
