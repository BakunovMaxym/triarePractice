import { Module } from '@nestjs/common';
import { TurnsService } from './turns.service';
import { TurnsController } from './turns.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TurnEntity } from './entities/turn.entity';

@Module({
  controllers: [TurnsController],
  providers: [TurnsService],
  imports: [TypeOrmModule.forFeature([TurnEntity])],
  exports: [TurnsService]
})
export class TurnsModule {}
