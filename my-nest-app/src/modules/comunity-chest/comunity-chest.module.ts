import { Module } from '@nestjs/common';
import { ComunityChestService } from './comunity-chest.service';
import { ComunityChestController } from './comunity-chest.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComunityChestEntity } from './entities/comunity-chest.entity';
import { ColectionModule } from '../../modules/colections/colection.module';

@Module({
  controllers: [ComunityChestController],
  providers: [ComunityChestService],
  imports: [TypeOrmModule.forFeature([ComunityChestEntity]), ColectionModule],
  exports: [ComunityChestService],  
})
export class ComunityChestModule {}
