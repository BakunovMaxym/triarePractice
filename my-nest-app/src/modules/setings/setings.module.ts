import { Module } from '@nestjs/common';
import { SetingsService } from './setings.service.ts';
import { SetingsController } from './setings.controller';
import { SetingsEntity } from './setings.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([SetingsEntity])],
  providers: [SetingsService],
  controllers: [SetingsController],
  exports: [SetingsService],
})
export class SetingsModule {}
