// src/types/gameTypes.ts

export type Uuid = string;  // Припущення: Uuid — це string, якщо у тебе інше — поправ.

export class AbstractDto {
  id!: Uuid;
  createdAt!: Date;
  updatedAt!: Date;
}

export enum PropertyType {
  STANDART = 'STANDART',
  FOURTYPE = 'FOURTYPE',
  DiCETYPE = 'DICETYP',
  PRISON = 'PRISON',
  GO_TO_PRISON = 'GO_TO_PRISON',
  CHANCHE = 'CHANCE',
  COMUNITY_CHEST = 'COMUNITY_CHEST'
}

export enum PropertyStatyses {
  NORMAL = "normal",
  MORTGAGE = "mortgage",
}

export enum GameStatuses {
  WITING_PLAYERS = 'waiting_players',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
  ABORTED = 'aborted',
}

export enum ComunityChestTypes {
  MONEY_BY_PROPERTY = 'money_by_property',
  MONEY_BY_BOTH_BUILDING = 'money_by_both_building',
  MONEY_BY_HOUSE = 'money_by_house',
}

export enum ChanceCardTypes {
  PAY_SINGLE = 'pay_single',
  ALL_PAY_ME = 'all_pay_me',
  GO_TO_JAIL = 'go_to_jail',
  GET_OUT_JAIL = 'get_out_jail',
  GO_AND_WAIT = 'go_and_wait',
  GO_WHERE_PLAYER_WANT = 'go_where_player_want',
}

export class UserDto extends AbstractDto {
  username?: string;
  money!: number;
  properties!: PropertyDto[];
  game!: GameDto;
  role!: RoleType;
  inJail!: boolean;
  doublesCount!: number;
  getOutOfJailCard!: boolean;
  JailTime!: number;
}

export class SetingsDto extends AbstractDto {
  timeForturn!: number;
  moneyForLap!: number;
  bostercube!: boolean;
  auction!: boolean;
  starterMoney!: number;
}

export class PropertyCardDto extends AbstractDto {
  name!: string;
  type!: PropertyType;
  price!: number;
  street!: string;
  upgradePrice!: number;
  rent!: number;
  rentAllStreet!: number;
  rentWithOneHouse!: number;
  rentWithTwoHouse!: number;
  rentWithThreeHouse!: number;
  rentWithFourHouse!: number;
  rentWithHotel!: number;
}

export class PropertyDto extends AbstractDto {
  property!: PropertyCardDto;
  propertyType!: PropertyStatyses;
  owner?: UserDto | null;
  upgradeCount!: number;
  game!: GameDto;
}

export class GameDto extends AbstractDto {
  users!: UserDto[];
  propertys!: PropertyDto[];
  colection!: ColectionDto;
  status!: GameStatuses;
  turnOrder!: Uuid[];
  currentTurn!: number;
}

export class ComunityChestDto extends AbstractDto {
  description!: string;
  type!: ComunityChestTypes;
  moneyForProperty!: number;
  propertys!: string[];
  moneyForHotel!: number;
  is_Hotels!: boolean;
  moneyForHouse!: number;
  is_Houses!: boolean;
  colection!: ColectionEntity;
}

export class ColectionDto extends AbstractDto {
  name!: string;
  setings!: SetingsDto;
  propertyCards!: PropertyCardDto[];
  comunityChests!: ComunityChestDto[];
  chanceCards!: chanceCardDto[];
}

export class chanceCardDto extends AbstractDto {
  description!: string;
  type!: ChanceCardTypes;
  money!: number;
  destination!: string;
  colection!: ColectionDto;
}

// Якщо RoleType і ColectionEntity в тебе визначені десь окремо, імпортуй їх сюди або оголоси тут
export type RoleType = 'player' | 'admin' | 'guest'; // приклад, заміни на свій тип
export type ColectionEntity = any; // заміни на реальний тип
