import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyEntity } from './entities/property.entity';
import { PropertyCardsModule } from '../../modules/property-cards/property-cards.module';

@Module({
  providers: [PropertyService],
  imports: [PropertyCardsModule, TypeOrmModule.forFeature([PropertyEntity])],
})
export class PropertyModule {}
