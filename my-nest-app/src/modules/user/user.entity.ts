import { Column, Entity, ManyToOne, OneToMany, type Relation } from 'typeorm';
import { AbstractEntity } from '../../common/abstract.entity.ts';
import { UseDto } from '../../decorators/use-dto.decorator.ts';
import { UserDto } from './dtos/user.dto.ts';
import { PropertyEntity } from '../../modules/property/entities/property.entity.ts';
import { GameEntity } from '../../modules/game/entities/game.entity.ts';
import { RoleType } from '../../constants/role-type.ts';

@Entity({ name: 'users' })
@UseDto(UserDto)
export class UserEntity extends AbstractEntity<UserDto> {
  @Column({ nullable: false, type: 'varchar' })
  username!: string ;

  @Column({ nullable: false, type: 'integer' })
  money!: number ;

  @OneToMany(()=> PropertyEntity, (property) => property.owner, )
  properties!: Relation<PropertyEntity[]>;

  @ManyToOne(() => GameEntity, (game) => game.users)
  game!: Relation<GameEntity>;

  @Column({ nullable:false, type: 'enum', enum: RoleType, default: RoleType.USER })
  role!: RoleType

  @Column({nullable:false, type:'boolean', default: false})
  inJail!: Boolean;

  @Column({nullable:false, type: 'integer', default: 0})
  doublesCount!: number

  @Column({nullable:false, type:'boolean', default: false})
  isDouble!: Boolean;

  @Column({nullable:false, type:'boolean', default: false})
  getOutOfJailCard!: Boolean;

  @Column({nullable:false, type:'integer', default: 0})
  JailTime!: number;
}
