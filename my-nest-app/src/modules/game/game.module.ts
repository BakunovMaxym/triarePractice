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

@Module({
  providers: [GameGateway, GameService,WsAuthGuard],
  imports: [ColectionModule,
    PropertyCardsModule,
    PropertyModule,
    TypeOrmModule.forFeature([GameEntity]),
    AuthModule,
    UserModule],
})
export class GameModule {}
