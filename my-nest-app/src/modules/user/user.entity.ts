import { Column, Entity, ManyToOne, OneToMany, type Relation } from 'typeorm';
import { AbstractEntity } from '../../common/abstract.entity.ts';
import { UseDto } from '../../decorators/use-dto.decorator.ts';
import { UserDto } from './dtos/user.dto.ts';
import { PropertyEntity } from '../../modules/property/entities/property.entity.ts';
import { GameEntity } from '../../modules/game/entities/game.entity.ts';

@Entity({ name: 'users' })
@UseDto(UserDto)
export class UserEntity extends AbstractEntity<UserDto> {
  @Column({ nullable: false, type: 'varchar' })
  username!: string ;

  @Column({ nullable: false, type: 'integer' })
  money!: number ;

  @OneToMany(()=> PropertyEntity, (property) => property.owner)
  properties!: Relation<PropertyEntity[]>;

  @ManyToOne(() => GameEntity, (game) => game.users)
  game!: Relation<GameEntity>;

}
