import { Module } from '@nestjs/common';
import { PropertyCardsService } from './property-cards.service';
import { PropertyCardsController } from './property-cards.controller';
import { ColectionModule } from '../../modules/colections/colection.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyCardEntity } from './entities/property-card.entity';

@Module({
  controllers: [ PropertyCardsController, ],
  providers: [PropertyCardsService],
  imports: [ColectionModule, TypeOrmModule.forFeature([PropertyCardEntity])],
  exports: [PropertyCardsService],
})
export class PropertyCardsModule {}
