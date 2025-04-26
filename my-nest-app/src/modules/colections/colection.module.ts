import { Module } from '@nestjs/common';
import { ColectionController } from './colection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColectionEntity } from './colection.entity';
import { ColectionService } from './colection.service.ts';
import { SetingsModule } from '../../modules/setings/setings.module.ts';
import { PropertyCardEntity } from '../../modules/property-cards/entities/property-card.entity.ts';

@Module({
  imports: [TypeOrmModule.forFeature([ColectionEntity]), SetingsModule, PropertyCardEntity ],
  controllers: [ColectionController],
  providers: [ColectionService],
  exports: [ColectionService],
  
})
export class ColectionModule {}
