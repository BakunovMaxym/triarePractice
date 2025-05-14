import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { ColectionModule } from '../../modules/colections/colection.module';
import { PropertyCardsModule } from '../../modules/property-cards/property-cards.module';
import { PropertyModule } from '../../modules/property/property.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntity } from './entities/game.entity';
import { AuthModule } from '../../modules/auth/auth.module';
import { UserModule } from '../../modules/user/user.module';
import { WsAuthGuard } from './ws-auth.guard';
import { SetingsModule } from '../../modules/setings/setings.module';
import { GameController } from './game.controller';
import { ChanceCardsModule } from '../../modules/chance-cards/chance-cards.module';
import { ComunityChestModule } from '../../modules/comunity-chest/comunity-chest.module';

@Module({
  providers: [GameGateway, GameService, WsAuthGuard],
  imports: [ColectionModule,
    PropertyCardsModule,
    PropertyModule,
    AuthModule,
    UserModule,
    SetingsModule,
    ChanceCardsModule,
    ComunityChestModule,
    UserModule,
    TypeOrmModule.forFeature([GameEntity]),
    ],
  controllers: [GameController],
})
export class GameModule {}

