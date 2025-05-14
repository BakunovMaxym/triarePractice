import { Module } from '@nestjs/common';
import { ChanceCardsService } from './chance-cards.service';
import { ChanceCardsController } from './chance-cards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChanceCardEntity } from './entities/chance-card.entity';
import { ColectionModule } from '../../modules/colections/colection.module';

@Module({
  controllers: [ChanceCardsController],
  providers: [ChanceCardsService],
  imports: [TypeOrmModule.forFeature([ChanceCardEntity]), ColectionModule],
  exports: [ChanceCardsService],
})
export class ChanceCardsModule {}
