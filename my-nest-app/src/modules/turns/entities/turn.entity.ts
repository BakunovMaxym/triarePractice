import { AbstractEntity } from "../../../common/abstract.entity";
import { UseDto } from "../../../decorators/use-dto.decorator";
import { GameEntity } from "../../../modules/game/entities/game.entity";
import type { PropertyEntity } from "../../../modules/property/entities/property.entity";
import { UserEntity } from "../../../modules/user/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { TurnDto } from "../dto/turn.dto";

@Entity({ name: 'turns' })
@UseDto(TurnDto)
export class TurnEntity extends AbstractEntity<TurnDto>{

    @ManyToOne(() => GameEntity, (gameEntity) => gameEntity.id)
    game!: GameEntity;

    @ManyToOne(() => UserEntity, (userEntity) => userEntity.id)
    user!: UserEntity;

    @Column({type:'json'})
    propertys!: PropertyEntity[];

    @Column({type: 'json'})
    users!: UserEntity[];
}
